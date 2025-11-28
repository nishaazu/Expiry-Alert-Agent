import { MOCK_MATERIALS } from "../constants";
import { RawMaterial, ScanResult, ScanResultDetail, Status } from "../types";
import { generateScanSummary } from "./geminiService";

// In-memory store simulating the DB
let dbMaterials: RawMaterial[] = JSON.parse(JSON.stringify(MOCK_MATERIALS));

const calculateStatus = (expiryDateStr: string): Status => {
  const today = new Date();
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return Status.EXPIRED;
  if (diffDays <= 15) return Status.WARNING; // Urgent warning
  if (diffDays <= 30) return Status.WARNING;
  return Status.SAFE;
};

const getDaysUntil = (expiryDateStr: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getMaterials = async (): Promise<RawMaterial[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...dbMaterials]), 300); // Simulate network latency
  });
};

export const runDailyScan = async (): Promise<ScanResult> => {
  const timestamp = new Date().toISOString();
  const updates: ScanResultDetail[] = [];
  const scannedCount = dbMaterials.length;

  // 1. Logic Processing
  const tempUpdates: ScanResultDetail[] = [];

  dbMaterials = dbMaterials.map((material) => {
    const daysUntil = getDaysUntil(material.expiry_date);
    const newStatus = calculateStatus(material.expiry_date);
    const oldStatus = material.agent_status;

    // Simulate rule: Only update if status actually changed
    // Note: For demo purposes, we might want to capture materials that ARE in warning even if they didn't JUST change, 
    // but the prompt strictly says "UPDATE materials that changed status". 
    // However, to make the demo interesting, we will capture any material that is NOT SAFE as an "incident" if the previous state wasn't exactly the same, 
    // or if we want to show the Alert generation.
    // Let's strictly follow the prompt: Change of status triggers update.
    
    if (newStatus !== oldStatus) {
       tempUpdates.push({
         material_id: material.material_id,
         material_name: material.name,
         old_status: oldStatus,
         new_status: newStatus,
         days_until_expiry: daysUntil,
         action_needed: "Analyzing...", // Placeholder for AI
       });
       return { ...material, agent_status: newStatus };
    }
    
    return material;
  });

  // 2. AI Enrichment (Simulating the Alert Generation Agent)
  const aiResult = await generateScanSummary(scannedCount, tempUpdates);
  
  // Merge AI actions into updates
  const finalUpdates = tempUpdates.map(u => ({
    ...u,
    action_needed: aiResult.actionItems[u.material_id] || getDefaultAction(u.new_status, u.days_until_expiry)
  }));

  return {
    scan_timestamp: timestamp,
    materials_scanned: scannedCount,
    materials_updated: finalUpdates,
    summary: aiResult.summary
  };
};

const getDefaultAction = (status: string, days: number) => {
    if (status === 'EXPIRED') return "Stop usage immediately. Quarantine item.";
    if (status === 'WARNING' && days < 15) return "Urgent renewal required.";
    return "Schedule renewal discussion.";
};

export const resetMockData = () => {
    dbMaterials = JSON.parse(JSON.stringify(MOCK_MATERIALS));
}
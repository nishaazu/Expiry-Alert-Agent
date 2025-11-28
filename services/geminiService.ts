import { GoogleGenAI } from "@google/genai";
import { ScanResultDetail } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found in environment");
    throw new Error("API_KEY not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateScanSummary = async (
  totalScanned: number,
  updatedMaterials: ScanResultDetail[]
): Promise<{ summary: string; actionItems: Record<number, string> }> => {
  try {
    const ai = getClient();
    
    // If no updates, return generic response to save tokens/latency
    if (updatedMaterials.length === 0) {
      return {
        summary: `Scanned ${totalScanned} materials. No status changes detected. All certificates are within their current validity parameters.`,
        actionItems: {}
      };
    }

    const prompt = `
      You are the "Halal Audit Agent" for Hotel Seri Malaysia.
      You just performed
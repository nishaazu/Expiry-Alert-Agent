export enum Status {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  EXPIRED = 'EXPIRED',
  UNKNOWN = 'UNKNOWN'
}

export interface RawMaterial {
  material_id: number;
  outlet_id: number;
  name: string;
  supplier: string;
  category: string;
  is_critical: boolean;
  agent_status: Status; // The current status in DB
  halal_certificate_id: string;
  expiry_date: string; // ISO Date string
}

export interface ScanResultDetail {
  material_id: number;
  material_name: string;
  old_status: string;
  new_status: string;
  days_until_expiry: number;
  action_needed: string;
}

export interface ScanResult {
  scan_timestamp: string;
  materials_scanned: number;
  materials_updated: ScanResultDetail[];
  summary: string;
}

export interface DashboardStats {
  total: number;
  safe: number;
  warning: number;
  expired: number;
}
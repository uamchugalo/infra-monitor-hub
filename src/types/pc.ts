export type PCStatus = "online" | "warning" | "offline";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface PC {
  id: string | number;
  name: string;
  ip?: string;
  mac: string;
  switchId?: string;
  switchPort?: string;
  status: PCStatus;
  enabled?: boolean;
  history: HistoryEntry[];
}

export interface LabLog {
  id: string;
  timestamp: string;
  message: string;
  labId?: string;
}

export interface LabData {
  pcs: PC[];
  logs: LabLog[];
}

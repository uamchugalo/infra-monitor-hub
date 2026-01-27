export type PCStatus = 'online' | 'warning' | 'offline';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface PC {
  id: number;
  name: string;
  mac: string;
  status: PCStatus;
  history: HistoryEntry[];
}

export interface LabLog {
  id: string;
  timestamp: string;
  message: string;
}

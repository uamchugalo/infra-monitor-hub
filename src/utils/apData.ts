export interface AccessPoint {
  id: string;
  name: string;
  ip: string;
  location: string;
  switchId?: string;
  switchPort?: string;
}

export const ACCESS_POINTS: AccessPoint[] = []; // Zerado

export interface PortLabel {
    port: number;
    label: string;
    description?: string;
}

export interface NetworkSwitch {
    id: string;
    name: string;
    location: string;
    totalPorts: number;
    ip?: string;
    enabled?: boolean;
    labels?: PortLabel[];
    order?: number;
}

export const SWITCHES: NetworkSwitch[] = []; // Zerado para cadastro manual

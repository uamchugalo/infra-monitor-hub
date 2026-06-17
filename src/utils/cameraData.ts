export interface Camera {
    id: string;
    name: string;
    location: string;
    ip: string;
    serial?: string;
    mac: string;
    switchId?: string;
    switchPort?: string;
    status?: string;
}

export const CAMERAS: Camera[] = []; // Zerado

import { PC, PCStatus } from '@/types/pc';

function generateMAC(): string {
  const hex = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 6; i++) {
    mac += hex[Math.floor(Math.random() * 16)];
    mac += hex[Math.floor(Math.random() * 16)];
    if (i < 5) mac += ':';
  }
  return mac;
}

function getRandomStatus(): PCStatus {
  const rand = Math.random();
  if (rand < 0.7) return 'online';
  if (rand < 0.9) return 'warning';
  return 'offline';
}

export function generateInitialPCs(): PC[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    name: `PC-${String(i + 1).padStart(3, '0')}`,
    mac: generateMAC(),
    status: getRandomStatus(),
    history: [],
  }));
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

let broadcastFn: ((data: any) => void) | null = null;

export function setBroadcast(fn: (data: any) => void) {
  broadcastFn = fn;
}

export function broadcast(data: any) {
  if (broadcastFn) broadcastFn(data);
}
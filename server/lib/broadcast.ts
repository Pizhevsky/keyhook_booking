import type { WsEvent } from '../types';

let broadcastFn: ((data: WsEvent) => void) | null = null;

export function setBroadcast(fn: (data: WsEvent) => void): void {
  broadcastFn = fn;
}

export function broadcast(data: WsEvent): void {
  if (!broadcastFn) {
    throw new Error('broadcast() called before setBroadcast() — check startup order in server.ts');
  }
  broadcastFn(data);
}
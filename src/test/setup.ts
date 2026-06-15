import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { vi } from 'vitest';

// jsdom's createObjectURL rejects fake-indexeddb's structured-clone blobs
// (plain objects, not real Blob instances). Force a permissive stub.
let objectUrlSeq = 0;
URL.createObjectURL = vi.fn(() => `blob:mock/${objectUrlSeq++}`);
URL.revokeObjectURL = vi.fn();

// Node's experimental localStorage clobbers jsdom's and lacks clear/removeItem.
// Install a deterministic in-memory implementation for the storage layer.
class MemoryStorage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
}
Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  writable: true,
  configurable: true,
});

global.AudioContext = vi.fn().mockImplementation(() => ({
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  currentTime: 0,
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    type: 'sine',
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  })),
  destination: {},
}));

global.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
global.HTMLMediaElement.prototype.pause = vi.fn();
global.HTMLMediaElement.prototype.load = vi.fn();

Object.defineProperty(window.navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
  configurable: true,
});

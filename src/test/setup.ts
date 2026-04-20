import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

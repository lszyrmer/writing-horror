// Standard WPM definition: 1 word = 5 characters
const CHARS_PER_WORD = 5;
const WINDOW_MS = 30000;
const IDLE_CUTOFF_MS = 5000;

export const SAMPLE_INTERVAL_MS = 500;

interface Sample {
  timestamp: number;
  charCount: number;
}

export class WPMCalculator {
  private samples: Sample[] = [];

  // Call on a fixed interval (e.g. every 500ms), passing current character count
  recordSample(charCount: number) {
    const now = Date.now();
    this.samples.push({ timestamp: now, charCount });
    const cutoff = now - WINDOW_MS;
    this.samples = this.samples.filter(s => s.timestamp > cutoff);
  }

  calculateRollingWPM(): number {
    if (this.samples.length < 2) return 0;

    const newest = this.samples[this.samples.length - 1];
    if (Date.now() - newest.timestamp > IDLE_CUTOFF_MS) return 0;

    const oldest = this.samples[0];
    const charDiff = newest.charCount - oldest.charCount;
    const timeDiffMinutes = (newest.timestamp - oldest.timestamp) / 60000;

    if (timeDiffMinutes === 0 || charDiff <= 0) return 0;

    return Math.round(charDiff / CHARS_PER_WORD / timeDiffMinutes);
  }

  reset() {
    this.samples = [];
  }
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function countChars(text: string): number {
  return text.length;
}

export interface WordEntry {
  timestamp: number;
  wordCount: number;
}

export class WPMCalculator {
  private wordHistory: WordEntry[] = [];
  private readonly WINDOW_SIZE = 10000;

  addEntry(wordCount: number) {
    const now = Date.now();
    this.wordHistory.push({ timestamp: now, wordCount });
    this.cleanOldEntries(now);
  }

  private cleanOldEntries(currentTime: number) {
    const cutoffTime = currentTime - this.WINDOW_SIZE;
    this.wordHistory = this.wordHistory.filter(
      entry => entry.timestamp > cutoffTime
    );
  }

  calculateRollingWPM(): number {
    if (this.wordHistory.length < 2) {
      return 0;
    }

    const now = Date.now();
    this.cleanOldEntries(now);

    const newestEntry = this.wordHistory[this.wordHistory.length - 1];
    const timeSinceLastEntry = (now - newestEntry.timestamp) / 1000;

    if (timeSinceLastEntry > 5) {
      return 0;
    }

    const oldestEntry = this.wordHistory[0];

    const wordDiff = newestEntry.wordCount - oldestEntry.wordCount;
    const timeDiffSeconds = (newestEntry.timestamp - oldestEntry.timestamp) / 1000;

    if (timeDiffSeconds === 0) {
      return 0;
    }

    const wordsPerSecond = wordDiff / timeDiffSeconds;
    const wpm = wordsPerSecond * 60;

    return Math.max(0, Math.round(wpm));
  }

  reset() {
    this.wordHistory = [];
  }
}

export function countWords(text: string): number {
  if (!text.trim()) {
    return 0;
  }
  return text.trim().split(/\s+/).length;
}

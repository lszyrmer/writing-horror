import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WPMCalculator, countWords, countChars } from '../utils/wpmCalculator';

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   ')).toBe(0);
    expect(countWords('\n\n')).toBe(0);
    expect(countWords('\t')).toBe(0);
  });

  it('counts a single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words separated by spaces', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('one two three four five')).toBe(5);
  });

  it('counts words with multiple spaces between them', () => {
    expect(countWords('hello   world')).toBe(2);
  });

  it('counts words with leading and trailing whitespace', () => {
    expect(countWords('  hello world  ')).toBe(2);
  });

  it('counts words with newlines', () => {
    expect(countWords('hello\nworld')).toBe(2);
  });

  it('counts words with tabs', () => {
    expect(countWords('hello\tworld')).toBe(2);
  });

  it('counts words in a realistic paragraph', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    expect(countWords(text)).toBe(9);
  });
});

describe('countChars', () => {
  it('returns 0 for empty string', () => {
    expect(countChars('')).toBe(0);
  });

  it('counts characters including spaces', () => {
    expect(countChars('hello world')).toBe(11);
  });
});

describe('WPMCalculator', () => {
  let calculator: WPMCalculator;
  let now: number;

  beforeEach(() => {
    calculator = new WPMCalculator();
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateRollingWPM', () => {
    it('returns 0 when no samples exist', () => {
      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('returns 0 when only one sample exists', () => {
      calculator.recordSample(50);
      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('calculates WPM: 100 chars over 20 seconds = 60 WPM', () => {
      calculator.recordSample(0);
      vi.setSystemTime(now + 20000);
      calculator.recordSample(100);
      // 100 chars / 5 chars-per-word / (20/60 min) = 60 WPM
      expect(calculator.calculateRollingWPM()).toBe(60);
    });

    it('calculates WPM: 500 chars over 10 seconds = 600 WPM', () => {
      calculator.recordSample(0);
      vi.setSystemTime(now + 10000);
      calculator.recordSample(500);
      // 500 / 5 / (10/60 min) = 600 WPM
      expect(calculator.calculateRollingWPM()).toBe(600);
    });

    it('returns 0 when last sample is more than 5 seconds ago (user paused)', () => {
      calculator.recordSample(0);
      vi.setSystemTime(now + 2000);
      calculator.recordSample(100);
      vi.setSystemTime(now + 8000);

      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('prunes samples older than 30 seconds', () => {
      calculator.recordSample(0);
      vi.setSystemTime(now + 15000);
      calculator.recordSample(150);
      vi.setSystemTime(now + 31000);
      calculator.recordSample(200);

      // oldest (t=0) is pruned; only last two samples remain
      expect(calculator.calculateRollingWPM()).toBeGreaterThan(0);
    });

    it('returns 0 when char count has not increased', () => {
      calculator.recordSample(100);
      vi.setSystemTime(now + 3000);
      calculator.recordSample(100);

      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('returns 0 when char count decreases (net deletion)', () => {
      calculator.recordSample(100);
      vi.setSystemTime(now + 3000);
      calculator.recordSample(50);

      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('returns a rounded integer', () => {
      calculator.recordSample(0);
      vi.setSystemTime(now + 7000);
      calculator.recordSample(65);

      const wpm = calculator.calculateRollingWPM();
      expect(Number.isInteger(wpm)).toBe(true);
    });
  });

  describe('reset', () => {
    it('clears all samples', () => {
      calculator.recordSample(0);
      vi.setSystemTime(now + 3000);
      calculator.recordSample(100);

      calculator.reset();

      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('allows new calculations after reset', () => {
      calculator.recordSample(0);
      vi.setSystemTime(now + 3000);
      calculator.recordSample(100);
      calculator.reset();

      vi.setSystemTime(now + 4000);
      calculator.recordSample(0);
      vi.setSystemTime(now + 24000);
      calculator.recordSample(100);

      // 100 chars / 5 / (20/60 min) = 60 WPM
      expect(calculator.calculateRollingWPM()).toBe(60);
    });
  });
});

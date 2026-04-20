import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WPMCalculator, countWords } from '../utils/wpmCalculator';

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
    it('returns 0 when no entries exist', () => {
      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('returns 0 when only one entry exists', () => {
      calculator.addEntry(10);
      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('calculates WPM correctly with two entries', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 3000);
      calculator.addEntry(10);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBe(200);
    });

    it('calculates WPM correctly over a 5-second window', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 5000);
      calculator.addEntry(25);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBe(300);
    });

    it('returns 0 when last entry is more than 5 seconds ago (user paused)', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 2000);
      calculator.addEntry(20);
      vi.setSystemTime(now + 8000);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBe(0);
    });

    it('cleans entries older than 10 seconds', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 5000);
      calculator.addEntry(30);
      vi.setSystemTime(now + 11000);
      calculator.addEntry(40);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBeGreaterThan(0);
    });

    it('returns 0 when word count difference is zero', () => {
      calculator.addEntry(100);
      vi.setSystemTime(now + 3000);
      calculator.addEntry(100);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBe(0);
    });

    it('returns non-negative WPM', () => {
      calculator.addEntry(50);
      vi.setSystemTime(now + 3000);
      calculator.addEntry(10);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBeGreaterThanOrEqual(0);
    });

    it('returns a rounded integer', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 7000);
      calculator.addEntry(13);

      const wpm = calculator.calculateRollingWPM();
      expect(Number.isInteger(wpm)).toBe(true);
    });

    it('uses only entries within the 10-second rolling window', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 9500);
      calculator.addEntry(50);
      vi.setSystemTime(now + 10500);
      calculator.addEntry(60);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('clears all entries', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 3000);
      calculator.addEntry(20);

      calculator.reset();

      expect(calculator.calculateRollingWPM()).toBe(0);
    });

    it('allows new calculations after reset', () => {
      calculator.addEntry(0);
      vi.setSystemTime(now + 3000);
      calculator.addEntry(20);
      calculator.reset();

      vi.setSystemTime(now + 4000);
      calculator.addEntry(0);
      vi.setSystemTime(now + 7000);
      calculator.addEntry(10);

      const wpm = calculator.calculateRollingWPM();
      expect(wpm).toBe(200);
    });
  });
});

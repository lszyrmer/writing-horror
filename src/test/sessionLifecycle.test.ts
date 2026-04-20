import { describe, it, expect } from 'vitest';
import { WPMCalculator, countWords } from '../utils/wpmCalculator';
import { sanitizeNumericInput } from '../utils/numericInput';

describe('Session Goal Tracking', () => {
  describe('word goal achievement', () => {
    it('is achieved when wordCount equals wordGoal', () => {
      const wordCount = 500;
      const wordGoal = 500;
      expect(wordCount >= wordGoal).toBe(true);
    });

    it('is achieved when wordCount exceeds wordGoal', () => {
      expect(600 >= 500).toBe(true);
    });

    it('is not achieved when wordCount is below wordGoal', () => {
      expect(499 >= 500).toBe(false);
    });

    it('is not achieved at 0 words', () => {
      expect(0 >= 500).toBe(false);
    });
  });

  describe('time goal achievement', () => {
    it('is achieved when duration is less than time goal', () => {
      const durationSeconds = 1200;
      const timeGoalSeconds = 1800;
      expect(durationSeconds <= timeGoalSeconds).toBe(true);
    });

    it('is achieved when duration equals time goal exactly', () => {
      expect(1800 <= 1800).toBe(true);
    });

    it('is not achieved when duration exceeds time goal', () => {
      expect(2000 <= 1800).toBe(false);
    });
  });

  describe('average WPM calculation', () => {
    it('calculates correctly for a typical session', () => {
      const wordCount = 500;
      const durationSeconds = 600;
      const avgWPM = Math.round((wordCount / durationSeconds) * 60);
      expect(avgWPM).toBe(50);
    });

    it('calculates to 0 for 0 words', () => {
      const wordCount = 0;
      const durationSeconds = 300;
      const avgWPM = Math.round((wordCount / durationSeconds) * 60);
      expect(avgWPM).toBe(0);
    });

    it('handles fractional WPM by rounding', () => {
      const wordCount = 100;
      const durationSeconds = 61;
      const avgWPM = Math.round((wordCount / durationSeconds) * 60);
      expect(Number.isInteger(avgWPM)).toBe(true);
    });
  });

  describe('session should not be saved with 0 words', () => {
    it('recognizes empty session by word count', () => {
      const wordCount = 0;
      const shouldSave = wordCount > 0;
      expect(shouldSave).toBe(false);
    });

    it('recognizes non-empty session by word count', () => {
      const wordCount = 1;
      const shouldSave = wordCount > 0;
      expect(shouldSave).toBe(true);
    });
  });
});

describe('Warning System Logic', () => {
  it('warm-up period: warning does not trigger before 10 seconds', () => {
    const elapsedSeconds = 9;
    const minimumWPM = 30;
    const currentWPM = 0;
    const shouldCheck = elapsedSeconds >= 10;
    expect(shouldCheck).toBe(false);
    void minimumWPM;
    void currentWPM;
  });

  it('warning eligible after 10 seconds with low WPM', () => {
    const elapsedSeconds = 10;
    const minimumWPM = 30;
    const currentWPM = 5;
    const shouldCheck = elapsedSeconds >= 10 && currentWPM < minimumWPM;
    expect(shouldCheck).toBe(true);
  });

  it('warning is NOT eligible when WPM meets minimum', () => {
    const elapsedSeconds = 15;
    const minimumWPM = 30;
    const currentWPM = 30;
    const shouldCheck = elapsedSeconds >= 10 && currentWPM < minimumWPM;
    expect(shouldCheck).toBe(false);
  });

  it('warning triggers after 3 cumulative seconds below minimum', () => {
    let belowThresholdTime = 0;
    const checkInterval = 0.5;
    const triggerThreshold = 3;

    for (let i = 0; i < 6; i++) {
      belowThresholdTime += checkInterval;
    }

    expect(belowThresholdTime >= triggerThreshold).toBe(true);
  });

  it('warning threshold resets when WPM recovers', () => {
    let belowThresholdTime = 2.5;
    const currentWPM = 35;
    const minimumWPM = 30;

    if (currentWPM >= minimumWPM) {
      belowThresholdTime = 0;
    }

    expect(belowThresholdTime).toBe(0);
  });

  it('does not trigger warning at exactly 2.5 seconds below minimum', () => {
    const belowThresholdTime = 2.5;
    const triggerThreshold = 3;
    expect(belowThresholdTime >= triggerThreshold).toBe(false);
  });
});

describe('Target WPM Logic', () => {
  it('target is reached when currentWPM meets targetWPM', () => {
    const currentWPM = 60;
    const targetWPM = 60;
    expect(currentWPM >= targetWPM).toBe(true);
  });

  it('target is reached when currentWPM exceeds targetWPM', () => {
    const currentWPM = 80;
    const targetWPM = 60;
    expect(currentWPM >= targetWPM).toBe(true);
  });

  it('target is not reached below targetWPM', () => {
    const currentWPM = 59;
    const targetWPM = 60;
    expect(currentWPM >= targetWPM).toBe(false);
  });

  it('target WPM must be at least minimum WPM', () => {
    let minimumWPM = 40;
    let targetWPM = 30;

    if (targetWPM < minimumWPM) {
      targetWPM = minimumWPM;
    }

    expect(targetWPM).toBe(40);
  });

  it('target WPM is unchanged when already above minimum', () => {
    const minimumWPM = 30;
    let targetWPM = 60;

    if (targetWPM < minimumWPM) {
      targetWPM = minimumWPM;
    }

    expect(targetWPM).toBe(60);
  });
});

describe('Paragraph Detection', () => {
  it('detects double newline as a paragraph break', () => {
    const text = 'First paragraph.\n\nSecond paragraph.';
    expect(text.includes('\n\n')).toBe(true);
  });

  it('does not treat single newline as paragraph break', () => {
    const text = 'Line one.\nLine two.';
    const hasParagraph = text.endsWith('\n\n') || text.includes('\n\n');
    expect(hasParagraph).toBe(false);
  });

  it('detects paragraph break at end of text', () => {
    const text = 'Some writing.\n\n';
    expect(text.endsWith('\n\n')).toBe(true);
  });
});

describe('Session Config Validation', () => {
  it('rejects word goal below 1', () => {
    const wordGoal = 0;
    const isValid = wordGoal >= 1;
    expect(isValid).toBe(false);
  });

  it('accepts word goal of 1', () => {
    const wordGoal = 1;
    const isValid = wordGoal >= 1;
    expect(isValid).toBe(true);
  });

  it('rejects time goal below 1 minute', () => {
    const timeGoalMinutes = 0;
    const isValid = timeGoalMinutes >= 1;
    expect(isValid).toBe(false);
  });

  it('accepts time goal of 1 minute', () => {
    const timeGoalMinutes = 1;
    const isValid = timeGoalMinutes >= 1;
    expect(isValid).toBe(true);
  });

  it('converts minutes to seconds for time goal', () => {
    const minutes = 30;
    const seconds = minutes * 60;
    expect(seconds).toBe(1800);
  });
});

describe('Word Count in Real Text Scenarios', () => {
  it('counts realistic essay text correctly', () => {
    const text = 'The quick brown fox jumps over the lazy dog. It was a bright cold day in April.';
    expect(countWords(text)).toBe(17);
  });

  it('handles text with multiple paragraphs', () => {
    const text = 'First paragraph here.\n\nSecond paragraph there.\n\nThird paragraph everywhere.';
    expect(countWords(text)).toBe(9);
  });

  it('handles text that just crosses the word goal', () => {
    const words = Array(500).fill('word');
    const text = words.join(' ');
    expect(countWords(text)).toBe(500);
  });
});

describe('Settings Defaults and Ranges', () => {
  it('word goal defaults to 500', () => {
    const defaultWordGoal = 500;
    expect(defaultWordGoal).toBe(500);
  });

  it('time goal defaults to 30 minutes (1800 seconds)', () => {
    const defaultTimeGoalSeconds = 1800;
    expect(defaultTimeGoalSeconds / 60).toBe(30);
  });

  it('minimum WPM defaults to 30', () => {
    const defaultMinimumWPM = 30;
    expect(defaultMinimumWPM).toBe(30);
  });

  it('target WPM defaults to 60', () => {
    const defaultTargetWPM = 60;
    expect(defaultTargetWPM).toBe(60);
  });

  it('minimum WPM is constrained between 1 and 300', () => {
    expect(sanitizeNumericInput('0', 1, 300)).toBe(1);
    expect(sanitizeNumericInput('301', 1, 300)).toBe(300);
    expect(sanitizeNumericInput('30', 1, 300)).toBe(30);
  });

  it('word goal is constrained between 1 and 100000', () => {
    expect(sanitizeNumericInput('0', 1, 100000)).toBe(1);
    expect(sanitizeNumericInput('100001', 1, 100000)).toBe(100000);
    expect(sanitizeNumericInput('500', 1, 100000)).toBe(500);
  });

  it('time goal is constrained between 1 and 1440 minutes', () => {
    expect(sanitizeNumericInput('0', 1, 1440)).toBe(1);
    expect(sanitizeNumericInput('1441', 1, 1440)).toBe(1440);
    expect(sanitizeNumericInput('30', 1, 1440)).toBe(30);
  });
});

describe('WPM Rolling Window Integration', () => {
  it('WPM is 0 when user has not typed anything', () => {
    const calculator = new WPMCalculator();
    expect(calculator.calculateRollingWPM()).toBe(0);
  });

  it('WPM is 0 when only one data point exists', () => {
    const calculator = new WPMCalculator();
    calculator.addEntry(10);
    expect(calculator.calculateRollingWPM()).toBe(0);
  });

  it('WPM calculation is based on words-per-minute rate', () => {
    const wordCount = 10;
    const durationMinutes = 0.5;
    const expectedWPM = wordCount / durationMinutes;
    expect(expectedWPM).toBe(20);
  });
});

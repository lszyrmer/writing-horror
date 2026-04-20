import { describe, it, expect } from 'vitest';
import { sanitizeNumericInput, handleNumericInput } from '../utils/numericInput';

describe('sanitizeNumericInput', () => {
  describe('empty and invalid input', () => {
    it('returns min for empty string', () => {
      expect(sanitizeNumericInput('', 1)).toBe(1);
    });

    it('returns min for dash-only input', () => {
      expect(sanitizeNumericInput('-', 1)).toBe(1);
    });

    it('returns min for non-numeric string', () => {
      expect(sanitizeNumericInput('abc', 1)).toBe(1);
    });

    it('returns min for whitespace-only string', () => {
      expect(sanitizeNumericInput('   ', 1)).toBe(1);
    });
  });

  describe('min enforcement', () => {
    it('returns min when value is below min', () => {
      expect(sanitizeNumericInput('0', 1)).toBe(1);
      expect(sanitizeNumericInput('-5', 1)).toBe(1);
    });

    it('returns value when exactly at min', () => {
      expect(sanitizeNumericInput('1', 1)).toBe(1);
    });

    it('respects custom min values', () => {
      expect(sanitizeNumericInput('5', 10)).toBe(10);
    });
  });

  describe('max enforcement', () => {
    it('returns max when value exceeds max', () => {
      expect(sanitizeNumericInput('200', 1, 100)).toBe(100);
    });

    it('returns value when exactly at max', () => {
      expect(sanitizeNumericInput('100', 1, 100)).toBe(100);
    });

    it('allows value between min and max', () => {
      expect(sanitizeNumericInput('50', 1, 100)).toBe(50);
    });

    it('allows values above min with no max set', () => {
      expect(sanitizeNumericInput('99999', 1)).toBe(99999);
    });
  });

  describe('valid input parsing', () => {
    it('parses valid integers', () => {
      expect(sanitizeNumericInput('42', 1)).toBe(42);
    });

    it('parses integers with leading whitespace', () => {
      expect(sanitizeNumericInput(' 42', 1)).toBe(42);
    });

    it('ignores decimal portion', () => {
      expect(sanitizeNumericInput('42.9', 1)).toBe(42);
    });
  });

  describe('real-world settings ranges', () => {
    it('handles word goal range (1 to 100000)', () => {
      expect(sanitizeNumericInput('500', 1, 100000)).toBe(500);
      expect(sanitizeNumericInput('0', 1, 100000)).toBe(1);
      expect(sanitizeNumericInput('999999', 1, 100000)).toBe(100000);
    });

    it('handles time goal range (1 to 1440)', () => {
      expect(sanitizeNumericInput('30', 1, 1440)).toBe(30);
      expect(sanitizeNumericInput('0', 1, 1440)).toBe(1);
      expect(sanitizeNumericInput('9999', 1, 1440)).toBe(1440);
    });

    it('handles WPM range (1 to 300)', () => {
      expect(sanitizeNumericInput('60', 1, 300)).toBe(60);
      expect(sanitizeNumericInput('0', 1, 300)).toBe(1);
      expect(sanitizeNumericInput('500', 1, 300)).toBe(300);
    });
  });
});

describe('handleNumericInput', () => {
  function makeEvent(value: string): React.ChangeEvent<HTMLInputElement> {
    return { target: { value } } as React.ChangeEvent<HTMLInputElement>;
  }

  it('returns null for empty string', () => {
    expect(handleNumericInput(makeEvent(''))).toBeNull();
  });

  it('returns null for dash-only input', () => {
    expect(handleNumericInput(makeEvent('-'))).toBeNull();
  });

  it('returns null for non-numeric input', () => {
    expect(handleNumericInput(makeEvent('abc'))).toBeNull();
  });

  it('strips leading zeros', () => {
    expect(handleNumericInput(makeEvent('007'))).toBe(7);
    expect(handleNumericInput(makeEvent('00100'))).toBe(100);
  });

  it('returns the integer value', () => {
    expect(handleNumericInput(makeEvent('42'))).toBe(42);
  });

  it('handles "0" correctly after stripping', () => {
    expect(handleNumericInput(makeEvent('0'))).toBe(0);
  });

  it('does not enforce min/max (raw parse only)', () => {
    expect(handleNumericInput(makeEvent('9999999'))).toBe(9999999);
    expect(handleNumericInput(makeEvent('1'), 10, 100)).toBe(1);
  });
});

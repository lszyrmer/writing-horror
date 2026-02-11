export function sanitizeNumericInput(value: string, min: number = 1, max?: number): number {
  const trimmed = value.trim();

  if (trimmed === '' || trimmed === '-') {
    return min;
  }

  const parsed = parseInt(trimmed, 10);

  if (isNaN(parsed)) {
    return min;
  }

  let result = parsed;

  if (result < min) {
    result = min;
  }

  if (max !== undefined && result > max) {
    result = max;
  }

  return result;
}

export function handleNumericInput(
  e: React.ChangeEvent<HTMLInputElement>,
  min: number = 1,
  max?: number
): number | null {
  const value = e.target.value;

  if (value === '' || value === '-') {
    return null;
  }

  const withoutLeadingZeros = value.replace(/^0+/, '') || '0';

  const parsed = parseInt(withoutLeadingZeros, 10);

  if (isNaN(parsed)) {
    return null;
  }

  return parsed;
}

import { describe, it, expect } from 'vitest';
import { resolveBrand } from '../brand';

describe('brand resolution by hostname', () => {
  it('uses braindump on productbud.com and its subdomains', () => {
    expect(resolveBrand('productbud.com').id).toBe('braindump');
    expect(resolveBrand('www.productbud.com').id).toBe('braindump');
    expect(resolveBrand('productbud.com').name).toBe('braindump');
  });

  it('uses Writing Horror everywhere else', () => {
    expect(resolveBrand('writinghorror.lukeszyrmer.com').id).toBe('writing-horror');
    expect(resolveBrand('localhost').id).toBe('writing-horror');
    expect(resolveBrand('writing-horror.pages.dev').id).toBe('writing-horror');
  });

  it('does not match lookalike hostnames', () => {
    expect(resolveBrand('notproductbud.com').id).toBe('writing-horror');
    expect(resolveBrand('productbud.com.evil.com').id).toBe('writing-horror');
  });
});

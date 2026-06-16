// One codebase, two brands. The same app ships under two identities, chosen at
// runtime by hostname so a single build/deploy serves both custom domains:
//   - productbud.com            -> "braindump" (product framing, for PMs)
//   - everything else (incl.    -> "Writing Horror" (the original)
//     writinghorror.lukeszyrmer.com, *.pages.dev, localhost)
//
// Storage keys are intentionally NOT branded — they're per-origin already, so
// each domain keeps its own history without any name collision.

export type BrandId = 'braindump' | 'writing-horror';

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
}

const BRANDS: Record<BrandId, Brand> = {
  braindump: {
    id: 'braindump',
    name: 'braindump',
    tagline: 'Get into flow. Get to your best ideas.',
  },
  'writing-horror': {
    id: 'writing-horror',
    name: 'Writing Horror',
    tagline: 'Distraction-free writing with reinforcement',
  },
};

export function resolveBrand(
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : '',
): Brand {
  return /(^|\.)productbud\.com$/i.test(hostname) ? BRANDS.braindump : BRANDS['writing-horror'];
}

export const brand = resolveBrand();

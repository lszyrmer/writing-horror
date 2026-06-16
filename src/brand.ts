// One codebase, two brands. The same app ships under two identities, chosen at
// runtime by hostname so a single build/deploy serves both custom domains:
//   - productbud.com            -> "braindump" (product framing, for PMs)
//   - everything else (incl.    -> "Writing Horror" (the original)
//     writinghorror.lukeszyrmer.com, *.pages.dev, localhost)
//
// Storage keys are intentionally NOT branded — they're per-origin already, so
// each domain keeps its own history without any name collision.

export type BrandId = 'braindump' | 'writing-horror';

// Tone-carrying in-app strings that differ between the two brands.
// braindump frames the forced pace as a path into creative flow; Writing Horror
// frames it as consequences. Neutral functional labels are NOT here — they stay
// shared in the components.
export interface BrandCopy {
  startButton: string;
  minWpmHelp: string;
  canvasPlaceholder: string;
}

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
  copy: BrandCopy;
}

const BRANDS: Record<BrandId, Brand> = {
  braindump: {
    id: 'braindump',
    name: 'braindump',
    tagline: 'Get into flow. Get to your best ideas.',
    copy: {
      startButton: 'Start braindump',
      minWpmHelp: 'Drop below this and the screen pushes you back up to pace — momentum is what keeps you in flow.',
      canvasPlaceholder: "Let it flow — don't stop to edit...",
    },
  },
  'writing-horror': {
    id: 'writing-horror',
    name: 'Writing Horror',
    tagline: 'Distraction-free writing with reinforcement',
    copy: {
      startButton: 'Start Writing',
      minWpmHelp: 'Fall below this and face the consequences',
      canvasPlaceholder: 'Start typing...',
    },
  },
};

export function resolveBrand(
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : '',
): Brand {
  return /(^|\.)productbud\.com$/i.test(hostname) ? BRANDS.braindump : BRANDS['writing-horror'];
}

export const brand = resolveBrand();

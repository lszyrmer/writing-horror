import { useState, useEffect, useRef } from 'react';

interface VelocityArcProps {
  currentWPM: number;
  targetWPM: number;
  maxWPM?: number;
}

const START_ANGLE = -120;
const END_ANGLE = 120;
const SWEEP = END_ANGLE - START_ANGLE;
const MAX_HISTORY = 15;

const COLOR_STOPS: { pos: number; rgb: [number, number, number] }[] = [
  { pos: 0, rgb: [239, 68, 68] },
  { pos: 0.28, rgb: [249, 115, 22] },
  { pos: 0.52, rgb: [234, 179, 8] },
  { pos: 0.78, rgb: [34, 197, 94] },
  { pos: 1, rgb: [74, 222, 128] },
];

function lerp(a: [number, number, number], b: [number, number, number], t: number): string {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

function colorAt(f: number): string {
  const t = Math.max(0, Math.min(1, f));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (t <= COLOR_STOPS[i + 1].pos) {
      const local = (t - COLOR_STOPS[i].pos) / (COLOR_STOPS[i + 1].pos - COLOR_STOPS[i].pos);
      return lerp(COLOR_STOPS[i].rgb, COLOR_STOPS[i + 1].rgb, local);
    }
  }
  return lerp(COLOR_STOPS[COLOR_STOPS.length - 2].rgb, COLOR_STOPS[COLOR_STOPS.length - 1].rgb, 1);
}

function toXY(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arc(cx: number, cy: number, r: number, a1: number, a2: number) {
  const s = toXY(cx, cy, r, a1);
  const e = toXY(cx, cy, r, a2);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
}

const JITTER_SEED = [3, -2, 5, -4, 1, -3, 4, -1, 2, -5, 3, -2, 4, -3, 1];

export default function VelocityArc({ currentWPM, targetWPM, maxWPM: maxWPMProp = 150 }: VelocityArcProps) {
  const [history, setHistory] = useState<number[]>([]);
  const prevRef = useRef(-1);

  const effectiveMax = Math.max(maxWPMProp, targetWPM * 2, currentWPM * 1.3, 80);

  useEffect(() => {
    if (currentWPM !== prevRef.current) {
      prevRef.current = currentWPM;
      setHistory(prev => {
        const next = [...prev, currentWPM];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });
    }
  }, [currentWPM]);

  const cx = 110;
  const cy = 100;
  const r = 82;
  const segments = 60;

  const frac = (wpm: number) => Math.min(wpm / effectiveMax, 1);
  const toAngle = (wpm: number) => START_ANGLE + frac(wpm) * SWEEP;
  const currentFrac = frac(currentWPM);

  let trendDeg = 0;
  if (history.length >= 3) {
    const slice = history.slice(-4);
    const older = slice.slice(0, Math.ceil(slice.length / 2));
    const newer = slice.slice(Math.ceil(slice.length / 2));
    const avgOld = older.reduce((a, b) => a + b, 0) / older.length;
    const avgNew = newer.reduce((a, b) => a + b, 0) / newer.length;
    trendDeg = Math.max(-45, Math.min(45, (avgNew - avgOld) * 1.5));
  }

  return (
    <div className="select-none pointer-events-none">
      <svg viewBox="0 0 220 150" className="w-full h-full">
        <defs>
          <filter id="vel-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="vel-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: segments }).map((_, i) => {
          const f1 = i / segments;
          const f2 = (i + 1) / segments;
          const a1 = START_ANGLE + f1 * SWEEP;
          const a2 = START_ANGLE + f2 * SWEEP + 0.3;
          return (
            <path
              key={i}
              d={arc(cx, cy, r, a1, a2)}
              fill="none"
              stroke={colorAt(f1)}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.1}
            />
          );
        })}

        {currentWPM > 0 && Array.from({ length: segments }).map((_, i) => {
          const f1 = i / segments;
          if (f1 > currentFrac) return null;
          const f2 = Math.min((i + 1) / segments, currentFrac);
          const a1 = START_ANGLE + f1 * SWEEP;
          const a2 = START_ANGLE + f2 * SWEEP + 0.3;
          return (
            <path
              key={`a-${i}`}
              d={arc(cx, cy, r, a1, a2)}
              fill="none"
              stroke={colorAt(f1)}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.75}
            />
          );
        })}

        {(() => {
          const ta = toAngle(targetWPM);
          const inner = toXY(cx, cy, r - 13, ta);
          const outer = toXY(cx, cy, r + 5, ta);
          return (
            <line
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="#6b7280"
              strokeWidth={1.5}
              opacity={0.6}
              strokeDasharray="2 2"
            />
          );
        })()}

        {history.map((wpm, i) => {
          if (wpm === 0) return null;
          const a = toAngle(wpm);
          const jitter = JITTER_SEED[i % JITTER_SEED.length] * 1.2;
          const pos = toXY(cx, cy, r + jitter, a);
          const opacity = 0.2 + (i / history.length) * 0.6;
          const size = 1.5 + (i / history.length) * 2;
          return (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={size}
              fill={colorAt(frac(wpm))}
              opacity={opacity}
              filter={i >= history.length - 2 ? 'url(#vel-glow)' : undefined}
            />
          );
        })}

        {currentWPM > 0 && (() => {
          const a = toAngle(currentWPM);
          const pos = toXY(cx, cy, r, a);
          const c = colorAt(currentFrac);
          return (
            <g filter="url(#vel-glow-strong)">
              <circle cx={pos.x} cy={pos.y} r={7} fill={c} opacity={0.25} />
              <circle cx={pos.x} cy={pos.y} r={4.5} fill={c} />
            </g>
          );
        })()}

        {currentWPM > 0 && (
          <g
            transform={`translate(${cx}, ${cy - 8}) rotate(${-trendDeg})`}
            opacity={0.65}
          >
            <line
              x1={-9} y1={0} x2={9} y2={0}
              stroke={trendDeg > 5 ? '#22C55E' : trendDeg < -5 ? '#EF4444' : '#6b7280'}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <polyline
              points="5,-4 9,0 5,4"
              fill="none"
              stroke={trendDeg > 5 ? '#22C55E' : trendDeg < -5 ? '#EF4444' : '#6b7280'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        <text
          x={165}
          y={140}
          textAnchor="end"
          fill="#d1d5db"
          fontSize={14}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={600}
        >
          WPM: {currentWPM}
        </text>
      </svg>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';

interface TypingRhythmProps {
  currentWPM: number;
  targetWPM: number;
  minimumWPM: number;
}

const MAX_BARS = 30;

function barColor(wpm: number, min: number, target: number): string {
  if (wpm === 0) return '#374151';
  if (wpm < min) return '#EF4444';
  if (wpm < min + (target - min) * 0.5) return '#F97316';
  if (wpm < target) return '#EAB308';
  return '#22C55E';
}

function rhythmStatus(samples: number[]): { label: string; color: string } {
  const active = samples.filter(s => s > 0);
  if (active.length < 4) return { label: 'WARMING UP', color: '#6b7280' };

  const mean = active.reduce((a, b) => a + b, 0) / active.length;
  if (mean === 0) return { label: 'PAUSED', color: '#6b7280' };

  const variance = active.reduce((sum, v) => sum + (v - mean) ** 2, 0) / active.length;
  const cv = Math.sqrt(variance) / mean;

  if (cv < 0.12) return { label: 'LOCKED IN', color: '#4ADE80' };
  if (cv < 0.25) return { label: 'STABLE', color: '#22C55E' };
  if (cv < 0.4) return { label: 'VARIABLE', color: '#EAB308' };
  return { label: 'ERRATIC', color: '#EF4444' };
}

export default function TypingRhythm({ currentWPM, targetWPM, minimumWPM }: TypingRhythmProps) {
  const [samples, setSamples] = useState<number[]>([]);
  const prevRef = useRef(-1);

  useEffect(() => {
    if (currentWPM !== prevRef.current) {
      prevRef.current = currentWPM;
      setSamples(prev => {
        const next = [...prev, currentWPM];
        return next.length > MAX_BARS ? next.slice(-MAX_BARS) : next;
      });
    }
  }, [currentWPM]);

  const maxVal = Math.max(targetWPM * 1.4, ...samples, 40);
  const status = rhythmStatus(samples.slice(-12));

  const barWidth = 6;
  const barGap = 2.5;
  const chartWidth = MAX_BARS * (barWidth + barGap);
  const chartHeight = 64;
  const totalWidth = chartWidth + 16;
  const totalHeight = chartHeight + 36;

  const paddedSamples = samples.length < MAX_BARS
    ? [...Array(MAX_BARS - samples.length).fill(-1), ...samples]
    : samples;

  return (
    <div className="select-none pointer-events-none">
      <svg viewBox={`0 0 ${totalWidth} ${totalHeight}`} className="w-full h-full">
        <line
          x1={8} y1={chartHeight - (minimumWPM / maxVal) * chartHeight + 4}
          x2={totalWidth - 8} y2={chartHeight - (minimumWPM / maxVal) * chartHeight + 4}
          stroke="#EF4444"
          strokeWidth={0.5}
          strokeDasharray="3 3"
          opacity={0.35}
        />

        <line
          x1={8} y1={chartHeight - (targetWPM / maxVal) * chartHeight + 4}
          x2={totalWidth - 8} y2={chartHeight - (targetWPM / maxVal) * chartHeight + 4}
          stroke="#22C55E"
          strokeWidth={0.5}
          strokeDasharray="3 3"
          opacity={0.35}
        />

        {paddedSamples.map((wpm, i) => {
          if (wpm < 0) return null;
          const x = 8 + i * (barWidth + barGap);
          const height = wpm === 0 ? 1.5 : Math.max(2, (wpm / maxVal) * chartHeight);
          const y = chartHeight - height + 4;
          const color = barColor(wpm, minimumWPM, targetWPM);
          const isRecent = i >= paddedSamples.length - 3;
          const opacity = wpm === 0
            ? 0.15
            : i < paddedSamples.length - 8
              ? 0.4
              : 0.4 + ((i - (paddedSamples.length - 8)) / 8) * 0.6;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx={1.5}
                fill={color}
                opacity={opacity}
              />
              {isRecent && wpm > 0 && (
                <rect
                  x={x - 1}
                  y={y - 1}
                  width={barWidth + 2}
                  height={height + 2}
                  rx={2}
                  fill={color}
                  opacity={0.15}
                />
              )}
            </g>
          );
        })}

        <text
          x={totalWidth / 2}
          y={totalHeight - 4}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize={10}
          fontWeight={600}
          fill={status.color}
        >
          Rhythm: {status.label}
        </text>
      </svg>
    </div>
  );
}

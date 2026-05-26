# WPM Algorithm

## Overview

WPM (words per minute) is calculated using a **rolling window over character count**, sampled on a fixed interval. This approach avoids the word-boundary step-jumps and keystroke-flood problems of per-event word counting.

---

## Key Constants

| Constant | Value | Purpose |
|---|---|---|
| `CHARS_PER_WORD` | 5 | Standard definition of one "word" (used by Monkeytype, TypeRacer, etc.) |
| `SAMPLE_INTERVAL_MS` | 500ms | How often a snapshot is recorded |
| `WINDOW_MS` | 30,000ms | How far back the rolling window looks |
| `IDLE_CUTOFF_MS` | 5,000ms | How long before inactivity resets the displayed WPM to 0 |

---

## How It Works

### 1. Sampling (every 500ms)

A timer in `App.tsx` fires every `SAMPLE_INTERVAL_MS` and calls:

```ts
wpmCalculatorRef.current.recordSample(charCountRef.current);
```

`charCountRef` is updated synchronously on every keystroke in `handleTextChange` — it always reflects the current total character count of the document. The sampler does not attach to keystrokes directly; it reads the latest count at a fixed cadence.

`recordSample` pushes `{ timestamp, charCount }` onto the samples array, then prunes any entries older than `WINDOW_MS`.

```
t=0s    t=0.5s  t=1s    t=1.5s  ...  t=29.5s  t=30s
 [s0]    [s1]    [s2]    [s3]         [sN-1]   [sN]
  └─────────────────── 30s window ──────────────┘
```

### 2. WPM Calculation (every 500ms)

A separate display interval reads the current WPM:

```ts
const wpm = wpmCalculatorRef.current.calculateRollingWPM();
setCurrentWPM(wpm);
```

`calculateRollingWPM` does the following:

```
1. Require at least 2 samples (need a start and end point)
2. Check idle: if the newest sample is >5s old, return 0
3. net_chars = newest.charCount - oldest.charCount
4. elapsed_minutes = (newest.timestamp - oldest.timestamp) / 60000
5. wpm = round(net_chars / 5 / elapsed_minutes)
6. If net_chars <= 0 (no typing, or net deletion), return 0
```

### 3. Why character count, not word count

Word count only increments when a space or newline is typed to complete a word. Measuring by characters gives a signal on every keystroke. The 5-chars-per-word divisor normalises this to the same unit as traditional WPM and is the accepted standard.

### 4. Why fixed-interval sampling instead of per-keystroke entries

Per-keystroke recording floods the history array (100+ entries in 10 seconds at speed) but only the oldest and newest entries are ever used in the calculation. A 500ms sampler produces at most 60 entries per 30-second window and reduces unnecessary work. It also decouples measurement from the input event loop.

### 5. The 30-second window

A longer window produces a more stable reading during a sustained writing session — short bursts and brief pauses don't cause large swings. A shorter window (e.g. 10s) is more reactive but feels jumpy. 30 seconds matches the approach taken by most professional typing tools.

### 6. Idle detection

When the user stops typing, `charCountRef` stops changing but the sampler continues recording identical values. `calculateRollingWPM` handles this in two ways:

- **5-second idle cutoff**: if `Date.now() - newest.timestamp > IDLE_CUTOFF_MS`, return 0. Since `recordSample` is called every 500ms, `newest.timestamp` is always recent while the session is running — this cutoff only fires if the sampling interval itself has stopped (i.e. the session ended).
- **net_chars <= 0 guard**: if the user only deletes text, `charDiff` is negative and the function returns 0.

> Note: if the user stops typing but the sampling interval keeps running, WPM will gradually approach 0 over the 30-second window as the oldest high-char-count samples age out of the window and get replaced by stagnant ones.

---

## Data Flow

```
keystroke
    │
    ▼
handleTextChange()
    │
    ├─ setText / setWordCount (React state for display)
    └─ charCountRef.current = text.length  ← raw total, updated synchronously

every 500ms (wpmSampleIntervalRef)
    │
    ▼
recordSample(charCountRef.current)
    └─ push { timestamp, charCount } → prune samples older than 30s

every 500ms (wpmIntervalRef)
    │
    ▼
calculateRollingWPM()
    └─ (newest.charCount - oldest.charCount) / 5 / elapsed_minutes
    └─ setCurrentWPM(wpm)
```

---

## Files

| File | Role |
|---|---|
| `src/utils/wpmCalculator.ts` | `WPMCalculator` class, `countWords`, `countChars` |
| `src/App.tsx` | Owns `charCountRef`, sampling intervals, calls `recordSample` and `calculateRollingWPM` |
| `src/test/wpmCalculator.test.ts` | Unit tests for calculator and helper functions |

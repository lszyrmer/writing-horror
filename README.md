# braindump

**Get into flow. Get to your best ideas.**

braindump gets product people into creative flow — the state where your best ideas actually show up. Set a word target and a timer, start typing, and keep moving. The moment you slow down to second-guess a line, the screen pushes back until you pick the pace up again. Outrunning your inner critic is the whole point: momentum is what drops you into flow, and flow is where the good ideas connect.

Built for product people — PMs, founders, builders — who think *by* writing: framing a problem, dumping a strategy before you overthink it, prepping a standup, working through a retro, or beating the blank page on the thing you keep putting off.

> **One app, two brands.** The same engine runs as **braindump** (productbud.com) — framed around getting into creative flow — and as **Writing Horror** (writinghorror.lukeszyrmer.com), the same mechanic with a tougher-love framing. The name switches by domain; the app is identical.

---

## How It Works

1. **Set your goals.** Choose a word count target (e.g. 500 words) and a time goal (e.g. 30 minutes).
2. **Hit Start.** The app enters a clean, fullscreen writing environment. No menus, no formatting, no distractions.
3. **Write or stall.** If your typing speed drops below your minimum WPM for more than a few seconds, the screen pulses red and an alarm sounds. It won't stop until you start typing again.
4. **Hit your goal.** When you reach your word count, you get a victory screen with your stats and a button to copy everything you wrote to your clipboard.

No outlines, no templates, no organizational features. Just a blank page, a word count, and a ticking clock.

---

## Run It Locally

No accounts, no backend, no setup. Everything runs in your browser.

```sh
git clone https://github.com/lszyrmer/writing-horror.git
cd writing-horror
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static bundle you can host anywhere.

**Your data stays on your device.** Session metrics (word count, duration, WPM, goals) live in IndexedDB and your settings in `localStorage` — nothing is uploaded, and there's no server to sign in to. What you actually write is never stored or sent; it only goes to your clipboard when you copy it. Custom sounds you upload stay local in the browser too. (History and settings are per-browser, not synced across devices.)

---

## Features

### The Pressure System
- **Minimum WPM threshold** — Set a floor for your typing speed. Drop below it for more than 3 seconds and the alarm kicks in. The screen flashes red. You'll want to start typing again.
- **Pace tracking** — The stats bar tells you whether you're ahead, on track, or falling behind relative to finishing your word goal within your time limit.
- **Target WPM** — Set an aspirational pace. A celebratory sound plays when you hit it, and visual indicators show your velocity in real time.

### No Escape
- **Fullscreen mode** — Sessions launch in fullscreen by default so you can't glance at other tabs or notifications.
- **No Backspace Mode** — An optional setting that disables the backspace key entirely. No editing, no second-guessing, no perfectionism. Just forward momentum.
- **No copy/paste** — You can't paste text in or copy text out until you've hit your word count. You have to earn your words.

### Feedback & Sound
- **Typewriter sounds** — Optional keystroke audio for tactile feedback.
- **Paragraph chime** — A sound plays when you start a new paragraph (double Enter), giving a small sense of progress.
- **Custom audio** — Upload your own sounds for the alert, typewriter, paragraph chime, and target WPM notification. Make it as motivating or terrifying as you want.

### Tracking
- **Session history** — Every session is saved locally with word count, duration, average WPM, and whether you hit your goals. See your writing habits over time.
- **Live stats bar** — During a session, see your current word count, elapsed time, and live WPM at a glance.
- **Velocity arc & rhythm visualizations** — Real-time visual displays of your writing speed and consistency sit quietly in the corners of your screen.

---

## Who It's For

- **Product people doing the thinking work.** Framing a problem, drafting a strategy doc, prepping a standup, dumping a retro — the messy first pass you do *by* writing.
- **Anyone who edits too early.** No Backspace Mode forces a messy first draft instead of endlessly polishing your opening line.
- **People who procrastinate.** If you have a doc, essay, post, or script you keep putting off, this exists to make "not writing" more uncomfortable than writing.
- **Volume-and-consistency writers.** Morning pages, journaling, NaNoWriMo — set the goal, set the timer, let the pressure do the rest.

---

## Philosophy

The enemy of a good braindump is the inner editor — the part of you that stops to fix, rank, and second-guess before an idea is even out. That hesitation is what keeps you out of flow.

braindump removes the option to stall. By keeping you moving, it quiets the critic long enough to drop into flow, where ideas connect and the good stuff surfaces. You're not writing to produce a finished thing; you're writing to *think*, fast and unfiltered.

This isn't for every session. It's for the ones where you need to get the thoughts out of your head and into motion — and nothing else has worked. (Prefer the stick to the carrot? The same engine runs as **Writing Horror**, framed around consequences instead of flow.)

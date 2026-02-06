import { DEFAULT_SOUNDS } from './defaultSounds';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private beepInterval: number | null = null;
  private alertAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private typewriterEnabled = true;
  private typewriterBuffer: AudioBuffer | null = null;
  private paragraphAudio: HTMLAudioElement | null = null;
  private targetWpmAudio: HTMLAudioElement | null = null;

  setTypewriterEnabled(enabled: boolean) {
    this.typewriterEnabled = enabled;
  }

  setAlertSound(url?: string) {
    const src = url || DEFAULT_SOUNDS.alert;
    this.alertAudio = new Audio(src);
    this.alertAudio.loop = true;
  }

  async setTypewriterSound(url?: string) {
    const src = url || DEFAULT_SOUNDS.typewriter;
    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      this.typewriterBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch {
      this.typewriterBuffer = null;
    }
  }

  setParagraphSound(url?: string) {
    const src = url || DEFAULT_SOUNDS.paragraph;
    this.paragraphAudio = new Audio(src);
    this.paragraphAudio.volume = 0.6;
    this.paragraphAudio.load();
  }

  playParagraphSound() {
    if (!this.paragraphAudio) return;
    this.paragraphAudio.currentTime = 0;
    this.paragraphAudio.play().catch(() => {});
  }

  setTargetWpmSound(url?: string) {
    const src = url || DEFAULT_SOUNDS.targetWpm;
    this.targetWpmAudio = new Audio(src);
    this.targetWpmAudio.volume = 0.6;
    this.targetWpmAudio.load();
  }

  playTargetWpmSound() {
    if (!this.targetWpmAudio) return;
    this.targetWpmAudio.currentTime = 0;
    this.targetWpmAudio.play().catch(() => {});
  }

  stopTargetWpmSound() {
    if (!this.targetWpmAudio) return;
    this.targetWpmAudio.pause();
    this.targetWpmAudio.currentTime = 0;
  }

  warmUp() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return;
      }
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTypewriterSound() {
    if (!this.typewriterEnabled) return;

    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return;
      }
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.audioContext.state !== 'running') return;

    const ctx = this.audioContext;
    const t = ctx.currentTime;

    if (this.typewriterBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = this.typewriterBuffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(t);
      return;
    }

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    const clickDuration = 0.012;
    const clickSamples = Math.floor(clickDuration * ctx.sampleRate);
    for (let i = 0; i < clickSamples; i++) {
      const env = 1 - (i / clickSamples);
      output[i] = (Math.random() * 2 - 1) * env * 0.6;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(t);
    source.stop(t + 0.02);
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.alertAudio) {
      this.alertAudio.play().catch(() => {
        this.startBeepLoop();
      });
    } else {
      this.startBeepLoop();
    }
  }

  private startBeepLoop() {
    if (!this.audioContext) return;

    this.playOneBeep();
    this.beepInterval = window.setInterval(() => {
      this.playOneBeep();
    }, 600);
  }

  private playOneBeep() {
    if (!this.audioContext || this.audioContext.state !== 'running') return;
    const ctx = this.audioContext;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = 520;

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.setValueAtTime(0.4, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.alertAudio) {
      this.alertAudio.pause();
      this.alertAudio.currentTime = 0;
    }

    if (this.beepInterval !== null) {
      clearInterval(this.beepInterval);
      this.beepInterval = null;
    }
  }

  stopAll() {
    this.stop();
    this.stopTargetWpmSound();
    if (this.paragraphAudio) {
      this.paragraphAudio.pause();
      this.paragraphAudio.currentTime = 0;
    }
  }

  cleanup() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.alertAudio = null;
    this.typewriterBuffer = null;
    this.paragraphAudio = null;
    this.targetWpmAudio = null;
  }
}

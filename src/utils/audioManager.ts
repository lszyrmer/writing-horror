import { DEFAULT_SOUNDS } from './defaultSounds';

const TYPEWRITER_POOL_SIZE = 6;

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private beepInterval: number | null = null;
  private alertAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private typewriterEnabled = true;
  private typewriterPool: HTMLAudioElement[] = [];
  private typewriterPoolIndex = 0;
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
    this.typewriterPool = [];
    for (let i = 0; i < TYPEWRITER_POOL_SIZE; i++) {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.load();
      this.typewriterPool.push(audio);
    }
    this.typewriterPoolIndex = 0;
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
        /* ignore */
      }
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    for (const audio of this.typewriterPool) {
      audio.load();
    }
  }

  playTypewriterSound() {
    if (!this.typewriterEnabled || this.typewriterPool.length === 0) return;

    const audio = this.typewriterPool[this.typewriterPoolIndex];
    this.typewriterPoolIndex = (this.typewriterPoolIndex + 1) % this.typewriterPool.length;
    audio.currentTime = 0;
    audio.play().catch(() => {});
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
    this.typewriterPool = [];
    this.typewriterPoolIndex = 0;
    this.paragraphAudio = null;
    this.targetWpmAudio = null;
  }
}

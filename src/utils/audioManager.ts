export class AudioManager {
  private audioContext: AudioContext | null = null;
  private beepInterval: number | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private useCustom = false;
  private typewriterEnabled = true;
  private customTypewriterBuffer: AudioBuffer | null = null;
  private useCustomTypewriter = false;
  private paragraphAudio: HTMLAudioElement | null = null;
  private useCustomParagraphSound = false;
  private targetWpmAudio: HTMLAudioElement | null = null;
  private useCustomTargetWpmSound = false;

  setTypewriterEnabled(enabled: boolean) {
    this.typewriterEnabled = enabled;
  }

  setCustomAudio(url: string, enabled: boolean) {
    this.useCustom = enabled && url.length > 0;
    if (this.useCustom) {
      this.customAudio = new Audio(url);
      this.customAudio.loop = true;
    }
  }

  async setCustomTypewriterSound(url: string, enabled: boolean) {
    this.useCustomTypewriter = enabled && url.length > 0;
    if (!this.useCustomTypewriter || !url) {
      this.customTypewriterBuffer = null;
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      this.customTypewriterBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch {
      this.customTypewriterBuffer = null;
      this.useCustomTypewriter = false;
    }
  }

  setCustomParagraphSound(url: string, enabled: boolean) {
    this.useCustomParagraphSound = enabled && url.length > 0;
    if (this.useCustomParagraphSound && url) {
      this.paragraphAudio = new Audio(url);
      this.paragraphAudio.volume = 0.6;
      this.paragraphAudio.load();
    } else {
      this.paragraphAudio = null;
    }
  }

  playParagraphSound() {
    if (!this.useCustomParagraphSound || !this.paragraphAudio) return;
    this.paragraphAudio.currentTime = 0;
    this.paragraphAudio.play().catch(() => {});
  }

  setCustomTargetWpmSound(url: string, enabled: boolean) {
    this.useCustomTargetWpmSound = enabled && url.length > 0;
    if (this.useCustomTargetWpmSound && url) {
      this.targetWpmAudio = new Audio(url);
      this.targetWpmAudio.volume = 0.6;
      this.targetWpmAudio.load();
    } else {
      this.targetWpmAudio = null;
    }
  }

  playTargetWpmSound() {
    if (!this.useCustomTargetWpmSound || !this.targetWpmAudio) return;
    this.targetWpmAudio.currentTime = 0;
    this.targetWpmAudio.play().catch(() => {});
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
    if (!this.typewriterEnabled || !this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.audioContext.state !== 'running') return;

    const ctx = this.audioContext;
    const t = ctx.currentTime;

    if (this.useCustomTypewriter && this.customTypewriterBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = this.customTypewriterBuffer;
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

    if (this.useCustom && this.customAudio) {
      this.customAudio.play().catch(() => {
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

    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
    }

    if (this.beepInterval !== null) {
      clearInterval(this.beepInterval);
      this.beepInterval = null;
    }
  }

  cleanup() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.customAudio = null;
    this.customTypewriterBuffer = null;
    this.paragraphAudio = null;
    this.targetWpmAudio = null;
  }
}

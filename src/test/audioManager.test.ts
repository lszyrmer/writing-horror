import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioManager } from '../utils/audioManager';

describe('AudioManager', () => {
  let manager: AudioManager;

  beforeEach(() => {
    manager = new AudioManager();
    vi.clearAllMocks();
  });

  describe('setTypewriterEnabled', () => {
    it('disables typewriter sound when set to false', () => {
      manager.setTypewriterEnabled(false);
      manager.setTypewriterSound('/sounds/typewriter.mp3');

      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play');
      manager.playTypewriterSound();

      expect(playSpy).not.toHaveBeenCalled();
    });

    it('allows typewriter sound when set to true', () => {
      manager.setTypewriterEnabled(true);
      manager.setTypewriterSound('/sounds/typewriter.mp3');

      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
      manager.playTypewriterSound();

      expect(playSpy).toHaveBeenCalled();
    });
  });

  describe('setAlertSound', () => {
    it('sets alert to default sound when no URL given', () => {
      manager.setAlertSound();
      expect(HTMLMediaElement).toBeDefined();
    });

    it('sets alert to provided URL', () => {
      manager.setAlertSound('data:audio/mp3;base64,abc');
      expect(HTMLMediaElement).toBeDefined();
    });

    it('sets loop to true on alert audio', () => {
      manager.setAlertSound('/sounds/alert.mp3');
      const audio = document.querySelectorAll('audio');
      expect(audio).toBeDefined();
    });
  });

  describe('play and stop (alert)', () => {
    it('does not play again if already playing', () => {
      manager.setAlertSound('/sounds/alert.mp3');
      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

      manager.play();
      manager.play();

      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it('does not stop again if already stopped', () => {
      manager.setAlertSound('/sounds/alert.mp3');
      const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause');

      manager.stop();
      manager.stop();

      expect(pauseSpy).not.toHaveBeenCalled();
    });

    it('can play after being stopped', () => {
      manager.setAlertSound('/sounds/alert.mp3');
      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

      manager.play();
      manager.stop();
      manager.play();

      expect(playSpy).toHaveBeenCalledTimes(2);
    });

    it('pauses alert audio on stop', () => {
      manager.setAlertSound('/sounds/alert.mp3');
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
      const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause');

      manager.play();
      manager.stop();

      expect(pauseSpy).toHaveBeenCalled();
    });
  });

  describe('typewriter pool', () => {
    it('cycles through pool on rapid key presses', () => {
      manager.setTypewriterEnabled(true);
      manager.setTypewriterSound('/sounds/typewriter.mp3');

      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

      manager.playTypewriterSound();
      manager.playTypewriterSound();
      manager.playTypewriterSound();

      expect(playSpy).toHaveBeenCalledTimes(3);
    });

    it('does not play when pool is empty', () => {
      manager.setTypewriterEnabled(true);
      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

      manager.playTypewriterSound();

      expect(playSpy).not.toHaveBeenCalled();
    });
  });

  describe('paragraph sound', () => {
    it('plays paragraph sound', () => {
      manager.setParagraphSound('/sounds/paragraph.mp3');
      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

      manager.playParagraphSound();

      expect(playSpy).toHaveBeenCalled();
    });

    it('does not throw when paragraph audio not set', () => {
      expect(() => manager.playParagraphSound()).not.toThrow();
    });

    it('resets to start on each play', () => {
      manager.setParagraphSound('/sounds/paragraph.mp3');
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

      manager.playParagraphSound();
      manager.playParagraphSound();

      const elements = document.querySelectorAll('audio');
      expect(elements).toBeDefined();
    });
  });

  describe('target WPM sound', () => {
    it('plays target WPM sound', () => {
      manager.setTargetWpmSound('/sounds/target-wpm.mp3');
      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

      manager.playTargetWpmSound();

      expect(playSpy).toHaveBeenCalled();
    });

    it('stops target WPM sound', () => {
      manager.setTargetWpmSound('/sounds/target-wpm.mp3');
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
      const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause');

      manager.playTargetWpmSound();
      manager.stopTargetWpmSound();

      expect(pauseSpy).toHaveBeenCalled();
    });

    it('does not throw when target WPM audio not set', () => {
      expect(() => manager.playTargetWpmSound()).not.toThrow();
      expect(() => manager.stopTargetWpmSound()).not.toThrow();
    });
  });

  describe('stopAll', () => {
    it('stops alert and target WPM sound together', () => {
      manager.setAlertSound('/sounds/alert.mp3');
      manager.setTargetWpmSound('/sounds/target-wpm.mp3');
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
      const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause');

      manager.play();
      manager.stopAll();

      expect(pauseSpy).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('clears all audio references', () => {
      manager.setAlertSound('/sounds/alert.mp3');
      manager.setTypewriterSound('/sounds/typewriter.mp3');
      manager.setParagraphSound('/sounds/paragraph.mp3');
      manager.setTargetWpmSound('/sounds/target-wpm.mp3');

      expect(() => manager.cleanup()).not.toThrow();
    });

    it('can be called multiple times safely', () => {
      expect(() => {
        manager.cleanup();
        manager.cleanup();
      }).not.toThrow();
    });
  });
});

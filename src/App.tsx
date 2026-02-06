import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import SplashScreen, { SessionConfig } from './components/SplashScreen';
import WritingCanvas from './components/WritingCanvas';
import StatsBar from './components/StatsBar';
import VictoryModal from './components/VictoryModal';
import SessionHistory from './components/SessionHistory';
import Settings from './components/Settings';
import { WPMCalculator, countWords } from './utils/wpmCalculator';
import { AudioManager } from './utils/audioManager';
import { saveSession, getUserSettings } from './lib/supabase';

type AppView = 'splash' | 'writing' | 'history' | 'settings';

export default function App() {
  const [view, setView] = useState<AppView>('splash');
  const [text, setText] = useState('');
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [currentWPM, setCurrentWPM] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [warningActive, setWarningActive] = useState(false);

  const [minimumWPM, setMinimumWPM] = useState(30);
  const [noBackspaceMode, setNoBackspaceMode] = useState(false);
  const [targetWPM, setTargetWPM] = useState(60);
  const [fullscreenEnabled, setFullscreenEnabled] = useState(true);

  const wpmCalculatorRef = useRef<WPMCalculator>(new WPMCalculator());
  const audioManagerRef = useRef<AudioManager>(new AudioManager());
  const startTimeRef = useRef<number>(0);
  const wpmIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const warningCheckRef = useRef<number | null>(null);
  const warningActiveRef = useRef(false);
  const configRef = useRef<SessionConfig | null>(null);
  const belowThresholdTimeRef = useRef(0);
  const wordCountRef = useRef(0);
  const textRef = useRef('');
  const minimumWPMRef = useRef(30);
  const targetWPMRef = useRef(60);
  const targetWpmReachedRef = useRef(false);
  const noBackspaceModeRef = useRef(false);
  const fullscreenEnabledRef = useRef(true);

  useEffect(() => {
    loadAudioSettings();
    return () => {
      audioManagerRef.current.cleanup();
    };
  }, []);

  async function loadAudioSettings() {
    try {
      const settings = await getUserSettings();
      if (settings) {
        if (settings.use_custom_audio && settings.custom_audio_url) {
          audioManagerRef.current.setCustomAudio(settings.custom_audio_url, true);
        }
        audioManagerRef.current.setTypewriterEnabled(settings.typewriter_sound_enabled ?? true);
        if (settings.use_custom_typewriter && settings.custom_typewriter_url) {
          audioManagerRef.current.setCustomTypewriterSound(settings.custom_typewriter_url, true);
        }
        if (settings.use_custom_paragraph_sound && settings.custom_paragraph_sound_url) {
          audioManagerRef.current.setCustomParagraphSound(settings.custom_paragraph_sound_url, true);
        }
        if (settings.use_custom_target_wpm_sound && settings.custom_target_wpm_sound_url) {
          audioManagerRef.current.setCustomTargetWpmSound(settings.custom_target_wpm_sound_url, true);
        }

        const minWpm = settings.default_minimum_wpm ?? 30;
        const tgtWpm = settings.target_wpm ?? 60;
        const noBs = settings.no_backspace_mode ?? false;
        setMinimumWPM(minWpm);
        minimumWPMRef.current = minWpm;
        setTargetWPM(tgtWpm);
        targetWPMRef.current = tgtWpm;
        setNoBackspaceMode(noBs);
        noBackspaceModeRef.current = noBs;
        const fs = settings.fullscreen_enabled ?? true;
        setFullscreenEnabled(fs);
        fullscreenEnabledRef.current = fs;
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  }

  function enterFullscreen() {
    if (!fullscreenEnabledRef.current) return;
    const el = document.documentElement;
    const request = el.requestFullscreen
      || (el as any).webkitRequestFullscreen
      || (el as any).msRequestFullscreen;
    if (request) {
      request.call(el).catch(() => {});
    }
  }

  function exitFullscreen() {
    if (!document.fullscreenElement
      && !(document as any).webkitFullscreenElement
      && !(document as any).msFullscreenElement) return;
    const exit = document.exitFullscreen
      || (document as any).webkitExitFullscreen
      || (document as any).msExitFullscreen;
    if (exit) {
      exit.call(document).catch(() => {});
    }
  }

  function clearAllIntervals() {
    if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (warningCheckRef.current) clearInterval(warningCheckRef.current);
    wpmIntervalRef.current = null;
    timerIntervalRef.current = null;
    warningCheckRef.current = null;
  }

  function handleStart(sessionConfig: SessionConfig) {
    audioManagerRef.current.warmUp();
    setConfig(sessionConfig);
    configRef.current = sessionConfig;
    setText('');
    textRef.current = '';
    setWordCount(0);
    wordCountRef.current = 0;
    setCurrentWPM(0);
    setElapsedSeconds(0);
    setGoalAchieved(false);
    setShowVictory(false);
    setWarningActive(false);
    warningActiveRef.current = false;
    belowThresholdTimeRef.current = 0;
    targetWpmReachedRef.current = false;
    wpmCalculatorRef.current.reset();
    startTimeRef.current = Date.now();
    setView('writing');
    enterFullscreen();

    wpmIntervalRef.current = window.setInterval(() => {
      const wpm = wpmCalculatorRef.current.calculateRollingWPM();
      setCurrentWPM(wpm);
    }, 2000);

    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    warningCheckRef.current = window.setInterval(() => {
      checkWarningState();
    }, 500);
  }

  function checkWarningState() {
    if (!configRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (elapsed < 10) return;

    const wpm = wpmCalculatorRef.current.calculateRollingWPM();
    const belowThreshold = wpm < minimumWPMRef.current;

    if (belowThreshold) {
      belowThresholdTimeRef.current += 0.5;
      if (belowThresholdTimeRef.current >= 3 && !warningActiveRef.current) {
        warningActiveRef.current = true;
        setWarningActive(true);
        audioManagerRef.current.play();
      }
    } else {
      belowThresholdTimeRef.current = 0;
      if (warningActiveRef.current) {
        warningActiveRef.current = false;
        setWarningActive(false);
        audioManagerRef.current.stop();
      }
    }

    if (wpm >= targetWPMRef.current && !targetWpmReachedRef.current) {
      targetWpmReachedRef.current = true;
      audioManagerRef.current.playTargetWpmSound();
    } else if (wpm < targetWPMRef.current) {
      targetWpmReachedRef.current = false;
    }
  }

  function handleTextChange(newText: string, isKeypress = false) {
    if (isKeypress) {
      audioManagerRef.current.playTypewriterSound();
    }

    const oldText = textRef.current;
    if (isKeypress && newText.endsWith('\n\n') && !oldText.endsWith('\n\n')) {
      audioManagerRef.current.playParagraphSound();
    }

    setText(newText);
    textRef.current = newText;
    const words = countWords(newText);
    setWordCount(words);
    wordCountRef.current = words;
    wpmCalculatorRef.current.addEntry(words);

    if (configRef.current && words >= configRef.current.wordGoal && !goalAchieved) {
      setGoalAchieved(true);
      handleGoalReached(words);
    }
  }

  async function handleGoalReached(finalWordCount?: number) {
    clearAllIntervals();
    audioManagerRef.current.stop();
    setWarningActive(false);
    warningActiveRef.current = false;

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const wc = finalWordCount ?? wordCountRef.current;
    const avgWPM = duration > 0 ? Math.round((wc / duration) * 60) : 0;

    const cfg = configRef.current;
    if (cfg) {
      try {
        await saveSession({
          word_count: wc,
          duration_seconds: duration,
          average_wpm: avgWPM,
          word_goal: cfg.wordGoal,
          time_goal_seconds: cfg.timeGoalSeconds,
          minimum_wpm: minimumWPMRef.current,
          word_goal_achieved: true,
          time_goal_achieved: duration <= cfg.timeGoalSeconds,
          no_backspace_mode: noBackspaceModeRef.current,
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    setShowVictory(true);
  }

  const handleStopSession = useCallback(async () => {
    clearAllIntervals();
    audioManagerRef.current.stop();
    setWarningActive(false);
    warningActiveRef.current = false;

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const wc = wordCountRef.current;
    const avgWPM = duration > 0 ? Math.round((wc / duration) * 60) : 0;

    const cfg = configRef.current;
    if (cfg && wc > 0) {
      try {
        await saveSession({
          word_count: wc,
          duration_seconds: duration,
          average_wpm: avgWPM,
          word_goal: cfg.wordGoal,
          time_goal_seconds: cfg.timeGoalSeconds,
          minimum_wpm: minimumWPMRef.current,
          word_goal_achieved: wc >= cfg.wordGoal,
          time_goal_achieved: duration <= cfg.timeGoalSeconds,
          no_backspace_mode: noBackspaceModeRef.current,
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    exitFullscreen();
    setView('splash');
    setText('');
    textRef.current = '';
    setWordCount(0);
    wordCountRef.current = 0;
    setCurrentWPM(0);
    setElapsedSeconds(0);
    setGoalAchieved(false);
    setShowVictory(false);
    setConfig(null);
    configRef.current = null;
  }, []);

  function handleNewSession() {
    exitFullscreen();
    setShowVictory(false);
    setView('splash');
  }

  function handleViewHistory() {
    clearAllIntervals();
    audioManagerRef.current.stop();
    exitFullscreen();
    setView('history');
  }

  function handleViewSettings() {
    setView('settings');
  }

  function handleBackToHome() {
    setView('splash');
  }

  function handleAudioChange(url: string, enabled: boolean) {
    audioManagerRef.current.setCustomAudio(url, enabled);
  }

  function handleTypewriterChange(enabled: boolean) {
    audioManagerRef.current.setTypewriterEnabled(enabled);
  }

  function handleCustomTypewriterChange(url: string, enabled: boolean) {
    audioManagerRef.current.setCustomTypewriterSound(url, enabled);
  }

  function handleParagraphSoundChange(url: string, enabled: boolean) {
    audioManagerRef.current.setCustomParagraphSound(url, enabled);
  }

  function handleTargetWpmSoundChange(url: string, enabled: boolean) {
    audioManagerRef.current.setCustomTargetWpmSound(url, enabled);
  }

  function handleSettingsBack() {
    loadAudioSettings();
    setView('splash');
  }

  if (view === 'history') {
    return <SessionHistory onBack={handleBackToHome} />;
  }

  if (view === 'settings') {
    return (
      <Settings
        onBack={handleSettingsBack}
        onAudioChange={handleAudioChange}
        onTypewriterChange={handleTypewriterChange}
        onCustomTypewriterChange={handleCustomTypewriterChange}
        onParagraphSoundChange={handleParagraphSoundChange}
        onTargetWpmSoundChange={handleTargetWpmSoundChange}
      />
    );
  }

  if (view === 'splash') {
    return (
      <SplashScreen
        onStart={handleStart}
        onViewHistory={handleViewHistory}
        onViewSettings={handleViewSettings}
      />
    );
  }

  return (
    <motion.div
      className="h-screen flex flex-col overflow-hidden"
      animate={{
        backgroundColor: warningActive ? ['#8B0000', '#5C0000', '#8B0000'] : '#121212'
      }}
      transition={{
        duration: warningActive ? 1.5 : 0.5,
        repeat: warningActive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {config && (
        <>
          <StatsBar
            wordCount={wordCount}
            wordGoal={config.wordGoal}
            currentWPM={currentWPM}
            elapsedSeconds={elapsedSeconds}
            timeGoalSeconds={config.timeGoalSeconds}
            onStop={handleStopSession}
          />
          <div className="flex-1 overflow-hidden">
            <WritingCanvas
              text={text}
              onChange={handleTextChange}
              noBackspaceMode={noBackspaceMode}
              goalAchieved={goalAchieved}
            />
          </div>
        </>
      )}

      {showVictory && config && (
        <VictoryModal
          wordCount={wordCount}
          wordGoal={config.wordGoal}
          durationSeconds={elapsedSeconds}
          timeGoalSeconds={config.timeGoalSeconds}
          averageWPM={elapsedSeconds > 0 ? Math.round((wordCount / elapsedSeconds) * 60) : 0}
          text={text}
          onNewSession={handleNewSession}
          onViewHistory={handleViewHistory}
        />
      )}
    </motion.div>
  );
}

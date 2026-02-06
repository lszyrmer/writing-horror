import { useState, useEffect } from 'react';
import { Settings, History, Play } from 'lucide-react';
import { getUserSettings } from '../lib/supabase';

interface SplashScreenProps {
  onStart: (config: SessionConfig) => void;
  onViewHistory: () => void;
  onViewSettings: () => void;
}

export interface SessionConfig {
  wordGoal: number;
  timeGoalSeconds: number;
  minimumWPM: number;
  noBackspaceMode: boolean;
}

export default function SplashScreen({ onStart, onViewHistory, onViewSettings }: SplashScreenProps) {
  const [wordGoal, setWordGoal] = useState(500);
  const [timeGoalMinutes, setTimeGoalMinutes] = useState(30);
  const [minimumWPM, setMinimumWPM] = useState(30);
  const [noBackspaceMode, setNoBackspaceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDefaults();
  }, []);

  async function loadDefaults() {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setWordGoal(settings.default_word_goal);
        setTimeGoalMinutes(Math.floor(settings.default_time_goal_seconds / 60));
        setMinimumWPM(settings.default_minimum_wpm);
        setNoBackspaceMode(settings.no_backspace_mode);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleStart() {
    if (wordGoal < 1 || timeGoalMinutes < 1 || minimumWPM < 1) {
      alert('Please enter valid goals');
      return;
    }

    onStart({
      wordGoal,
      timeGoalSeconds: timeGoalMinutes * 60,
      minimumWPM,
      noBackspaceMode,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-gray-100">Writing Horror</h1>
          <p className="text-gray-400 text-lg">Distraction-free writing with reinforcement</p>
        </div>

        <div className="bg-dark-light border border-dark-lighter rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-100">Session Configuration</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Word Goal
              </label>
              <input
                type="number"
                value={wordGoal}
                onChange={(e) => setWordGoal(parseInt(e.target.value) || 0)}
                className="w-full bg-dark border border-dark-lighter rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Time Goal (minutes)
              </label>
              <input
                type="number"
                value={timeGoalMinutes}
                onChange={(e) => setTimeGoalMinutes(parseInt(e.target.value) || 0)}
                className="w-full bg-dark border border-dark-lighter rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-500"
                min="1"
              />
              <p className="text-gray-500 text-sm mt-1">Target time - session won't end automatically</p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Minimum WPM
              </label>
              <input
                type="number"
                value={minimumWPM}
                onChange={(e) => setMinimumWPM(parseInt(e.target.value) || 0)}
                className="w-full bg-dark border border-dark-lighter rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-500"
                min="1"
              />
              <p className="text-gray-500 text-sm mt-1">Fall below this and face the consequences</p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="noBackspace"
                checked={noBackspaceMode}
                onChange={(e) => setNoBackspaceMode(e.target.checked)}
                className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
              />
              <label htmlFor="noBackspace" className="text-gray-300 cursor-pointer select-none">
                No Backspace Mode (disable editing)
              </label>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full mt-8 bg-gray-100 hover:bg-white text-dark font-semibold py-4 rounded transition-colors flex items-center justify-center space-x-2"
          >
            <Play size={20} />
            <span>Start Writing</span>
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onViewHistory}
            className="flex-1 bg-dark-light hover:bg-dark-lighter border border-dark-lighter text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
          >
            <History size={18} />
            <span>Session History</span>
          </button>

          <button
            onClick={onViewSettings}
            className="flex-1 bg-dark-light hover:bg-dark-lighter border border-dark-lighter text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

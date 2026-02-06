import { useState } from 'react';
import { Trophy, Copy, CheckCircle, Home, History } from 'lucide-react';
import { motion } from 'framer-motion';

interface VictoryModalProps {
  wordCount: number;
  wordGoal: number;
  durationSeconds: number;
  timeGoalSeconds: number;
  averageWPM: number;
  text: string;
  onNewSession: () => void;
  onViewHistory: () => void;
}

export default function VictoryModal({
  wordCount,
  wordGoal,
  durationSeconds,
  timeGoalSeconds,
  averageWPM,
  text,
  onNewSession,
  onViewHistory,
}: VictoryModalProps) {
  const [copied, setCopied] = useState(false);

  const timeGoalAchieved = durationSeconds <= timeGoalSeconds;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-light border border-dark-lighter rounded-lg p-5 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Trophy size={48} className="text-success sm:w-16 sm:h-16" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">Success!</h2>
          <p className="text-gray-400 text-base sm:text-lg">You've reached your writing goal</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-dark border border-dark-lighter rounded-lg p-3 sm:p-4 text-center">
            <div className="text-gray-400 text-xs sm:text-sm mb-1">Words Written</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-100">{wordCount}</div>
            <div className="text-gray-500 text-xs sm:text-sm mt-1">Goal: {wordGoal}</div>
          </div>

          <div className="bg-dark border border-dark-lighter rounded-lg p-3 sm:p-4 text-center">
            <div className="text-gray-400 text-xs sm:text-sm mb-1">Time Taken</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-100">{formatTime(durationSeconds)}</div>
            <div className={`text-xs sm:text-sm mt-1 ${timeGoalAchieved ? 'text-success' : 'text-gray-500'}`}>
              Goal: {formatTime(timeGoalSeconds)}
              {timeGoalAchieved && ' ✓'}
            </div>
          </div>

          <div className="bg-dark border border-dark-lighter rounded-lg p-3 sm:p-4 text-center col-span-2">
            <div className="text-gray-400 text-xs sm:text-sm mb-1">Average WPM</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-100">{averageWPM}</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCopy}
            className="w-full bg-gray-100 hover:bg-white text-dark font-semibold py-3.5 sm:py-4 rounded transition-colors flex items-center justify-center space-x-2"
          >
            {copied ? (
              <>
                <CheckCircle size={20} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={20} />
                <span>Copy Work to Clipboard</span>
              </>
            )}
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNewSession}
              className="flex-1 bg-dark-light hover:bg-dark-lighter border border-dark-lighter text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
            >
              <Home size={18} />
              <span>New Session</span>
            </button>

            <button
              onClick={onViewHistory}
              className="flex-1 bg-dark-light hover:bg-dark-lighter border border-dark-lighter text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
            >
              <History size={18} />
              <span>View History</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

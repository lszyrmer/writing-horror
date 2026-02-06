import { Clock, Target, Zap, Square } from 'lucide-react';

interface StatsBarProps {
  wordCount: number;
  wordGoal: number;
  currentWPM: number;
  elapsedSeconds: number;
  timeGoalSeconds: number;
  onStop: () => void;
}

interface PaceStatus {
  label: string;
  textColor: string;
  requiredWPM: number;
}

function getPaceStatus(
  wordCount: number,
  wordGoal: number,
  currentWPM: number,
  elapsedSeconds: number,
  timeGoalSeconds: number,
): PaceStatus | null {
  if (wordCount >= wordGoal) return null;
  if (elapsedSeconds < 8) return null;

  const wordsRemaining = wordGoal - wordCount;
  const timeRemainingSeconds = timeGoalSeconds - elapsedSeconds;

  if (timeRemainingSeconds <= 0) {
    return {
      label: 'Time up',
      textColor: 'text-red-400',
      requiredWPM: 0,
    };
  }

  const timeRemainingMinutes = timeRemainingSeconds / 60;
  const requiredWPM = Math.round(wordsRemaining / timeRemainingMinutes);

  if (currentWPM === 0) {
    return {
      label: 'Start typing',
      textColor: 'text-gray-400',
      requiredWPM,
    };
  }

  const ratio = currentWPM / requiredWPM;

  if (ratio >= 1.3) {
    return {
      label: 'Ahead',
      textColor: 'text-emerald-400',
      requiredWPM,
    };
  }
  if (ratio >= 1.0) {
    return {
      label: 'On pace',
      textColor: 'text-emerald-500',
      requiredWPM,
    };
  }
  if (ratio >= 0.75) {
    return {
      label: 'Pick up pace',
      textColor: 'text-yellow-400',
      requiredWPM,
    };
  }
  return {
    label: 'Falling behind',
    textColor: 'text-red-400',
    requiredWPM,
  };
}

export default function StatsBar({
  wordCount,
  wordGoal,
  currentWPM,
  elapsedSeconds,
  timeGoalSeconds,
  onStop,
}: StatsBarProps) {
  const timeGoalReached = elapsedSeconds >= timeGoalSeconds;
  const goalReached = wordCount >= wordGoal;

  const pace = getPaceStatus(wordCount, wordGoal, currentWPM, elapsedSeconds, timeGoalSeconds);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="bg-dark-light border-b border-dark-lighter px-3 sm:px-8 py-2 sm:py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 max-w-7xl mx-auto">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <Target size={16} className="text-gray-400 hidden sm:block" />
          <span className="text-gray-300 font-medium text-sm sm:text-base">
            {wordCount}/{wordGoal}
          </span>
          {goalReached && (
            <span className="text-success text-xs sm:text-sm">Done!</span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <Clock size={16} className={`hidden sm:block ${timeGoalReached ? 'text-success' : 'text-gray-400'}`} />
          <span className={`font-medium text-sm sm:text-base ${timeGoalReached ? 'text-success' : 'text-gray-300'}`}>
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-gray-500 text-sm">/</span>
          <span className="text-gray-400 text-sm">{formatTime(timeGoalSeconds)}</span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <Zap size={16} className="text-gray-400 hidden sm:block" />
          <span className="text-gray-100 font-bold text-base sm:text-xl">
            {currentWPM}
          </span>
          <span className="text-gray-400 text-sm">WPM</span>
          {pace && !goalReached && (
            <span className={`text-xs sm:text-sm font-medium ${pace.textColor} hidden sm:inline`}>
              {pace.label}
            </span>
          )}
        </div>

        <button
          onClick={onStop}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-colors text-xs sm:text-sm"
          title="Stop session and save progress"
        >
          <Square size={12} fill="currentColor" className="sm:w-3.5 sm:h-3.5" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
}

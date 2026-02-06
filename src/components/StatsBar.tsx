import { Clock, Target, Zap, Square, TrendingUp, TrendingDown, AlertTriangle, Check } from 'lucide-react';

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
  color: string;
  textColor: string;
  icon: typeof TrendingUp;
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
      color: 'bg-red-900/40 border-red-700/50',
      textColor: 'text-red-400',
      icon: AlertTriangle,
      requiredWPM: 0,
    };
  }

  const timeRemainingMinutes = timeRemainingSeconds / 60;
  const requiredWPM = Math.round(wordsRemaining / timeRemainingMinutes);

  if (currentWPM === 0) {
    return {
      label: 'Start typing',
      color: 'bg-gray-800/40 border-gray-700/50',
      textColor: 'text-gray-400',
      icon: TrendingUp,
      requiredWPM,
    };
  }

  const ratio = currentWPM / requiredWPM;

  if (ratio >= 1.3) {
    return {
      label: 'Ahead',
      color: 'bg-emerald-900/30 border-emerald-700/40',
      textColor: 'text-emerald-400',
      icon: Check,
      requiredWPM,
    };
  }
  if (ratio >= 1.0) {
    return {
      label: 'On pace',
      color: 'bg-emerald-900/20 border-emerald-800/30',
      textColor: 'text-emerald-500',
      icon: TrendingUp,
      requiredWPM,
    };
  }
  if (ratio >= 0.75) {
    return {
      label: 'Pick up pace',
      color: 'bg-yellow-900/30 border-yellow-700/40',
      textColor: 'text-yellow-400',
      icon: TrendingDown,
      requiredWPM,
    };
  }
  return {
    label: 'Falling behind',
    color: 'bg-red-900/30 border-red-700/40',
    textColor: 'text-red-400',
    icon: AlertTriangle,
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
    <div className="bg-dark-light border-b border-dark-lighter px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Target size={18} className="text-gray-400" />
          <span className="text-gray-300 font-medium">
            {wordCount} / {wordGoal} words
          </span>
          {goalReached && (
            <span className="text-success text-sm ml-2">Goal Reached!</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Clock size={18} className={timeGoalReached ? 'text-success' : 'text-gray-400'} />
          <span className={`font-medium ${timeGoalReached ? 'text-success' : 'text-gray-300'}`}>
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400">{formatTime(timeGoalSeconds)}</span>
          {timeGoalReached && (
            <span className="text-success text-sm ml-2">Time Goal!</span>
          )}
        </div>

        {pace && !goalReached && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded border ${pace.color}`}>
            <pace.icon size={14} className={pace.textColor} />
            <span className={`text-sm font-medium ${pace.textColor}`}>
              {pace.label}
            </span>
            {pace.requiredWPM > 0 && (
              <span className="text-gray-500 text-xs">
                need {pace.requiredWPM} wpm
              </span>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Zap size={18} className="text-gray-400" />
          <span className="text-gray-100 font-bold text-xl">
            {currentWPM}
          </span>
          <span className="text-gray-400">WPM</span>
        </div>

        <button
          onClick={onStop}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-colors text-sm"
          title="Stop session and save progress"
        >
          <Square size={14} fill="currentColor" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
}

import { Clock, Target, Zap, Square } from 'lucide-react';

interface StatsBarProps {
  wordCount: number;
  wordGoal: number;
  currentWPM: number;
  elapsedSeconds: number;
  timeGoalSeconds: number;
  onStop: () => void;
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

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="bg-dark-light border-b border-dark-lighter px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Target size={18} className="text-gray-400" />
          <span className="text-gray-300 font-medium">
            {wordCount} / {wordGoal} words
          </span>
          {wordCount >= wordGoal && (
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

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Clock, FileText, Zap } from 'lucide-react';
import { getSessions, WritingSession } from '../lib/supabase';

interface SessionHistoryProps {
  onBack: () => void;
}

export default function SessionHistory({ onBack }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  const totalWords = sessions.reduce((sum, s) => sum + s.word_count, 0);
  const totalTime = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
  const avgWPM = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.average_wpm, 0) / sessions.length)
    : 0;
  const goalsAchieved = sessions.filter(s => s.word_goal_achieved).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>

          <h1 className="text-4xl font-bold text-gray-100 mb-2">Session History</h1>
          <p className="text-gray-400">Track your writing progress over time</p>
        </div>

        {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-light border border-dark-lighter rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText size={18} className="text-gray-400" />
                <span className="text-gray-400 text-sm">Total Words</span>
              </div>
              <div className="text-3xl font-bold text-gray-100">{totalWords.toLocaleString()}</div>
            </div>

            <div className="bg-dark-light border border-dark-lighter rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={18} className="text-gray-400" />
                <span className="text-gray-400 text-sm">Total Time</span>
              </div>
              <div className="text-3xl font-bold text-gray-100">{formatDuration(totalTime)}</div>
            </div>

            <div className="bg-dark-light border border-dark-lighter rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap size={18} className="text-gray-400" />
                <span className="text-gray-400 text-sm">Avg WPM</span>
              </div>
              <div className="text-3xl font-bold text-gray-100">{avgWPM}</div>
            </div>

            <div className="bg-dark-light border border-dark-lighter rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy size={18} className="text-gray-400" />
                <span className="text-gray-400 text-sm">Goals Hit</span>
              </div>
              <div className="text-3xl font-bold text-gray-100">{goalsAchieved}/{sessions.length}</div>
            </div>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="bg-dark-light border border-dark-lighter rounded-lg p-12 text-center">
            <FileText size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No sessions yet</h3>
            <p className="text-gray-500">Start writing to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-dark-light border border-dark-lighter rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      {formatDate(session.created_at)}
                    </div>
                    <div className="flex items-center space-x-3">
                      {session.word_goal_achieved ? (
                        <div className="flex items-center space-x-1 text-success">
                          <CheckCircle size={18} />
                          <span className="text-sm font-medium">Goal Achieved</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <XCircle size={18} />
                          <span className="text-sm font-medium">Goal Not Met</span>
                        </div>
                      )}
                      {session.no_backspace_mode && (
                        <span className="text-xs bg-dark border border-dark-lighter px-2 py-1 rounded text-gray-400">
                          No Backspace
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Words</div>
                    <div className="text-gray-100 font-semibold">
                      {session.word_count} / {session.word_goal}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Duration</div>
                    <div className="text-gray-100 font-semibold">
                      {formatDuration(session.duration_seconds)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Avg WPM</div>
                    <div className="text-gray-100 font-semibold">
                      {Math.round(session.average_wpm)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Min WPM</div>
                    <div className="text-gray-100 font-semibold">
                      {session.minimum_wpm}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

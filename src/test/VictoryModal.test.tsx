import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VictoryModal from '../components/VictoryModal';

const baseProps = {
  wordCount: 500,
  wordGoal: 500,
  durationSeconds: 1200,
  timeGoalSeconds: 1800,
  averageWPM: 25,
  text: 'Hello world this is some writing.',
  onNewSession: vi.fn(),
  onViewHistory: vi.fn(),
};

describe('VictoryModal', () => {
  describe('heading and messaging when word goal is achieved', () => {
    it('shows "Success!" when word count meets word goal', () => {
      render(<VictoryModal {...baseProps} wordCount={500} wordGoal={500} />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('shows "Success!" when word count exceeds word goal', () => {
      render(<VictoryModal {...baseProps} wordCount={600} wordGoal={500} />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('shows goal-achieved subtitle when word goal is met', () => {
      render(<VictoryModal {...baseProps} wordCount={500} wordGoal={500} />);
      expect(screen.getByText("You've reached your writing goal")).toBeInTheDocument();
    });
  });

  describe('heading and messaging when word goal is NOT achieved', () => {
    it('shows "Session Complete" when word count is below word goal', () => {
      render(<VictoryModal {...baseProps} wordCount={300} wordGoal={500} />);
      expect(screen.getByText('Session Complete')).toBeInTheDocument();
    });

    it('does not show "Success!" when word goal not reached', () => {
      render(<VictoryModal {...baseProps} wordCount={1} wordGoal={500} />);
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });

    it('shows encouraging subtitle when word goal not met', () => {
      render(<VictoryModal {...baseProps} wordCount={100} wordGoal={500} />);
      expect(screen.getByText('Keep going\u2014every word counts')).toBeInTheDocument();
    });
  });

  describe('word count stats', () => {
    it('displays the actual word count', () => {
      render(<VictoryModal {...baseProps} wordCount={342} wordGoal={500} />);
      expect(screen.getByText('342')).toBeInTheDocument();
    });

    it('displays the word goal', () => {
      render(<VictoryModal {...baseProps} wordCount={342} wordGoal={500} />);
      expect(screen.getByText('Goal: 500')).toBeInTheDocument();
    });

    it('shows checkmark next to word goal when achieved', () => {
      render(<VictoryModal {...baseProps} wordCount={500} wordGoal={500} />);
      expect(screen.getByText(/Goal: 500\s*✓/)).toBeInTheDocument();
    });

    it('does not show checkmark next to word goal when not achieved', () => {
      render(<VictoryModal {...baseProps} wordCount={300} wordGoal={500} />);
      const goalText = screen.getByText(/Goal: 500/);
      expect(goalText.textContent).not.toContain('✓');
    });
  });

  describe('time stats', () => {
    it('displays formatted session duration', () => {
      render(<VictoryModal {...baseProps} durationSeconds={90} />);
      expect(screen.getByText('1m 30s')).toBeInTheDocument();
    });

    it('displays formatted time goal', () => {
      render(<VictoryModal {...baseProps} durationSeconds={2000} timeGoalSeconds={1800} />);
      expect(screen.getByText(/Goal: 30m 0s/)).toBeInTheDocument();
    });

    it('shows checkmark on time goal when finished before goal', () => {
      render(<VictoryModal {...baseProps} durationSeconds={1200} timeGoalSeconds={1800} />);
      const el = screen.getByText(/Goal: 30m 0s/);
      expect(el.textContent).toContain('✓');
    });

    it('does not show checkmark on time goal when over time', () => {
      render(<VictoryModal {...baseProps} durationSeconds={2000} timeGoalSeconds={1800} />);
      const timeGoalEl = screen.getByText(/Goal: 30m 0s/);
      expect(timeGoalEl.textContent).not.toContain('✓');
    });
  });

  describe('average WPM', () => {
    it('displays average WPM', () => {
      render(<VictoryModal {...baseProps} averageWPM={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('copy to clipboard', () => {
    it('renders the copy button', () => {
      render(<VictoryModal {...baseProps} />);
      expect(screen.getByText('Copy Work to Clipboard')).toBeInTheDocument();
    });

    it('shows "Copied!" feedback after clicking copy', async () => {
      render(<VictoryModal {...baseProps} />);
      fireEvent.click(screen.getByText('Copy Work to Clipboard'));
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('calls clipboard writeText with the written text', async () => {
      render(<VictoryModal {...baseProps} text="My written text" />);
      fireEvent.click(screen.getByText('Copy Work to Clipboard'));
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('My written text');
      });
    });
  });

  describe('navigation buttons', () => {
    it('calls onNewSession when "New Session" is clicked', () => {
      const onNewSession = vi.fn();
      render(<VictoryModal {...baseProps} onNewSession={onNewSession} />);
      fireEvent.click(screen.getByText('New Session'));
      expect(onNewSession).toHaveBeenCalledOnce();
    });

    it('calls onViewHistory when "View History" is clicked', () => {
      const onViewHistory = vi.fn();
      render(<VictoryModal {...baseProps} onViewHistory={onViewHistory} />);
      fireEvent.click(screen.getByText('View History'));
      expect(onViewHistory).toHaveBeenCalledOnce();
    });
  });

  describe('edge cases', () => {
    it('handles 0 words written (session with no content)', () => {
      render(<VictoryModal {...baseProps} wordCount={0} wordGoal={500} />);
      expect(screen.getByText('Session Complete')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('formats zero-second duration correctly', () => {
      render(<VictoryModal {...baseProps} durationSeconds={0} />);
      expect(screen.getByText('0m 0s')).toBeInTheDocument();
    });

    it('formats duration with only seconds correctly', () => {
      render(<VictoryModal {...baseProps} durationSeconds={45} />);
      expect(screen.getByText('0m 45s')).toBeInTheDocument();
    });

    it('formats duration crossing hour boundary', () => {
      render(<VictoryModal {...baseProps} durationSeconds={3661} />);
      expect(screen.getByText('61m 1s')).toBeInTheDocument();
    });
  });
});

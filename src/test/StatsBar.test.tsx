import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatsBar from '../components/StatsBar';

const baseProps = {
  wordCount: 0,
  wordGoal: 500,
  currentWPM: 0,
  elapsedSeconds: 0,
  timeGoalSeconds: 1800,
  onStop: vi.fn(),
};

describe('StatsBar', () => {
  describe('word count display', () => {
    it('displays current word count and goal', () => {
      render(<StatsBar {...baseProps} wordCount={123} wordGoal={500} />);
      expect(screen.getByText('123/500')).toBeInTheDocument();
    });

    it('shows "Done!" when word goal is reached', () => {
      render(<StatsBar {...baseProps} wordCount={500} wordGoal={500} />);
      expect(screen.getByText('Done!')).toBeInTheDocument();
    });

    it('does not show "Done!" before word goal is reached', () => {
      render(<StatsBar {...baseProps} wordCount={499} wordGoal={500} />);
      expect(screen.queryByText('Done!')).not.toBeInTheDocument();
    });

    it('shows "Done!" when word count exceeds goal', () => {
      render(<StatsBar {...baseProps} wordCount={600} wordGoal={500} />);
      expect(screen.getByText('Done!')).toBeInTheDocument();
    });
  });

  describe('time display', () => {
    it('displays elapsed time in MM:SS format', () => {
      render(<StatsBar {...baseProps} elapsedSeconds={75} />);
      expect(screen.getByText('1:15')).toBeInTheDocument();
    });

    it('displays time goal in MM:SS format', () => {
      render(<StatsBar {...baseProps} timeGoalSeconds={1800} />);
      expect(screen.getByText('30:00')).toBeInTheDocument();
    });

    it('pads single-digit seconds with leading zero', () => {
      render(<StatsBar {...baseProps} elapsedSeconds={65} />);
      expect(screen.getByText('1:05')).toBeInTheDocument();
    });

    it('displays 0:00 at the start', () => {
      render(<StatsBar {...baseProps} elapsedSeconds={0} />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  describe('WPM display', () => {
    it('displays current WPM', () => {
      render(<StatsBar {...baseProps} currentWPM={65} />);
      expect(screen.getByText('65')).toBeInTheDocument();
    });

    it('displays 0 WPM when not typing', () => {
      render(<StatsBar {...baseProps} currentWPM={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('pace status labels', () => {
    it('shows no pace status before 8 seconds have passed', () => {
      render(<StatsBar {...baseProps} elapsedSeconds={7} currentWPM={50} />);
      expect(screen.queryByText('On pace')).not.toBeInTheDocument();
      expect(screen.queryByText('Falling behind')).not.toBeInTheDocument();
      expect(screen.queryByText('Ahead')).not.toBeInTheDocument();
    });

    it('shows "Start typing" when WPM is 0 after warm-up', () => {
      render(<StatsBar {...baseProps} elapsedSeconds={10} currentWPM={0} wordCount={0} wordGoal={500} timeGoalSeconds={1800} />);
      expect(screen.getByText('Start typing')).toBeInTheDocument();
    });

    it('shows "Time up" when elapsed exceeds time goal', () => {
      render(<StatsBar {...baseProps} elapsedSeconds={1801} currentWPM={30} wordCount={0} wordGoal={500} timeGoalSeconds={1800} />);
      expect(screen.getByText('Time up')).toBeInTheDocument();
    });

    it('shows "Falling behind" when WPM is less than 75% of required', () => {
      render(
        <StatsBar
          {...baseProps}
          elapsedSeconds={60}
          currentWPM={10}
          wordCount={0}
          wordGoal={500}
          timeGoalSeconds={1800}
        />
      );
      expect(screen.getByText('Falling behind')).toBeInTheDocument();
    });

    it('shows "Pick up pace" when WPM is 75-100% of required', () => {
      render(
        <StatsBar
          {...baseProps}
          elapsedSeconds={60}
          currentWPM={14}
          wordCount={0}
          wordGoal={500}
          timeGoalSeconds={1800}
        />
      );
      expect(screen.getByText('Pick up pace')).toBeInTheDocument();
    });

    it('shows "On pace" when WPM is 100-130% of required', () => {
      render(
        <StatsBar
          {...baseProps}
          elapsedSeconds={60}
          currentWPM={17}
          wordCount={0}
          wordGoal={500}
          timeGoalSeconds={1800}
        />
      );
      expect(screen.getByText('On pace')).toBeInTheDocument();
    });

    it('shows "Ahead" when WPM is more than 130% of required', () => {
      render(
        <StatsBar
          {...baseProps}
          elapsedSeconds={60}
          currentWPM={40}
          wordCount={0}
          wordGoal={500}
          timeGoalSeconds={1800}
        />
      );
      expect(screen.getByText('Ahead')).toBeInTheDocument();
    });

    it('hides pace label after word goal is achieved', () => {
      render(
        <StatsBar
          {...baseProps}
          elapsedSeconds={60}
          currentWPM={10}
          wordCount={500}
          wordGoal={500}
        />
      );
      expect(screen.queryByText('Falling behind')).not.toBeInTheDocument();
      expect(screen.queryByText('On pace')).not.toBeInTheDocument();
    });
  });

  describe('stop button', () => {
    it('renders the stop button', () => {
      render(<StatsBar {...baseProps} />);
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    it('calls onStop when stop button is clicked', () => {
      const onStop = vi.fn();
      render(<StatsBar {...baseProps} onStop={onStop} />);
      fireEvent.click(screen.getByText('Stop'));
      expect(onStop).toHaveBeenCalledOnce();
    });
  });
});

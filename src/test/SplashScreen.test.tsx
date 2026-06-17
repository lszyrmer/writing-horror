import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SplashScreen from '../components/SplashScreen';

vi.mock('../lib/storage', () => ({
  getUserSettings: vi.fn().mockResolvedValue({
    default_word_goal: 500,
    default_time_goal_seconds: 1800,
    default_minimum_wpm: 30,
    no_backspace_mode: false,
    target_wpm: 60,
    custom_audio_url: '',
    use_custom_audio: false,
    typewriter_sound_enabled: true,
    use_custom_typewriter: false,
    custom_typewriter_url: '',
    use_custom_paragraph_sound: false,
    custom_paragraph_sound_url: '',
    use_custom_target_wpm_sound: false,
    custom_target_wpm_sound_url: '',
    fullscreen_enabled: true,
  }),
}));

describe('SplashScreen', () => {
  const onStart = vi.fn();
  const onViewHistory = vi.fn();
  const onViewSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderAndWait() {
    render(
      <SplashScreen
        onStart={onStart}
        onViewHistory={onViewHistory}
        onViewSettings={onViewSettings}
      />
    );
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  }

  describe('page title', () => {
    it('shows "Writing Horror" as the main title', async () => {
      await renderAndWait();
      expect(screen.getByText('Writing Horror')).toBeInTheDocument();
    });

    it('shows the tagline', async () => {
      await renderAndWait();
      expect(screen.getByText('Distraction-free writing with reinforcement')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator before settings load', () => {
      render(
        <SplashScreen
          onStart={onStart}
          onViewHistory={onViewHistory}
          onViewSettings={onViewSettings}
        />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('hides loading indicator after settings load', async () => {
      await renderAndWait();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('default values from settings', () => {
    it('pre-fills word goal from user settings', async () => {
      await renderAndWait();
      const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
      expect(inputs[0].value).toBe('500');
    });

    it('pre-fills time goal in minutes from user settings', async () => {
      await renderAndWait();
      const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
      expect(inputs[1].value).toBe('30');
    });
  });

  describe('starting a session', () => {
    it('calls onStart with correct config when Start Writing is clicked', async () => {
      await renderAndWait();
      fireEvent.click(screen.getByText('Start Writing'));
      expect(onStart).toHaveBeenCalledWith({
        wordGoal: 500,
        timeGoalSeconds: 1800,
      });
    });

    it('converts minutes to seconds when starting session', async () => {
      await renderAndWait();
      const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
      fireEvent.change(inputs[1], { target: { value: '45' } });
      fireEvent.click(screen.getByText('Start Writing'));
      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ timeGoalSeconds: 2700 })
      );
    });

    it('uses updated word goal when starting session', async () => {
      await renderAndWait();
      const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: '1000' } });
      fireEvent.click(screen.getByText('Start Writing'));
      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ wordGoal: 1000 })
      );
    });

    it('shows an alert and does not start when word goal is 0', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      await renderAndWait();
      const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: '0' } });
      fireEvent.click(screen.getByText('Start Writing'));
      expect(alertSpy).toHaveBeenCalledWith('Please enter valid goals');
      expect(onStart).not.toHaveBeenCalled();
    });

    it('shows an alert and does not start when time goal is 0', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      await renderAndWait();
      const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
      fireEvent.change(inputs[1], { target: { value: '0' } });
      fireEvent.click(screen.getByText('Start Writing'));
      expect(alertSpy).toHaveBeenCalledWith('Please enter valid goals');
      expect(onStart).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('calls onViewHistory when Session History is clicked', async () => {
      await renderAndWait();
      fireEvent.click(screen.getByText('Session History'));
      expect(onViewHistory).toHaveBeenCalledOnce();
    });

    it('calls onViewSettings when Settings is clicked', async () => {
      await renderAndWait();
      fireEvent.click(screen.getByText('Settings'));
      expect(onViewSettings).toHaveBeenCalledOnce();
    });
  });

  describe('session configuration form', () => {
    it('shows the Session Configuration heading', async () => {
      await renderAndWait();
      expect(screen.getByText('Session Configuration')).toBeInTheDocument();
    });

    it('shows the time goal note about session duration', async () => {
      await renderAndWait();
      expect(screen.getByText("Target time - session won't end automatically")).toBeInTheDocument();
    });
  });
});

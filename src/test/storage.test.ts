import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSession,
  getSessions,
  getUserSettings,
  saveUserSettings,
  saveCustomAudioBlob,
  deleteCustomAudioBlob,
  getCustomAudioUrls,
  _resetForTests,
  WritingSession,
} from '../lib/storage';

const sampleSession: WritingSession = {
  word_count: 500,
  duration_seconds: 600,
  average_wpm: 50,
  word_goal: 500,
  time_goal_seconds: 1800,
  minimum_wpm: 30,
  word_goal_achieved: true,
  time_goal_achieved: true,
  no_backspace_mode: false,
};

beforeEach(async () => {
  // Drop the cached connection, delete the database, and clear localStorage so
  // each test starts from empty state.
  _resetForTests();
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase('writing-horror');
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  localStorage.removeItem('writing-horror:settings');
});

describe('sessions', () => {
  it('saves a session with a generated id and created_at', async () => {
    const saved = await saveSession(sampleSession);
    expect(saved.id).toBeTruthy();
    expect(saved.created_at).toBeTruthy();
    expect(saved.word_count).toBe(500);
  });

  it('returns saved sessions newest-first', async () => {
    await saveSession({ ...sampleSession, created_at: '2026-01-01T00:00:00.000Z', word_count: 1 });
    await saveSession({ ...sampleSession, created_at: '2026-02-01T00:00:00.000Z', word_count: 2 });
    const sessions = await getSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].word_count).toBe(2);
    expect(sessions[1].word_count).toBe(1);
  });
});

describe('settings', () => {
  it('returns null when nothing is stored', async () => {
    expect(await getUserSettings()).toBeNull();
  });

  it('persists and merges partial updates', async () => {
    await saveUserSettings({ default_word_goal: 750, default_minimum_wpm: 40 });
    await saveUserSettings({ default_word_goal: 800 });
    const settings = await getUserSettings();
    expect(settings?.default_word_goal).toBe(800);
    expect(settings?.default_minimum_wpm).toBe(40);
  });

  it('does not persist transient object-URL fields', async () => {
    await saveUserSettings({ default_word_goal: 500, custom_audio_url: 'blob:should-not-survive' });
    const raw = localStorage.getItem('writing-horror:settings')!;
    expect(raw).not.toContain('blob:should-not-survive');
    expect(raw).not.toContain('custom_audio_url');
  });
});

describe('custom audio blobs', () => {
  it('rehydrates a stored blob as an object URL via getCustomAudioUrls', async () => {
    await saveUserSettings({ use_custom_audio: true });
    await saveCustomAudioBlob('alert', new Blob(['x'], { type: 'audio/mpeg' }));
    const urls = await getCustomAudioUrls();
    expect(urls.custom_audio_url).toMatch(/^blob:/);
  });

  it('does not mint object URLs from getUserSettings', async () => {
    await saveUserSettings({ use_custom_audio: true });
    await saveCustomAudioBlob('alert', new Blob(['x'], { type: 'audio/mpeg' }));
    const settings = await getUserSettings();
    expect(settings?.custom_audio_url).toBe('');
  });

  it('clears the object URL after the blob is deleted', async () => {
    await saveUserSettings({ use_custom_audio: true });
    await saveCustomAudioBlob('alert', new Blob(['x'], { type: 'audio/mpeg' }));
    await deleteCustomAudioBlob('alert');
    const urls = await getCustomAudioUrls();
    expect(urls.custom_audio_url).toBe('');
  });
});

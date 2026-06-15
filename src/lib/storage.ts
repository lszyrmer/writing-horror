// Local-first persistence. No backend, no auth.
// - writing sessions  -> IndexedDB (per-device history, naturally local)
// - user settings      -> localStorage (small JSON blob)
// - custom audio files -> IndexedDB Blobs, served as object URLs
//
// This replaces the former Supabase client. Nothing leaves the browser, so the
// app runs with zero setup: clone, npm install, npm run dev.

const DB_NAME = 'writing-horror';
const DB_VERSION = 1;
const SESSIONS_STORE = 'sessions';
const AUDIO_STORE = 'audio';
const SETTINGS_KEY = 'writing-horror:settings';

export interface WritingSession {
  id?: string;
  word_count: number;
  duration_seconds: number;
  average_wpm: number;
  word_goal: number;
  time_goal_seconds: number;
  minimum_wpm: number;
  word_goal_achieved: boolean;
  time_goal_achieved: boolean;
  no_backspace_mode: boolean;
  created_at?: string;
}

export interface UserSettings {
  default_word_goal: number;
  default_time_goal_seconds: number;
  default_minimum_wpm: number;
  no_backspace_mode: boolean;
  target_wpm: number;
  fullscreen_enabled: boolean;
  use_custom_audio: boolean;
  typewriter_sound_enabled: boolean;
  use_custom_typewriter: boolean;
  use_custom_paragraph_sound: boolean;
  use_custom_target_wpm_sound: boolean;
  // Transient: rehydrated from the audio store as object URLs on read.
  // Never persisted (object URLs are per-page-load).
  custom_audio_url: string;
  custom_typewriter_url: string;
  custom_paragraph_sound_url: string;
  custom_target_wpm_sound_url: string;
}

// The four customizable sounds and the settings field each maps to.
export type SoundType = 'alert' | 'typewriter' | 'paragraph' | 'targetWpm';

const SOUND_URL_FIELD: Record<SoundType, keyof UserSettings> = {
  alert: 'custom_audio_url',
  typewriter: 'custom_typewriter_url',
  paragraph: 'custom_paragraph_sound_url',
  targetWpm: 'custom_target_wpm_sound_url',
};

let dbPromise: Promise<IDBDatabase> | null = null;
let openDb: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'type' });
      }
    };
    req.onsuccess = () => {
      openDb = req.result;
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// Test-only: close and drop the cached connection so a freshly-deleted
// database can be reopened without a blocked deleteDatabase.
export function _resetForTests(): void {
  if (openDb) {
    openDb.close();
    openDb = null;
  }
  dbPromise = null;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(store, mode).objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older environments.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// --- Sessions ---------------------------------------------------------------

export async function saveSession(session: WritingSession): Promise<WritingSession> {
  const record: WritingSession = {
    ...session,
    id: session.id ?? uuid(),
    created_at: session.created_at ?? new Date().toISOString(),
  };
  await tx(SESSIONS_STORE, 'readwrite', (s) => s.put(record));
  return record;
}

export async function getSessions(): Promise<WritingSession[]> {
  const all = await tx<WritingSession[]>(SESSIONS_STORE, 'readonly', (s) => s.getAll());
  return all.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
}

// --- Custom audio blobs -----------------------------------------------------

export async function saveCustomAudioBlob(type: SoundType, blob: Blob): Promise<void> {
  await tx(AUDIO_STORE, 'readwrite', (s) => s.put({ type, blob }));
}

export async function deleteCustomAudioBlob(type: SoundType): Promise<void> {
  await tx(AUDIO_STORE, 'readwrite', (s) => s.delete(type));
}

async function getAudioBlob(type: SoundType): Promise<Blob | null> {
  const rec = await tx<{ type: SoundType; blob: Blob } | undefined>(
    AUDIO_STORE,
    'readonly',
    (s) => s.get(type),
  );
  return rec?.blob ?? null;
}

// --- Settings ---------------------------------------------------------------

// Persisted settings exclude the transient object-URL fields.
type PersistedSettings = Omit<
  UserSettings,
  'custom_audio_url' | 'custom_typewriter_url' | 'custom_paragraph_sound_url' | 'custom_target_wpm_sound_url'
>;

function readPersistedSettings(): Partial<PersistedSettings> | null {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Object URLs handed out by the previous getUserSettings call, revoked before
// the next batch is minted so repeated reads don't accumulate blob URLs.
let issuedAudioUrls: string[] = [];

export async function getUserSettings(): Promise<UserSettings | null> {
  const stored = readPersistedSettings();
  if (!stored) return null;

  for (const url of issuedAudioUrls) {
    URL.revokeObjectURL(url);
  }
  issuedAudioUrls = [];

  const settings = {
    custom_audio_url: '',
    custom_typewriter_url: '',
    custom_paragraph_sound_url: '',
    custom_target_wpm_sound_url: '',
    ...stored,
  } as UserSettings;

  // Rehydrate custom-sound object URLs from stored blobs.
  await Promise.all(
    (Object.keys(SOUND_URL_FIELD) as SoundType[]).map(async (type) => {
      const blob = await getAudioBlob(type);
      if (blob) {
        const url = URL.createObjectURL(blob);
        issuedAudioUrls.push(url);
        (settings[SOUND_URL_FIELD[type]] as string) = url;
      }
    }),
  );

  return settings;
}

export async function saveUserSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  const existing = readPersistedSettings() ?? {};
  const merged = { ...existing, ...partial } as UserSettings;

  // Strip the transient object-URL fields before persisting.
  const {
    custom_audio_url: _a,
    custom_typewriter_url: _t,
    custom_paragraph_sound_url: _p,
    custom_target_wpm_sound_url: _w,
    ...toPersist
  } = merged;
  void _a; void _t; void _p; void _w;

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(toPersist));
  return merged;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  id?: string;
  default_word_goal: number;
  default_time_goal_seconds: number;
  default_minimum_wpm: number;
  no_backspace_mode: boolean;
  custom_audio_url: string;
  use_custom_audio: boolean;
  typewriter_sound_enabled: boolean;
  use_custom_typewriter: boolean;
  custom_typewriter_url: string;
  use_custom_paragraph_sound: boolean;
  custom_paragraph_sound_url: string;
  updated_at?: string;
}

export interface CustomAudioFile {
  id?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at?: string;
}

export async function saveSession(session: WritingSession) {
  const { data, error } = await supabase
    .from('writing_sessions')
    .insert(session)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSessions() {
  const { data, error } = await supabase
    .from('writing_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserSettings() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveUserSettings(settings: Partial<UserSettings>) {
  const existing = await getUserSettings();

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert(settings)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export async function saveCustomAudio(audioFile: CustomAudioFile) {
  const { data, error } = await supabase
    .from('custom_audio_files')
    .insert(audioFile)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

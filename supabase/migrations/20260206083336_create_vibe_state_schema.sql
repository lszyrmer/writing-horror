/*
  # Vibe State Database Schema

  ## Overview
  Creates the complete database schema for the Vibe State writing application,
  including tables for session tracking, user settings, and custom audio files.

  ## Tables Created

  ### 1. writing_sessions
  Stores completed writing sessions with comprehensive metrics:
  - `id` (uuid, primary key) - Unique session identifier
  - `word_count` (integer) - Total words written in session
  - `duration_seconds` (integer) - Total time spent writing
  - `average_wpm` (decimal) - Average words per minute for session
  - `word_goal` (integer) - Target word count set for session
  - `time_goal_seconds` (integer) - Target time in seconds
  - `minimum_wpm` (integer) - Minimum WPM threshold set
  - `word_goal_achieved` (boolean) - Whether word goal was met
  - `time_goal_achieved` (boolean) - Whether time goal was met
  - `no_backspace_mode` (boolean) - Whether backspace was disabled
  - `created_at` (timestamptz) - Session completion timestamp

  ### 2. user_settings
  Stores user preferences and configuration:
  - `id` (uuid, primary key) - Settings record identifier
  - `default_word_goal` (integer) - Default word count goal
  - `default_time_goal_seconds` (integer) - Default time goal
  - `default_minimum_wpm` (integer) - Default WPM threshold
  - `no_backspace_mode` (boolean) - Default backspace mode setting
  - `custom_audio_url` (text) - URL/path to custom alert audio
  - `use_custom_audio` (boolean) - Whether to use custom audio
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. custom_audio_files
  Stores uploaded custom audio files:
  - `id` (uuid, primary key) - File identifier
  - `file_name` (text) - Original file name
  - `file_url` (text) - Storage URL or base64 data
  - `file_size` (integer) - File size in bytes
  - `mime_type` (text) - Audio MIME type
  - `created_at` (timestamptz) - Upload timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public access policies for writing_sessions (read/write)
  - Public access policies for user_settings (read/write)
  - Public access policies for custom_audio_files (read/write)

  ## Notes
  - All timestamps use UTC timezone
  - Numeric values use appropriate defaults for UX
  - RLS policies allow public access since there's no auth requirement initially
*/

-- Create writing_sessions table
CREATE TABLE IF NOT EXISTS writing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_count integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  average_wpm decimal(10, 2) NOT NULL DEFAULT 0,
  word_goal integer NOT NULL DEFAULT 0,
  time_goal_seconds integer NOT NULL DEFAULT 0,
  minimum_wpm integer NOT NULL DEFAULT 30,
  word_goal_achieved boolean DEFAULT false,
  time_goal_achieved boolean DEFAULT false,
  no_backspace_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_word_goal integer DEFAULT 500,
  default_time_goal_seconds integer DEFAULT 1800,
  default_minimum_wpm integer DEFAULT 30,
  no_backspace_mode boolean DEFAULT false,
  custom_audio_url text DEFAULT '',
  use_custom_audio boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Create custom_audio_files table
CREATE TABLE IF NOT EXISTS custom_audio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer DEFAULT 0,
  mime_type text DEFAULT 'audio/mpeg',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_audio_files ENABLE ROW LEVEL SECURITY;

-- Create policies for writing_sessions (public access for now)
CREATE POLICY "Anyone can view sessions"
  ON writing_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert sessions"
  ON writing_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON writing_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sessions"
  ON writing_sessions FOR DELETE
  USING (true);

-- Create policies for user_settings (public access for now)
CREATE POLICY "Anyone can view settings"
  ON user_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert settings"
  ON user_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update settings"
  ON user_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete settings"
  ON user_settings FOR DELETE
  USING (true);

-- Create policies for custom_audio_files (public access for now)
CREATE POLICY "Anyone can view audio files"
  ON custom_audio_files FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audio files"
  ON custom_audio_files FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update audio files"
  ON custom_audio_files FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete audio files"
  ON custom_audio_files FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_writing_sessions_created_at ON writing_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_writing_sessions_word_goal_achieved ON writing_sessions(word_goal_achieved);
CREATE INDEX IF NOT EXISTS idx_custom_audio_files_created_at ON custom_audio_files(created_at DESC);

-- Insert a default user_settings record
INSERT INTO user_settings (default_word_goal, default_time_goal_seconds, default_minimum_wpm, no_backspace_mode)
VALUES (500, 1800, 30, false)
ON CONFLICT DO NOTHING;
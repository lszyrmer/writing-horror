/*
  # Fix security issues

  1. Drop unused indexes
    - `idx_writing_sessions_word_goal_achieved` on `writing_sessions`
    - `idx_custom_audio_files_created_at` on `custom_audio_files`

  2. Remove unnecessary RLS policies
    - DROP all DELETE policies (app never deletes rows)
    - DROP UPDATE policies on `writing_sessions` and `custom_audio_files` (app never updates these)

  3. Tighten remaining RLS policies with validation
    - `writing_sessions` INSERT: validate word_count >= 0, duration >= 0, word_goal > 0
    - `writing_sessions` SELECT: restrict to anon role only
    - `user_settings` INSERT: restrict to anon, enforce max 1 row
    - `user_settings` UPDATE: restrict to anon, validate word_goal > 0
    - `user_settings` SELECT: restrict to anon role only
    - `custom_audio_files` INSERT: validate required fields present
    - `custom_audio_files` SELECT: restrict to anon role only

  4. Notes
    - Auth is not implemented, so policies use anon role restrictions
      and data validation checks instead of auth.uid() ownership
    - DELETE and UPDATE removed where the application does not use them
*/

-- 1. Drop unused indexes
DROP INDEX IF EXISTS idx_writing_sessions_word_goal_achieved;
DROP INDEX IF EXISTS idx_custom_audio_files_created_at;

-- 2. Drop all overly permissive DELETE policies
DROP POLICY IF EXISTS "Anyone can delete audio files" ON custom_audio_files;
DROP POLICY IF EXISTS "Anyone can delete settings" ON user_settings;
DROP POLICY IF EXISTS "Anyone can delete sessions" ON writing_sessions;

-- 3. Drop UPDATE policies on tables that don't need them
DROP POLICY IF EXISTS "Anyone can update audio files" ON custom_audio_files;
DROP POLICY IF EXISTS "Anyone can update sessions" ON writing_sessions;

-- 4. Replace INSERT policies with validation checks

DROP POLICY IF EXISTS "Anyone can insert sessions" ON writing_sessions;
CREATE POLICY "Anon can insert valid sessions"
  ON writing_sessions FOR INSERT
  TO anon
  WITH CHECK (
    word_count >= 0
    AND duration_seconds >= 0
    AND word_goal > 0
    AND minimum_wpm >= 0
  );

DROP POLICY IF EXISTS "Anyone can insert settings" ON user_settings;
CREATE POLICY "Anon can insert settings with limit"
  ON user_settings FOR INSERT
  TO anon
  WITH CHECK (
    default_word_goal > 0
    AND default_time_goal_seconds > 0
    AND default_minimum_wpm >= 0
    AND (SELECT count(*) FROM user_settings) < 1
  );

DROP POLICY IF EXISTS "Anyone can insert audio files" ON custom_audio_files;
CREATE POLICY "Anon can insert audio files with validation"
  ON custom_audio_files FOR INSERT
  TO anon
  WITH CHECK (
    file_name <> ''
    AND file_url <> ''
    AND file_size > 0
    AND mime_type <> ''
  );

-- 5. Replace UPDATE policy on user_settings with validation

DROP POLICY IF EXISTS "Anyone can update settings" ON user_settings;
CREATE POLICY "Anon can update settings with validation"
  ON user_settings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (
    default_word_goal > 0
    AND default_time_goal_seconds > 0
    AND default_minimum_wpm >= 0
  );

-- 6. Replace SELECT policies to restrict to anon role

DROP POLICY IF EXISTS "Anyone can view sessions" ON writing_sessions;
CREATE POLICY "Anon can view sessions"
  ON writing_sessions FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anyone can view settings" ON user_settings;
CREATE POLICY "Anon can view settings"
  ON user_settings FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anyone can view audio files" ON custom_audio_files;
CREATE POLICY "Anon can view audio files"
  ON custom_audio_files FOR SELECT
  TO anon
  USING (true);

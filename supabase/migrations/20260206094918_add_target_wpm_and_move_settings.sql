/*
  # Add target WPM setting and sound

  1. Modified Tables
    - `user_settings`
      - `target_wpm` (integer, default 60) - target words per minute goal
      - `use_custom_target_wpm_sound` (boolean, default false) - whether to use a custom sound when reaching target WPM
      - `custom_target_wpm_sound_url` (text, default '') - URL/data URI of the custom target WPM achievement sound

  2. Notes
    - Minimum WPM and no backspace mode are now managed exclusively in settings
    - Target WPM is a positive reinforcement trigger: plays a sound when the user reaches their target pace
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'target_wpm'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN target_wpm integer DEFAULT 60;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'use_custom_target_wpm_sound'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN use_custom_target_wpm_sound boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'custom_target_wpm_sound_url'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN custom_target_wpm_sound_url text DEFAULT '';
  END IF;
END $$;
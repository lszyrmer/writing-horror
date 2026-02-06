/*
  # Add custom typewriter sound settings

  1. Modified Tables
    - `user_settings`
      - `use_custom_typewriter` (boolean) - whether to use a custom uploaded typewriter sound
      - `custom_typewriter_url` (text) - base64 data URL of the uploaded typewriter sound file

  2. Notes
    - Defaults to false/empty so existing users keep the built-in synth sound
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'use_custom_typewriter'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN use_custom_typewriter boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'custom_typewriter_url'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN custom_typewriter_url text DEFAULT '' NOT NULL;
  END IF;
END $$;

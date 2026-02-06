/*
  # Add paragraph sound setting

  1. Modified Tables
    - `user_settings`
      - `use_custom_paragraph_sound` (boolean, default false) - whether to play a custom sound on new paragraph
      - `custom_paragraph_sound_url` (text, default '') - base64 data URL for the custom paragraph sound

  2. Notes
    - This sound plays when the user hits Enter twice (new paragraph) during a writing session
    - Optional feature, disabled by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'use_custom_paragraph_sound'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN use_custom_paragraph_sound boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'custom_paragraph_sound_url'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN custom_paragraph_sound_url text DEFAULT '';
  END IF;
END $$;
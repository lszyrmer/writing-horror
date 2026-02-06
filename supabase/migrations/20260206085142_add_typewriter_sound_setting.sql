/*
  # Add Typewriter Sound Setting

  ## Overview
  Adds a column to the user_settings table to enable/disable typewriter sounds.

  ## Changes
  - Adds `typewriter_sound_enabled` boolean column to user_settings table
  - Defaults to true (enabled by default)

  ## Notes
  - Typewriter sounds play on each keypress for tactile feedback
  - Users can disable this in settings if they find it distracting
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'typewriter_sound_enabled'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN typewriter_sound_enabled boolean DEFAULT true;
  END IF;
END $$;
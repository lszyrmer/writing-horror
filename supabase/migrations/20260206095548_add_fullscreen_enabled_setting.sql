/*
  # Add fullscreen enabled setting

  1. Modified Tables
    - `user_settings`
      - `fullscreen_enabled` (boolean, default true) - whether to enter fullscreen mode during writing sessions

  2. Notes
    - Fullscreen is enabled by default for an immersive writing experience
    - Users can disable it in settings if they prefer windowed mode
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'fullscreen_enabled'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN fullscreen_enabled boolean DEFAULT true;
  END IF;
END $$;
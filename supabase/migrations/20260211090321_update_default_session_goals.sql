/*
  # Update Default Session Goals

  1. Changes
    - Updates default word goal from 500 to 1000 words
    - Updates default time goal from 30 minutes (1800 seconds) to 20 minutes (1200 seconds)
  
  2. Important Notes
    - Only updates records that still have the old default values (500 words, 1800 seconds)
    - Does not modify user-customized settings
    - Ensures at least one default settings record exists with the new values
*/

-- Update existing records that still have the old defaults
UPDATE user_settings
SET 
  default_word_goal = 1000,
  default_time_goal_seconds = 1200,
  updated_at = now()
WHERE 
  default_word_goal = 500 
  AND default_time_goal_seconds = 1800;

-- Ensure there's at least one settings record with the new defaults
INSERT INTO user_settings (default_word_goal, default_time_goal_seconds, default_minimum_wpm, no_backspace_mode)
VALUES (1000, 1200, 30, false)
ON CONFLICT DO NOTHING;
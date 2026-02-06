/*
  # Fix RLS UPDATE policy on user_settings

  1. Security Changes
    - Drop and recreate `Anon can update settings with validation` policy on `user_settings`
    - Old policy had `USING (true)` which effectively bypassed row-level security for anon updates
    - New policy restricts UPDATE to only the single existing settings row by matching its ID
    - WITH CHECK validation constraints are preserved unchanged
*/

DROP POLICY IF EXISTS "Anon can update settings with validation" ON public.user_settings;

CREATE POLICY "Anon can update settings with validation"
  ON public.user_settings
  FOR UPDATE
  TO anon
  USING (id = (SELECT us.id FROM public.user_settings us LIMIT 1))
  WITH CHECK (
    (default_word_goal > 0)
    AND (default_time_goal_seconds > 0)
    AND (default_minimum_wpm >= 0)
  );
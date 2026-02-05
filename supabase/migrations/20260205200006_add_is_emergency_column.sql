/*
  # Add emergency flag to quotes

  1. Modified Tables
    - `quotes`
      - Added `is_emergency` (boolean, default false) - indicates if the job is an emergency/urgent call
        which applies a 1.5x labor multiplier

  2. Notes
    - Part of Montreal 2026 independent contractor rate update
    - Supports emergency multiplier, minimum visit rate, and minimum billable hours logic
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'is_emergency'
  ) THEN
    ALTER TABLE quotes ADD COLUMN is_emergency boolean NOT NULL DEFAULT false;
  END IF;
END $$;

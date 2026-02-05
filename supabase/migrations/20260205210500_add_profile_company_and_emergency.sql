/*
  # Add company name and default emergency pricing to profiles

  1. Modified Tables
    - `profiles`
      - Added `company_name` (text) - user's company/business name
      - Added `default_is_emergency` (boolean) - default emergency pricing toggle

  2. Notes
    - Company name allows contractors to display their business name
    - Default emergency toggle will pre-fill the emergency option when creating quotes
    - Both fields have sensible defaults
*/

-- Add company_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_name text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add default_is_emergency column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'default_is_emergency'
  ) THEN
    ALTER TABLE profiles ADD COLUMN default_is_emergency boolean NOT NULL DEFAULT false;
  END IF;
END $$;

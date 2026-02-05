/*
  # Add user profiles and quote ownership

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text) - user's display name
      - `default_trade` (text) - preferred trade type
      - `default_region` (text) - preferred region/city
      - `default_quality_level` (text) - preferred quality level
      - `default_customer_type` (text) - preferred customer type
      - `default_profit_margin_pct` (numeric) - preferred profit margin
      - `default_admin_overhead_pct` (numeric) - preferred admin overhead
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modified Tables
    - `quotes`
      - Added `user_id` (uuid, references auth.users) - links quote to user

  3. Security
    - Enable RLS on `profiles`
    - Profiles: users can only read/update their own profile
    - Quotes: updated policies so authenticated users can only access their own quotes
    - Quote line items: scoped to parent quote ownership
    - Share route still allows anon read for shared quotes

  4. Notes
    - Auto-creates profile on user signup via trigger
    - Old anon policies are replaced with authenticated user-scoped policies
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  default_trade text NOT NULL DEFAULT 'general',
  default_region text NOT NULL DEFAULT 'Montreal, QC',
  default_quality_level text NOT NULL DEFAULT 'standard',
  default_customer_type text NOT NULL DEFAULT 'residential',
  default_profit_margin_pct numeric NOT NULL DEFAULT 25,
  default_admin_overhead_pct numeric NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Add user_id to quotes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE quotes ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);

-- Drop old anon policies on quotes
DROP POLICY IF EXISTS "Allow anon to read quotes" ON quotes;
DROP POLICY IF EXISTS "Allow anon to create quotes" ON quotes;
DROP POLICY IF EXISTS "Allow anon to update quotes" ON quotes;
DROP POLICY IF EXISTS "Allow anon to delete draft quotes" ON quotes;

-- New authenticated policies for quotes
CREATE POLICY "Users can read own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can read shared quotes"
  ON quotes FOR SELECT
  TO anon
  USING (status IN ('sent', 'accepted'));

CREATE POLICY "Users can create own quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'draft');

-- Drop old anon policies on quote_line_items
DROP POLICY IF EXISTS "Allow anon to read line items" ON quote_line_items;
DROP POLICY IF EXISTS "Allow anon to create line items" ON quote_line_items;
DROP POLICY IF EXISTS "Allow anon to update line items" ON quote_line_items;
DROP POLICY IF EXISTS "Allow anon to delete line items" ON quote_line_items;

-- New authenticated policies for line items
CREATE POLICY "Users can read own line items"
  ON quote_line_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Anon can read shared quote line items"
  ON quote_line_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.status IN ('sent', 'accepted')
    )
  );

CREATE POLICY "Users can create line items for own quotes"
  ON quote_line_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update line items for own quotes"
  ON quote_line_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete line items for own quotes"
  ON quote_line_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

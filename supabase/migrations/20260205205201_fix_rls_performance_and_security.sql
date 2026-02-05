/*
  # Fix RLS performance and security issues

  1. RLS Policy Performance
    - Replace `auth.uid()` with `(select auth.uid())` in all policies
      on `profiles`, `quotes`, and `quote_line_items` tables
    - This prevents per-row re-evaluation of the auth function

  2. Unused Indexes
    - Drop `idx_quotes_status` (unused)
    - Drop `idx_quotes_user_id` (unused)

  3. Function Security
    - Set immutable search_path on `handle_new_user` function
*/

-- ============================================================
-- 1. Fix profiles RLS policies
-- ============================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- 2. Fix quotes RLS policies
-- ============================================================

DROP POLICY IF EXISTS "Users can read own quotes" ON quotes;
CREATE POLICY "Users can read own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own quotes" ON quotes;
CREATE POLICY "Users can create own quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
CREATE POLICY "Users can update own quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own draft quotes" ON quotes;
CREATE POLICY "Users can delete own draft quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id AND status = 'draft');

-- ============================================================
-- 3. Fix quote_line_items RLS policies
-- ============================================================

DROP POLICY IF EXISTS "Users can read own line items" ON quote_line_items;
CREATE POLICY "Users can read own line items"
  ON quote_line_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create line items for own quotes" ON quote_line_items;
CREATE POLICY "Users can create line items for own quotes"
  ON quote_line_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update line items for own quotes" ON quote_line_items;
CREATE POLICY "Users can update line items for own quotes"
  ON quote_line_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete line items for own quotes" ON quote_line_items;
CREATE POLICY "Users can delete line items for own quotes"
  ON quote_line_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_line_items.quote_id
      AND quotes.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- 4. Drop unused indexes
-- ============================================================

DROP INDEX IF EXISTS idx_quotes_status;
DROP INDEX IF EXISTS idx_quotes_user_id;

-- ============================================================
-- 5. Fix mutable search_path on handle_new_user function
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;
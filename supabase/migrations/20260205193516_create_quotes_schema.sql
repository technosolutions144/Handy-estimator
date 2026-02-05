/*
  # Create Quotes Schema for Contractor Quote Assistant

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `project_name` (text) - name/description of the project
      - `trade_type` (text) - masonry, plumbing, electrical, etc.
      - `client_name` (text) - customer name
      - `client_email` (text) - customer email (optional)
      - `client_phone` (text) - customer phone (optional)
      - `client_address` (text) - job site address
      - `customer_type` (text) - residential or commercial
      - `quality_level` (text) - economy, standard, or premium
      - `region` (text) - city/region for pricing context
      - `labor_hours` (numeric) - estimated labor hours
      - `labor_rate` (numeric) - hourly rate for labor
      - `materials_cost` (numeric) - total materials cost
      - `transportation_cost` (numeric) - transportation/travel cost
      - `tax_rate` (numeric) - tax percentage
      - `admin_overhead_pct` (numeric) - admin overhead percentage
      - `tool_wear_cost` (numeric) - tool wear and tear cost
      - `profit_margin_pct` (numeric) - desired profit margin percentage
      - `recommended_price` (numeric) - calculated recommended price
      - `minimum_price` (numeric) - calculated minimum acceptable price
      - `destructive_price` (numeric) - calculated destructive price (warning)
      - `final_price` (numeric) - contractor's chosen final price
      - `notes` (text) - additional notes
      - `status` (text) - draft, sent, accepted, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `quote_line_items`
      - `id` (uuid, primary key)
      - `quote_id` (uuid, FK to quotes)
      - `description` (text) - line item description
      - `quantity` (numeric) - quantity
      - `unit` (text) - unit of measure
      - `unit_price` (numeric) - price per unit
      - `category` (text) - labor, materials, other
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Policies for anon role to perform CRUD (no auth required per spec)
*/

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL DEFAULT '',
  trade_type text NOT NULL DEFAULT 'general',
  client_name text NOT NULL DEFAULT '',
  client_email text DEFAULT '',
  client_phone text DEFAULT '',
  client_address text DEFAULT '',
  customer_type text NOT NULL DEFAULT 'residential',
  quality_level text NOT NULL DEFAULT 'standard',
  region text DEFAULT '',
  labor_hours numeric NOT NULL DEFAULT 0,
  labor_rate numeric NOT NULL DEFAULT 0,
  materials_cost numeric NOT NULL DEFAULT 0,
  transportation_cost numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  admin_overhead_pct numeric NOT NULL DEFAULT 10,
  tool_wear_cost numeric NOT NULL DEFAULT 0,
  profit_margin_pct numeric NOT NULL DEFAULT 25,
  recommended_price numeric NOT NULL DEFAULT 0,
  minimum_price numeric NOT NULL DEFAULT 0,
  destructive_price numeric NOT NULL DEFAULT 0,
  final_price numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to read quotes"
  ON quotes FOR SELECT
  TO anon
  USING (status IS NOT NULL);

CREATE POLICY "Allow anon to create quotes"
  ON quotes FOR INSERT
  TO anon
  WITH CHECK (status IN ('draft', 'sent'));

CREATE POLICY "Allow anon to update quotes"
  ON quotes FOR UPDATE
  TO anon
  USING (status IS NOT NULL)
  WITH CHECK (status IN ('draft', 'sent', 'accepted', 'rejected'));

CREATE POLICY "Allow anon to delete draft quotes"
  ON quotes FOR DELETE
  TO anon
  USING (status = 'draft');

CREATE TABLE IF NOT EXISTS quote_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'unit',
  unit_price numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'materials',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to read line items"
  ON quote_line_items FOR SELECT
  TO anon
  USING (quote_id IS NOT NULL);

CREATE POLICY "Allow anon to create line items"
  ON quote_line_items FOR INSERT
  TO anon
  WITH CHECK (quote_id IS NOT NULL);

CREATE POLICY "Allow anon to update line items"
  ON quote_line_items FOR UPDATE
  TO anon
  USING (quote_id IS NOT NULL)
  WITH CHECK (quote_id IS NOT NULL);

CREATE POLICY "Allow anon to delete line items"
  ON quote_line_items FOR DELETE
  TO anon
  USING (quote_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_line_items_quote_id ON quote_line_items(quote_id);
-- ==============================================================================
-- CreatorHub Standalone Admin Setup & Security Policies
-- Run this in your Supabase SQL Editor to secure your backend!
-- ==============================================================================

-- 1. Create the Admins Table
-- This table exclusively holds references to users who are allowed to use the Admin Panel.
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users on delete cascade,
  email text NOT NULL,
  role text DEFAULT 'super_admin'
);

-- 2. Create foundational tables
CREATE TABLE IF NOT EXISTS sellers (
  id text PRIMARY KEY,
  name text,
  username text,
  avatar text,
  tagline text,
  category text,
  role text,
  bio text,
  whatsapp text,
  member_since text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  stats jsonb DEFAULT '{}'::jsonb,
  features text[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS seller_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  whatsapp text,
  category text,
  bio text,
  portfolio text,
  sample_work text,
  suggested_pricing text,
  applied_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  seller_id text REFERENCES sellers(id) ON DELETE CASCADE,
  title text,
  category text,
  price numeric,
  delivery_time text,
  thumbnail text,
  description text,
  featured boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  seller_id text REFERENCES sellers(id) ON DELETE CASCADE,
  title text,
  subtitle text,
  sub_category text,
  price numeric,
  original_price numeric,
  thumbnail text,
  images text[] DEFAULT '{}',
  description text,
  specs text[] DEFAULT '{}',
  delivery_time text,
  stock integer DEFAULT 0,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  featured boolean DEFAULT false,
  badge text
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  service_id text,
  service_name text,
  seller_id text,
  customer_name text,
  price numeric,
  status text DEFAULT 'pending',
  order_date timestamp with time zone DEFAULT now(),
  delivery_date timestamp with time zone,
  commission numeric DEFAULT 0,
  type text
);

-- 3. Turn on RLS for heavily sensitive tables
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public can view VERIFIED sellers ONLY
CREATE POLICY "Public profiles are viewable by everyone" ON sellers
  FOR SELECT USING (verified = true);

-- 4. Policy: Admins can do EVERYTHING
-- This uses an EXISTS clause to check if the person making the request is inside our `admins` table
CREATE POLICY "Admins have full access to Sellers" ON sellers
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins have full access to Applications" ON seller_applications
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- ==============================================================================
-- 🚀 ACTION REQUIRED FOR YOU:
-- After running this SQL, go to the Supabase Authentication table,
-- copy your user UID, and manually INSERT it into the new `admins` table.
-- e.g. INSERT INTO admins (id, email) VALUES ('your-uuid-here', 'your@email.com');
-- ==============================================================================

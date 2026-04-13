-- Supabase SQL Schema Initialization script
-- Copy and paste this into the Supabase SQL Editor

-- Table: sellers
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT,
    tagline TEXT,
    category TEXT,
    role TEXT DEFAULT 'Creator',
    bio TEXT,
    whatsapp TEXT,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    stats JSONB DEFAULT '{"ordersCompleted": 0, "avgDelivery": "0 days", "responseRate": "100%"}',
    features TEXT[] DEFAULT '{}',
    portfolio JSONB DEFAULT '[]',
    packages JSONB DEFAULT '[]'
);

-- Safely add missing columns if the sellers table already existed prior to this update
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.sellers ADD COLUMN portfolio JSONB DEFAULT '[]';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    BEGIN
        ALTER TABLE public.sellers ADD COLUMN packages JSONB DEFAULT '[]';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Table: services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    price INT NOT NULL,
    delivery_time TEXT,
    thumbnail TEXT,
    description TEXT,
    featured BOOLEAN DEFAULT FALSE
);

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    sub_category TEXT,
    price INT NOT NULL,
    original_price INT,
    thumbnail TEXT,
    images TEXT[] DEFAULT '{}',
    description TEXT,
    specs TEXT[] DEFAULT '{}',
    delivery_time TEXT,
    stock INT DEFAULT 0,
    rating FLOAT DEFAULT 0,
    reviews INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    badge TEXT
);

-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    customer_name TEXT,
    price INT,
    status TEXT DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_date TIMESTAMP WITH TIME ZONE,
    commission INT,
    type TEXT
);

-- Table: seller_applications
CREATE TABLE IF NOT EXISTS public.seller_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    category TEXT,
    bio TEXT,
    portfolio TEXT,
    sample_work TEXT,
    suggested_pricing TEXT,
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

-- Table: testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    avatar TEXT,
    text TEXT NOT NULL,
    rating INT DEFAULT 5,
    service TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: RLS (Row Level Security) policies should be added as per your application's security requirements.

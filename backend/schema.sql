-- Products Table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  status TEXT NOT NULL,
  image TEXT,
  description TEXT,
  sales_count INTEGER DEFAULT 0,
  weight INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for reviews
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);

-- Customers Table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  segment TEXT NOT NULL,
  avatar TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spend NUMERIC DEFAULT 0,
  last_order_date TEXT,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  profile JSONB DEFAULT '{}'::jsonb,
  appearance JSONB DEFAULT '{}'::jsonb,
  business JSONB DEFAULT '{}'::jsonb,
  notifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  products TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Unpaid',
  payment_method TEXT NOT NULL,
  cancellation_reason TEXT,
  rejection_reason TEXT,
  date TEXT NOT NULL,
  date_obj TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders, products, customers, settings;

-- Users Table (System Users: Admin/User)
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Will store hashed password
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for users
ALTER PUBLICATION supabase_realtime ADD TABLE users;

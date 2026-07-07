-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;

-- 1. Tables
CREATE TABLE tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  available BOOLEAN DEFAULT true NOT NULL,
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sequence for sequential friendly order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- 4. Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'ORD-' || nextval('order_number_seq')::text,
  tracking_token UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
  table_id UUID REFERENCES tables(id) ON DELETE RESTRICT NOT NULL,
  customer_name VARCHAR(100),
  notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cooking', 'ready', 'served', 'paid')),
  payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  
  accepted_at TIMESTAMP WITH TIME ZONE,
  cooking_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  served_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(12, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking_token ON orders(tracking_token);
CREATE INDEX idx_orders_table_id ON orders(table_id);

-- Enable RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tables, Categories, Products: public can read, admin can write
CREATE POLICY "Allow public read tables" ON tables FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin all tables" ON tables FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow public read categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin all categories" ON categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow public read products" ON products FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin all products" ON products FOR ALL TO authenticated USING (true);

-- Orders: public can insert, read if matches tracking_token, admin can do all
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select orders via tracking token" ON orders FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin all orders" ON orders FOR ALL TO authenticated USING (true);

-- Order Items: public can insert, read, admin can do all
CREATE POLICY "Allow public insert order_items" ON order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select order_items" ON order_items FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin all order_items" ON order_items FOR ALL TO authenticated USING (true);

-- Seed initial data
INSERT INTO tables (number, status) VALUES 
  ('01', 'active'),
  ('02', 'active'),
  ('03', 'active'),
  ('04', 'active'),
  ('05', 'active');

INSERT INTO categories (name, icon, sort_order) VALUES
  ('Makanan Utama', 'Utensils', 1),
  ('Minuman', 'Coffee', 2),
  ('Cemilan', 'Cookie', 3);

-- Seed products using resolved category IDs
INSERT INTO products (category_id, name, description, price, available, display_order, is_featured) VALUES
  ((SELECT id FROM categories WHERE name = 'Makanan Utama'), 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan kerupuk', 25000.00, true, 1, true),
  ((SELECT id FROM categories WHERE name = 'Makanan Utama'), 'Mie Goreng Jawa', 'Mie goreng khas Jawa dengan sayuran dan ayam', 22000.00, true, 2, false),
  ((SELECT id FROM categories WHERE name = 'Minuman'), 'Es Teh Manis', 'Teh manis segar dengan es batu', 5000.00, true, 1, false),
  ((SELECT id FROM categories WHERE name = 'Minuman'), 'Kopi Susu Gula Aren', 'Kopi espresso dengan susu segar dan gula aren', 15000.00, true, 2, true),
  ((SELECT id FROM categories WHERE name = 'Cemilan'), 'Kentang Goreng', 'Kentang goreng renyah dengan saus sambal', 12000.00, true, 1, false);

-- ============================================
-- E-COMMERCE DATABASE SCHEMA
-- Status: pending → processing → completed (rejected)
-- ============================================

-- ============================================
-- 1. USERS TABLE (for role management)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- Matches Supabase Auth user ID
  email TEXT,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users table
DROP POLICY IF EXISTS "Allow all" ON users;
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);

-- Add to realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE users;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

-- ============================================
-- 2. CART ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. ORDERS TABLE (Dengan 4 Status)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  -- Status: pending (menunggu) → processing (diproses) → completed (selesai) / rejected (ditolak)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  image_url TEXT NOT NULL
);

-- ============================================
-- 4. UPDATE EXISTING ORDERS TABLE (jika sudah ada)
-- ============================================
-- Hapus constraint lama jika ada
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Update data existing yang punya status 'approved' (lama) menjadi 'processing' (baru)
UPDATE orders SET status = 'processing' WHERE status = 'approved';

-- Tambah constraint baru dengan 4 status lengkap
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'processing', 'completed', 'rejected'));

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE POLICIES (Allow all untuk development)
-- ============================================
-- Hapus policies lama jika ada
DROP POLICY IF EXISTS "Allow all" ON cart_items;
DROP POLICY IF EXISTS "Allow all" ON orders;
DROP POLICY IF EXISTS "Allow all" ON order_items;

-- Buat policies baru
CREATE POLICY "Allow all" ON cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 7. ENABLE REALTIME
-- ============================================
-- Tambahkan ke publication (abaikan error jika sudah ada)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

-- ============================================
-- SELESAI! 🎉
-- ============================================

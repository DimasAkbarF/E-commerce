-- ============================================
-- FIX: Users Table Already Exists
-- ============================================

-- STEP 1: Cek data yang sudah ada
SELECT * FROM users;

-- STEP 2: Kalau mau hapus semua dan insert ulang
-- HAPUS SEMUA DATA (Hati-hati!)
-- DELETE FROM users;
-- atau
-- TRUNCATE TABLE users RESTART IDENTITY;

-- STEP 3: Insert ulang dengan benar
-- Gunakan ON CONFLICT untuk update kalau sudah ada

INSERT INTO users (id, email, name, role) 
VALUES 
  ('1', 'admin@foodstore.com', 'Admin User', 'admin'),
  ('2', 'user@example.com', 'dimmskuyy', 'user'),
  ('3', 'dimas@example.com', 'dimas', 'user')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- STEP 4: Verifikasi hasil
SELECT * FROM users ORDER BY id;

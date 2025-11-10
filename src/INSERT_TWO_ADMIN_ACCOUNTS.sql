-- ====================================
-- 🔒 إضافة حسابي Admin الثابتين
-- نفذ في Supabase SQL Editor
-- ====================================

-- حذف أي admin موجود (للتأكد من عدم وجود تكرار)
DELETE FROM admins;

-- إضافة Admin الأول
INSERT INTO admins (id, email, password, name, created_at) 
VALUES (
  'admin_fixed_001',
  'as8543245@gmail.com',
  'A1999anw#',
  'المدير العام',
  NOW()
);

-- إضافة Admin الثاني
INSERT INTO admins (id, email, password, name, created_at) 
VALUES (
  'admin_fixed_002',
  'anwaralrawahi459@gmail.com',
  '6101999',
  'أنور الرواحي',
  NOW()
);

-- التحقق
SELECT * FROM admins ORDER BY created_at;

-- ====================================
-- ✅ تم! الآن حسابي Admin جاهزين
-- ====================================

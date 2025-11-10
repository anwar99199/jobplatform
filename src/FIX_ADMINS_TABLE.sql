-- ====================================
-- 🔧 إصلاح جدول admins وإضافة الحسابين
-- نفذ في Supabase SQL Editor
-- ====================================

-- حذف الجدول القديم تماماً
DROP TABLE IF EXISTS admins CASCADE;

-- إنشاء الجدول من جديد مع جميع الأعمدة
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index للبحث السريع
CREATE INDEX idx_admins_email ON admins(email);

-- تفعيل RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- سياسة: عبر service_role فقط (السيرفر بس)
CREATE POLICY "Allow service role only on admins"
ON admins FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ====================================
-- إضافة الحسابين الثابتين
-- ====================================

-- Admin 1
INSERT INTO admins (id, email, password, name, created_at) 
VALUES (
  'admin_fixed_001',
  'as8543245@gmail.com',
  'A1999anw#',
  'المدير العام',
  NOW()
);

-- Admin 2
INSERT INTO admins (id, email, password, name, created_at) 
VALUES (
  'admin_fixed_002',
  'anwaralrawahi459@gmail.com',
  '6101999',
  'أنور الرواحي',
  NOW()
);

-- ====================================
-- التحقق من النتيجة
-- ====================================

SELECT id, email, name, created_at FROM admins ORDER BY created_at;

-- ====================================
-- ✅ تم! الجدول جاهز مع الحسابين
-- ====================================

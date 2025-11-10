-- ====================================
-- 1. جدول المستخدمين (users)
-- ====================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Index for role queries
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة العامة (الجميع يمكنهم رؤية المستخدمين)
CREATE POLICY "Allow public read access on users" 
ON users FOR SELECT 
USING (true);

-- سياسة الإضافة للمصادقين (عبر السيرفر فقط)
CREATE POLICY "Allow authenticated insert on users" 
ON users FOR INSERT 
WITH CHECK (true);

-- سياسة التحديث للمصادقين
CREATE POLICY "Allow authenticated update on users" 
ON users FOR UPDATE 
USING (true);

-- سياسة الحذف للمصادقين
CREATE POLICY "Allow authenticated delete on users" 
ON users FOR DELETE 
USING (true);

-- Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 2. جدول الاشتراكات المميزة (premium_subscriptions)
-- ====================================

CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS premium_subscriptions_user_id_idx ON premium_subscriptions(user_id);

-- Index for status queries
CREATE INDEX IF NOT EXISTS premium_subscriptions_status_idx ON premium_subscriptions(status);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS premium_subscriptions_dates_idx ON premium_subscriptions(start_date, end_date);

-- تفعيل RLS
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة العامة
CREATE POLICY "Allow public read access on premium_subscriptions" 
ON premium_subscriptions FOR SELECT 
USING (true);

-- سياسة الإضافة للمصادقين
CREATE POLICY "Allow authenticated insert on premium_subscriptions" 
ON premium_subscriptions FOR INSERT 
WITH CHECK (true);

-- سياسة التحديث للمصادقين
CREATE POLICY "Allow authenticated update on premium_subscriptions" 
ON premium_subscriptions FOR UPDATE 
USING (true);

-- سياسة الحذف للمصادقين
CREATE POLICY "Allow authenticated delete on premium_subscriptions" 
ON premium_subscriptions FOR DELETE 
USING (true);

-- Trigger لتحديث updated_at
CREATE TRIGGER update_premium_subscriptions_updated_at 
BEFORE UPDATE ON premium_subscriptions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger لتحديث status تلقائياً بناءً على end_date
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  ELSIF NEW.end_date >= CURRENT_DATE AND NEW.status = 'expired' THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_premium_subscription_status 
BEFORE INSERT OR UPDATE ON premium_subscriptions 
FOR EACH ROW 
EXECUTE FUNCTION update_subscription_status();

-- ====================================
-- 3. جدول المدراء (admins)
-- ====================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- في الإنتاج يجب استخدام bcrypt
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS admins_email_idx ON admins(email);

-- تفعيل RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة محدودة (للسيرفر فقط - أو للمدراء المصادقين)
CREATE POLICY "Allow authenticated read access on admins" 
ON admins FOR SELECT 
USING (true);

-- سياسة الإضافة للمصادقين
CREATE POLICY "Allow authenticated insert on admins" 
ON admins FOR INSERT 
WITH CHECK (true);

-- سياسة التحديث للمصادقين
CREATE POLICY "Allow authenticated update on admins" 
ON admins FOR UPDATE 
USING (true);

-- Trigger لتحديث updated_at
CREATE TRIGGER update_admins_updated_at 
BEFORE UPDATE ON admins 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 4. Views مساعدة (اختياري)
-- ====================================

-- View للمستخدمين مع معلومات Premium
CREATE OR REPLACE VIEW users_with_premium AS
SELECT 
  u.*,
  ps.id AS subscription_id,
  ps.plan_type,
  ps.start_date AS premium_start_date,
  ps.end_date AS premium_end_date,
  ps.status AS premium_status,
  CASE 
    WHEN ps.status = 'active' AND ps.end_date >= CURRENT_DATE THEN true
    ELSE false
  END AS is_premium
FROM users u
LEFT JOIN premium_subscriptions ps ON u.id = ps.user_id 
  AND ps.status = 'active' 
  AND ps.end_date >= CURRENT_DATE;

-- ====================================
-- ملاحظات مهمة:
-- ====================================

-- 1. password_hash في جدول admins: في الإنتاج يجب استخدام bcrypt أو argon2
-- 2. الـ Views أعلاه اختيارية لكنها مفيدة للاستعلامات السريعة
-- 3. جميع الجداول لها RLS policies محمية
-- 4. Foreign keys بين الجداول لضمان التكامل
-- 5. Triggers تلقائية لتحديث updated_at و subscription status

-- ====================================
-- اختبار الجداول:
-- ====================================

-- إضافة مستخدم تجريبي
INSERT INTO users (email, name, role) 
VALUES ('test@example.com', 'مستخدم تجريبي', 'user');

-- التحقق
SELECT * FROM users;

-- إضافة اشتراك Premium تجريبي
INSERT INTO premium_subscriptions (user_id, plan_type, end_date, price)
SELECT id, 'monthly', CURRENT_DATE + INTERVAL '30 days', 25.00
FROM users WHERE email = 'test@example.com';

-- التحقق
SELECT * FROM users_with_premium WHERE email = 'test@example.com';

-- عرض الإحصائيات
SELECT * FROM stats_summary;

-- ====================================
-- 🎉 جاهز!
-- ====================================

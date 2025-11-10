-- ====================================
-- 🚀 جداول المستخدمين (بدون Supabase Auth)
-- نفس نهج جدول jobs - بسيط ومباشر
-- انسخ في Production SQL Editor
-- ====================================

-- 👥 1) جدول المستخدمين العاديين (users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يقدر يقرأ (مثل jobs)
DROP POLICY IF EXISTS "Allow public read on users" ON users;
CREATE POLICY "Allow public read on users"
ON users FOR SELECT
USING (true);

-- سياسة الكتابة: عبر service_role فقط (من السيرفر)
DROP POLICY IF EXISTS "Allow service role write on users" ON users;
CREATE POLICY "Allow service role write on users"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ====================================

-- 💳 2) جدول الاشتراكات المميزة (premium_subscriptions)
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign key (optional - لو حاب تربطها)
-- ALTER TABLE premium_subscriptions ADD CONSTRAINT fk_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_premium_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_dates ON premium_subscriptions(start_date, end_date);

-- تفعيل RLS
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يقدر يقرأ
DROP POLICY IF EXISTS "Allow public read on premium_subscriptions" ON premium_subscriptions;
CREATE POLICY "Allow public read on premium_subscriptions"
ON premium_subscriptions FOR SELECT
USING (true);

-- سياسة الكتابة: عبر service_role فقط
DROP POLICY IF EXISTS "Allow service role write on premium_subscriptions" ON premium_subscriptions;
CREATE POLICY "Allow service role write on premium_subscriptions"
ON premium_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ====================================

-- 🛡️ 3) جدول المدراء (admins)
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- تفعيل RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- سياسة: عبر service_role فقط (السيرفر بس)
DROP POLICY IF EXISTS "Allow service role only on admins" ON admins;
CREATE POLICY "Allow service role only on admins"
ON admins FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ====================================

-- 🔁 4) Triggers لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users trigger
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Premium subscriptions trigger
DROP TRIGGER IF EXISTS trg_premium_updated_at ON premium_subscriptions;
CREATE TRIGGER trg_premium_updated_at
BEFORE UPDATE ON premium_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Admins trigger
DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ====================================

-- 📅 5) Trigger ذكي لتحديث حالة Premium تلقائياً
CREATE OR REPLACE FUNCTION check_premium_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date < CURRENT_DATE THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_premium_expiry ON premium_subscriptions;
CREATE TRIGGER trg_premium_expiry
BEFORE INSERT OR UPDATE ON premium_subscriptions
FOR EACH ROW
EXECUTE FUNCTION check_premium_expiry();

-- ====================================

-- 👀 6) Views مساعدة (اختياري)

-- View: المستخدمين مع بيانات Premium
CREATE OR REPLACE VIEW users_with_premium AS
SELECT 
  u.*,
  ps.plan_type,
  ps.start_date AS premium_start_date,
  ps.end_date AS premium_end_date,
  ps.status AS premium_status,
  ps.price AS premium_price,
  CASE 
    WHEN ps.status = 'active' AND ps.end_date >= CURRENT_DATE THEN true
    ELSE false
  END AS is_premium
FROM users u
LEFT JOIN premium_subscriptions ps ON u.id = ps.user_id
WHERE ps.status = 'active' OR ps.id IS NULL;

-- View: إحصائيات سريعة
CREATE OR REPLACE VIEW stats_dashboard AS
SELECT
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM admins) AS total_admins,
  (SELECT COUNT(*) FROM premium_subscriptions WHERE status = 'active' AND end_date >= CURRENT_DATE) AS active_premium,
  (SELECT COUNT(*) FROM jobs) AS total_jobs,
  (SELECT COUNT(*) FROM jobs WHERE date = CURRENT_DATE) AS today_jobs;

-- ====================================
-- 🎉 تم! نفذ هذا الـ SQL في Supabase
-- ====================================

-- اختبار سريع (اختياري):
-- INSERT INTO users (id, email, name, role) VALUES ('test1', 'test@example.com', 'مستخدم تجريبي', 'user');
-- INSERT INTO premium_subscriptions (id, user_id, plan_type, start_date, end_date, price) 
-- VALUES ('sub1', 'test1', 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 25.00);
-- SELECT * FROM users_with_premium;
-- SELECT * FROM stats_dashboard;

-- ====================================
-- 📝 تحديث جدول user_profiles لدعم ميزة نسبة التوافق
-- ====================================

-- إضافة حقول جديدة إذا لم تكن موجودة
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- الحقول الموجودة بالفعل (للتأكد):
-- user_id TEXT NOT NULL
-- created_at TIMESTAMPTZ DEFAULT NOW()
-- updated_at TIMESTAMPTZ DEFAULT NOW()

-- يمكنك أيضاً إضافة indexes للبحث السريع (اختياري)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_specialty ON user_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);

-- ====================================
-- ✅ ملاحظات:
-- 1. skills: مهارات المستخدم (يمكن أن تكون نص أو JSON array)
-- 2. experience: سنوات الخبرة والمناصب السابقة
-- 3. specialty: التخصص أو المجال (مثل: تطوير البرمجيات، تسويق، محاسبة)
-- 4. location: الموقع الجغرافي (مثل: مسقط، صلالة، صحار)
-- 5. education: المؤهل الدراسي (مثل: بكالوريوس، ماجستير)
-- 6. bio: نبذة تعريفية قصيرة
-- 7. phone: رقم الهاتف
-- ====================================

-- 🎉 تم! نفذ هذا الـ SQL في Supabase Production SQL Editor

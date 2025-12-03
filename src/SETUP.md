# 🛠️ دليل الإعداد الكامل - منصة عُمان للوظائف

**آخر تحديث:** 3 ديسمبر 2025  
**المدة المتوقعة:** 30-45 دقيقة

---

## 📋 المتطلبات الأساسية

```
✅ Node.js 18+ مثبّت
✅ npm أو yarn مثبّت
✅ Git مثبّت (اختياري)
✅ حساب Supabase (مجاني)
✅ حساب OpenAI API (مدفوع)
✅ محرر نصوص (VS Code موصى به)
```

---

## 🚀 الخطوة 1: استنساخ المشروع

### الطريقة 1: من GitHub
```bash
git clone https://github.com/your-username/oman-jobs-platform.git
cd oman-jobs-platform
```

### الطريقة 2: من ZIP
```bash
# فك ضغط الملف
unzip oman-jobs-platform.zip
cd oman-jobs-platform
```

---

## 📦 الخطوة 2: تثبيت الحزم

```bash
npm install
```

**إذا واجهت مشاكل:**
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install

# أو استخدم yarn
yarn install
```

---

## 🔐 الخطوة 3: إعداد Environment Variables

### 1. انسخ ملف المثال:
```bash
cp .env.example .env.local
```

### 2. افتح `.env.local` وأكمل القيم:

**ستحتاج إلى:**
- حساب Supabase (خطوة 4)
- مفتاح OpenAI API (خطوة 5)
- بيانات Admin (ستنشئها لاحقاً)

---

## 🗄️ الخطوة 4: إعداد Supabase

### 4.1 إنشاء مشروع Supabase

1. اذهب إلى https://supabase.com
2. سجّل دخول أو أنشئ حساب
3. اضغط "New Project"
4. املأ البيانات:
   - **Name:** Oman Jobs Platform
   - **Database Password:** (احفظه جيداً!)
   - **Region:** اختر الأقرب لك
5. انتظر 2-3 دقائق حتى يتم إنشاء المشروع

---

### 4.2 الحصول على Credentials

1. اذهب إلى **Settings** → **API**
2. انسخ:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

3. اذهب إلى **Settings** → **Database**
4. انسخ **Connection String** → `SUPABASE_DB_URL`

5. ضع هذه القيم في `.env.local`

---

### 4.3 إنشاء الجداول

#### افتح **SQL Editor** في Supabase واتبع الترتيب:

#### **أ. جدول المستخدمين:**

```sql
-- إنشاء جدول users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء جدول user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  city TEXT,
  education TEXT,
  experience TEXT,
  skills TEXT[],
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء جدول premium_subscriptions
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies للقراءة العامة
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read subscriptions" ON premium_subscriptions FOR SELECT USING (true);
```

---

#### **ب. جدول الوظائف:**

```sql
-- إنشاء جدول jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  sector TEXT NOT NULL,
  salary TEXT,
  description TEXT,
  requirements TEXT[],
  posted_date TIMESTAMP DEFAULT NOW(),
  deadline TIMESTAMP,
  status TEXT DEFAULT 'active'
);

-- تفعيل RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة العامة
CREATE POLICY "Allow public read jobs" ON jobs FOR SELECT USING (true);
```

---

#### **ج. جدول البطاقات الرقمية:**

```sql
-- إنشاء جدول digital_cards
CREATE TABLE IF NOT EXISTS digital_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  github TEXT,
  portfolio TEXT,
  image_url TEXT,
  cv_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE digital_cards ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة العامة
CREATE POLICY "Allow public read cards" ON digital_cards FOR SELECT USING (true);
```

---

#### **د. جدول الأخبار:**

```sql
-- إنشاء جدول news
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author TEXT,
  category TEXT,
  published_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'published'
);

-- تفعيل RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة العامة
CREATE POLICY "Allow public read news" ON news FOR SELECT USING (true);
```

---

#### **هـ. جدول رسائل التواصل:**

```sql
-- إنشاء جدول contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة العامة
CREATE POLICY "Allow public read contact" ON contact_messages FOR SELECT USING (true);
```

---

#### **و. جدول المسؤولين (Admin):**

```sql
-- إنشاء جدول admins
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- إضافة حسابك الخاص
INSERT INTO admins (id, email, password, name, created_at)
VALUES 
  ('admin_001', 'your_email@gmail.com', 'your_password', 'Your Name', NOW());

-- تفعيل RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة العامة
CREATE POLICY "Allow public read admins" ON admins FOR SELECT USING (true);
```

**⚠️ ملاحظة:** استبدل `your_email@gmail.com` و `your_password` ببياناتك الخاصة.

---

### 4.4 إنشاء Storage Buckets

في **Storage** → اضغط **New bucket** لكل واحد:

```sql
-- أو نفّذ في SQL Editor:

-- 1. Bucket لملفات السير الذاتية (ATS)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('make-8a20c00b-cv-files', 'make-8a20c00b-cv-files', false);

-- 2. Bucket لصور البطاقات الرقمية
INSERT INTO storage.buckets (id, name, public) 
VALUES ('make-8a20c00b-profile-images', 'make-8a20c00b-profile-images', false);

-- 3. Bucket لسير ذاتية البطاقات
INSERT INTO storage.buckets (id, name, public) 
VALUES ('make-8a20c00b-digital-cvs', 'make-8a20c00b-digital-cvs', false);

-- 4. Bucket لصور الأخبار (عام)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('make-8a20c00b-news-images', 'make-8a20c00b-news-images', true);
```

---

### 4.5 Storage Policies

```sql
-- Policy لرفع الملفات (authenticated users فقط)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN (
  'make-8a20c00b-cv-files',
  'make-8a20c00b-profile-images',
  'make-8a20c00b-digital-cvs',
  'make-8a20c00b-news-images'
));

-- Policy للقراءة (الكل)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id IN (
  'make-8a20c00b-cv-files',
  'make-8a20c00b-profile-images',
  'make-8a20c00b-digital-cvs',
  'make-8a20c00b-news-images'
));
```

---

## 🤖 الخطوة 5: إعداد OpenAI API

1. اذهب إلى https://platform.openai.com/api-keys
2. سجّل دخول أو أنشئ حساب
3. اضغط **Create new secret key**
4. انسخ المفتاح (ستراه مرة واحدة فقط!)
5. ضعه في `.env.local`:
   ```
   OPENAI_API_KEY=sk-your_key_here
   ```

**⚠️ ملاحظة:** خدمة OpenAI مدفوعة. ستحتاج إلى إضافة رصيد.

---

## ⚙️ الخطوة 6: إعداد Supabase Edge Functions

### 6.1 تثبيت Supabase CLI

```bash
npm install -g supabase
```

**للتحقق:**
```bash
supabase --version
```

---

### 6.2 ربط المشروع

```bash
# سجّل دخول
supabase login

# اربط المشروع
supabase link --project-ref your-project-ref
```

**للحصول على `project-ref`:**
- من URL مشروعك: `https://[project-ref].supabase.co`

---

### 6.3 تحديث كود السيرفر

**افتح `/supabase/functions/server/index.tsx`**

**ابحث عن السطر ~299-302:**

```typescript
// ❌ احذف أو غيّر هذا:
const ALLOWED_ADMINS = [
  { email: "as8543245@gmail.com", password: "A1999anw#" },
  { email: "anwaralrawahi459@gmail.com", password: "6101999" }
];

// ✅ استبدله بهذا:
const ALLOWED_ADMINS = [
  { 
    email: Deno.env.get('ADMIN_EMAIL_1') || '', 
    password: Deno.env.get('ADMIN_PASSWORD_1') || '' 
  },
  { 
    email: Deno.env.get('ADMIN_EMAIL_2') || '', 
    password: Deno.env.get('ADMIN_PASSWORD_2') || '' 
  }
];
```

**⚠️ مهم جداً!** احذف البيانات القديمة.

---

### 6.4 إضافة Secrets

```bash
# OpenAI API Key
supabase secrets set OPENAI_API_KEY=your_openai_key_here

# Admin Credentials
supabase secrets set ADMIN_EMAIL_1=your_email_1@gmail.com
supabase secrets set ADMIN_PASSWORD_1=your_password_1

supabase secrets set ADMIN_EMAIL_2=your_email_2@gmail.com
supabase secrets set ADMIN_PASSWORD_2=your_password_2
```

**للتحقق من Secrets:**
```bash
supabase secrets list
```

---

### 6.5 رفع Edge Functions

```bash
supabase functions deploy make-server-8a20c00b
```

**إذا نجحت:**
```
✅ Deployed make-server-8a20c00b
🌐 URL: https://your-project.supabase.co/functions/v1/make-server-8a20c00b
```

---

## 🎨 الخطوة 7: تحديث ملف Info

**افتح `/utils/supabase/info.tsx`**

```typescript
// غيّر هذه القيم:
export const projectId = "your-project-id";
export const publicAnonKey = "your-anon-key";
```

**احصل عليها من:**
- `projectId` = من URL مشروعك
- `publicAnonKey` = نفس `SUPABASE_ANON_KEY`

---

## ✅ الخطوة 8: تشغيل المشروع

```bash
npm run dev
```

**إذا نجح:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 الخطوة 9: اختبار المشروع

### 1. افتح المتصفح:
```
http://localhost:5173
```

### 2. اختبر الصفحة الرئيسية:
```
✅ يجب أن تظهر الصفحة الرئيسية
✅ يجب أن يعمل Header و Footer
```

### 3. اختبر تسجيل حساب:
```
اذهب إلى /register
أنشئ حساب جديد
سجّل دخول
```

### 4. اختبر Admin:
```
اذهب إلى /admin/login
استخدم بياناتك التي أنشأتها
ادخل إلى /admin/dashboard
```

### 5. اختبر الخدمات Premium:
```
سجّل دخول كمستخدم عادي
اذهب إلى /premium
جرّب أي خدمة (ستحتاج اشتراك Premium)
امنح نفسك Premium من Admin Panel
جرّب الخدمات مرة أخرى
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: خطأ في Supabase Connection
```
❌ Error: Failed to connect to Supabase

✅ الحل:
1. تأكد من SUPABASE_URL صحيح في .env.local
2. تأكد من SUPABASE_ANON_KEY صحيح
3. تأكد من المشروع نشط في Supabase Dashboard
```

---

### المشكلة 2: خطأ في OpenAI API
```
❌ Error: OpenAI API key not found

✅ الحل:
1. تأكد من OPENAI_API_KEY في .env.local
2. تأكد من إضافته كـ Secret في Supabase:
   supabase secrets set OPENAI_API_KEY=your_key
3. تأكد من وجود رصيد في حساب OpenAI
```

---

### المشكلة 3: خطأ Admin Login
```
❌ Error: Admin credentials not found

✅ الحل:
1. تأكد من إضافة ADMIN_EMAIL و ADMIN_PASSWORD كـ Secrets
2. أو حدّث الكود في index.tsx بقيم ثابتة مؤقتاً
3. تأكد من وجود السجل في جدول admins
```

---

### المشكلة 4: خطأ في تحميل الملفات
```
❌ Error: Bucket not found

✅ الحل:
1. تأكد من إنشاء جميع الـ 4 Buckets
2. تأكد من Policies صحيحة
3. راجع Supabase Dashboard → Storage
```

---

### المشكلة 5: خطأ CORS
```
❌ Error: CORS policy blocked

✅ الحل:
1. تأكد من تحديث CORS headers في index.tsx
2. أعد رفع Edge Functions:
   supabase functions deploy make-server-8a20c00b
```

---

## 📚 الموارد المفيدة

```
📖 Supabase Docs: https://supabase.com/docs
📖 OpenAI API Docs: https://platform.openai.com/docs
📖 React Router: https://reactrouter.com
📖 Tailwind CSS: https://tailwindcss.com
```

---

## 📞 الدعم

```
📧 للمشاكل: راجع ملفات التوثيق
📚 /START_HERE.md - دليل البداية
📚 /READY_TO_USE.md - دليل الاستخدام
📚 /PROJECT_CLEAN_STATUS.md - حالة المشروع
```

---

## ✅ قائمة التحقق النهائية

```
☐ تثبيت Node.js و npm
☐ استنساخ المشروع
☐ تثبيت الحزم (npm install)
☐ إنشاء .env.local
☐ إنشاء مشروع Supabase
☐ نسخ Credentials إلى .env.local
☐ إنشاء جميع الجداول
☐ إنشاء Storage Buckets
☐ الحصول على OpenAI API Key
☐ تثبيت Supabase CLI
☐ ربط المشروع
☐ تحديث كود Admin في index.tsx
☐ إضافة Secrets
☐ رفع Edge Functions
☐ تحديث /utils/supabase/info.tsx
☐ تشغيل المشروع (npm run dev)
☐ اختبار جميع الميزات
```

---

## 🎉 مبروك!

**إذا وصلت هنا، فالمشروع جاهز للعمل!** 🚀

استمتع بتطوير منصة عُمان للوظائف! ✨

---

_آخر تحديث: 3 ديسمبر 2025_

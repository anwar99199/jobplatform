# 🤝 دليل مشاركة المشروع مع مطورين آخرين

**التاريخ:** 3 ديسمبر 2025  
**الحالة:** ⚠️ انتبه للنقاط الحساسة قبل المشاركة

---

## ⚠️ تحذيرات مهمة جداً

### 🚨 ملفات تحتوي على بيانات حساسة:

```
❌ /supabase/functions/server/index.tsx
   السطر ~299-302: بيانات Admin (email + password)
   السطر ~2467: قائمة emails المسموح لهم

❌ Environment Variables في Vercel/Supabase:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_DB_URL
   - OPENAI_API_KEY
```

---

## ✅ قبل المشاركة - قائمة التحقق

### 1️⃣ تنظيف بيانات Admin من الكود:

#### **الخيار الأول (موصى به):** استخدام Environment Variables

**في `/supabase/functions/server/index.tsx`:**

```typescript
// ❌ الطريقة الحالية (غير آمنة):
const ALLOWED_ADMINS = [
  { email: "as8543245@gmail.com", password: "A1999anw#" },
  { email: "anwaralrawahi459@gmail.com", password: "6101999" }
];

// ✅ الطريقة الآمنة:
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

**ثم أضف في Supabase Edge Functions Secrets:**
```bash
ADMIN_EMAIL_1=your_email_1@gmail.com
ADMIN_PASSWORD_1=your_password_1
ADMIN_EMAIL_2=your_email_2@gmail.com
ADMIN_PASSWORD_2=your_password_2
```

---

#### **الخيار الثاني:** احذف البيانات واجعلها تعليقات

```typescript
// TODO: أضف بيانات Admin الخاصة بك هنا
const ALLOWED_ADMINS = [
  { email: "YOUR_ADMIN_EMAIL_1", password: "YOUR_PASSWORD_1" },
  { email: "YOUR_ADMIN_EMAIL_2", password: "YOUR_PASSWORD_2" }
];
```

---

### 2️⃣ إنشاء ملف `.gitignore`:

```gitignore
# Environment Variables
.env
.env.local
.env.production

# Secrets
*.secret
secrets.txt

# Database files
*.db
*.sqlite

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Build
dist/
build/
.next/

# Dependencies
node_modules/

# Temporary files
tmp/
temp/
*.tmp

# Personal notes
NOTES.md
TODO.md
PRIVATE.md
```

---

### 3️⃣ إنشاء ملف `.env.example`:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_DB_URL=your_db_url_here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Admin Credentials (للـ Edge Functions)
ADMIN_EMAIL_1=your_admin_email_1
ADMIN_PASSWORD_1=your_admin_password_1
ADMIN_EMAIL_2=your_admin_email_2
ADMIN_PASSWORD_2=your_admin_password_2
```

---

### 4️⃣ إنشاء ملف `README.md` للمطور الجديد:

```markdown
# منصة عُمان للوظائف

## 🚀 التثبيت

### 1. استنساخ المشروع:
\`\`\`bash
git clone [your-repo-url]
cd oman-jobs-platform
\`\`\`

### 2. تثبيت الحزم:
\`\`\`bash
npm install
\`\`\`

### 3. إعداد Environment Variables:
انسخ ملف `.env.example` إلى `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

ثم املأ القيم الفعلية في `.env.local`

### 4. إعداد Supabase:

#### أ. إنشاء مشروع Supabase جديد
- اذهب إلى https://supabase.com
- أنشئ مشروع جديد

#### ب. تشغيل SQL Scripts:
قم بتنفيذ الملفات التالية بالترتيب في Supabase SQL Editor:

\`\`\`sql
-- 1. إنشاء جدول المستخدمين
-- انظر: /supabase/migrations/USERS_TABLES_SIMPLE.sql

-- 2. إنشاء جدول رسائل التواصل
-- انظر: /supabase/migrations/create_contact_messages.sql

-- 3. إضافة حقل requirements للوظائف
-- انظر: /supabase/migrations/add_requirements_to_jobs.sql
\`\`\`

#### ج. إنشاء Storage Buckets:
\`\`\`sql
-- في Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('make-8a20c00b-cv-files', 'make-8a20c00b-cv-files', false),
  ('make-8a20c00b-profile-images', 'make-8a20c00b-profile-images', false),
  ('make-8a20c00b-digital-cvs', 'make-8a20c00b-digital-cvs', false),
  ('make-8a20c00b-news-images', 'make-8a20c00b-news-images', true);
\`\`\`

#### د. إنشاء حسابات Admin:
\`\`\`sql
-- في Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO admins (id, email, password, name, created_at)
VALUES 
  ('admin_001', 'your_email@gmail.com', 'your_password', 'Admin Name', NOW());
\`\`\`

### 5. إعداد Supabase Edge Functions:

#### أ. تثبيت Supabase CLI:
\`\`\`bash
npm install -g supabase
\`\`\`

#### ب. ربط المشروع:
\`\`\`bash
supabase link --project-ref your-project-ref
\`\`\`

#### ج. رفع Edge Functions:
\`\`\`bash
supabase functions deploy make-server-8a20c00b
\`\`\`

#### د. إضافة Secrets:
\`\`\`bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set ADMIN_EMAIL_1=your_email
supabase secrets set ADMIN_PASSWORD_1=your_password
\`\`\`

### 6. تشغيل المشروع:
\`\`\`bash
npm run dev
\`\`\`

## 📚 التوثيق

- `/START_HERE.md` - دليل البداية الشامل
- `/READY_TO_USE.md` - دليل الاستخدام السريع
- `/PROJECT_CLEAN_STATUS.md` - حالة المشروع التفصيلية

## ⚠️ ملاحظات مهمة

1. **لا تشارك** ملفات `.env` أو Secrets
2. **غيّر** بيانات Admin في الكود أو استخدم Environment Variables
3. **راجع** جميع ملفات SQL قبل تنفيذها
4. **احذف** أي بيانات شخصية من الكود
\`\`\`

---

## 📋 خطوات المشاركة

### الخطوة 1: تنظيف الكود

```bash
# 1. احذف بيانات Admin من index.tsx
# 2. احذف أي ملفات شخصية (.env, notes, etc)
# 3. راجع جميع ملفات .tsx للبيانات الحساسة
# 4. أضف .gitignore
```

---

### الخطوة 2: إنشاء ملفات الإعداد

```bash
✅ .gitignore
✅ .env.example
✅ README.md (دليل التثبيت)
✅ SETUP.md (دليل الإعداد المفصل)
```

---

### الخطوة 3: اختبار النسخة النظيفة

```bash
# 1. انسخ المشروع في مجلد جديد
# 2. تأكد من عدم وجود بيانات حساسة
# 3. تأكد من أن المشروع يعمل مع .env.example
```

---

### الخطوة 4: رفع على GitHub (اختياري)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

**⚠️ قبل الـ push:**
- راجع كل ملف
- تأكد من .gitignore يعمل
- تأكد من عدم وجود .env

---

## 🔒 أفضل الممارسات الأمنية

### 1️⃣ لا تكتب Passwords في الكود:
```typescript
// ❌ سيء
const password = "123456";

// ✅ جيد
const password = Deno.env.get('PASSWORD');
```

### 2️⃣ لا تشارك API Keys:
```typescript
// ❌ سيء
const apiKey = "sk-1234567890";

// ✅ جيد
const apiKey = Deno.env.get('OPENAI_API_KEY');
```

### 3️⃣ استخدم .gitignore:
```bash
# تأكد من إضافة:
.env
.env.local
.env.production
*.secret
secrets/
```

### 4️⃣ راجع Git History:
```bash
# قبل المشاركة، تأكد من عدم وجود commits قديمة تحتوي على بيانات حساسة
git log --all --full-history --source -- *password*
```

### 5️⃣ استخدم Secrets في CI/CD:
- GitHub Secrets
- Vercel Environment Variables
- Supabase Secrets

---

## 📝 معلومات يجب توفيرها للمطور الجديد

### ✅ شارك:
- الكود النظيف (بدون بيانات حساسة)
- ملفات التوثيق
- دليل التثبيت
- مخططات قاعدة البيانات
- أمثلة على .env

### ❌ لا تشارك:
- بيانات Admin الفعلية
- API Keys الفعلية
- Supabase Credentials الفعلية
- أي بيانات إنتاج (production data)
- ملفات .env

---

## 🎯 قائمة التحقق النهائية

```
☐ حذف/تعديل بيانات Admin من index.tsx
☐ إنشاء .gitignore
☐ إنشاء .env.example
☐ إنشاء README.md
☐ مراجعة جميع ملفات .tsx للبيانات الحساسة
☐ مراجعة جميع ملفات .sql
☐ حذف ملفات .env إذا وُجدت
☐ حذف ملفات شخصية (notes, todos)
☐ اختبار النسخة النظيفة
☐ مراجعة Git History
```

---

## 💡 نصائح إضافية

### للمطور الجديد:
```
1. اقرأ START_HERE.md أولاً
2. اتبع دليل التثبيت خطوة بخطوة
3. لا تشارك Secrets مع أي شخص
4. استخدم Environment Variables دائماً
5. احتفظ بنسخة احتياطية من قاعدة البيانات
```

### لك (المطور الأصلي):
```
1. احتفظ بنسخة خاصة بها جميع البيانات
2. لا تعطي وصول كامل لقاعدة البيانات الإنتاج
3. أنشئ environment منفصل للتطوير
4. راقب الأنشطة على Supabase Dashboard
5. غيّر Passwords بعد المشاركة
```

---

## 🚀 بدائل للمشاركة

### الخيار 1: GitHub Private Repository
```
✅ الأفضل للتعاون طويل الأمد
✅ يحفظ Git history
✅ يدعم Pull Requests
⚠️ تأكد من أنه private
```

### الخيار 2: ZIP File
```
✅ بسيط وسريع
✅ لا يحتاج Git
❌ لا يحفظ history
❌ صعب لتتبع التغييرات
```

### الخيار 3: Code Sharing Platforms
```
CodeSandbox
StackBlitz
Replit
⚠️ احذر من البيانات الحساسة
```

---

## 📞 عند مشاركة المشروع

### أخبر المطور الجديد:

```
📧 "مرحباً،

لقد شاركت معك مشروع منصة عُمان للوظائف.

⚠️ ملاحظات مهمة:
1. ستحتاج إلى إنشاء حساب Supabase خاص بك
2. ستحتاج إلى مفتاح OpenAI API
3. ستحتاج إلى تعديل بيانات Admin في الكود
4. اقرأ START_HERE.md أولاً

📚 الملفات المهمة:
- START_HERE.md → ابدأ من هنا
- README.md → دليل التثبيت
- .env.example → مثال على Environment Variables

🔐 الأمان:
- لا تشارك أي بيانات من الـ .env
- لا ترفع الكود على GitHub public
- غيّر جميع الـ secrets

تواصل معي إذا احتجت مساعدة!
```

---

## ✅ الخلاصة

```
╔═══════════════════════════════════════════════╗
║                                               ║
║  ⚠️ قبل المشاركة:                           ║
║                                               ║
║  1️⃣ احذف بيانات Admin من الكود             ║
║  2️⃣ أضف .gitignore و .env.example          ║
║  3️⃣ أنشئ README.md شامل                    ║
║  4️⃣ راجع كل ملف للبيانات الحساسة            ║
║  5️⃣ اختبر النسخة النظيفة                   ║
║                                               ║
║  ✅ بعد المشاركة:                           ║
║                                               ║
║  1️⃣ غيّر Passwords الحساسة                 ║
║  2️⃣ راقب نشاط قاعدة البيانات               ║
║  3️⃣ وفّر الدعم للمطور الجديد               ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

**🤝 مشاركة آمنة = مشروع آمن!**

_آخر تحديث: 3 ديسمبر 2025_

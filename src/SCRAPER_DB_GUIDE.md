# 🗄️ دليل إعداد قاعدة البيانات لنظام جلب الوظائف

## 📋 المحتويات
- [خطوات التنفيذ السريعة](#خطوات-التنفيذ-السريعة)
- [ما الذي سيتم إضافته؟](#ما-الذي-سيتم-إضافته)
- [التحقق من نجاح التنفيذ](#التحقق-من-نجاح-التنفيذ)
- [الاستخدام بعد التنفيذ](#الاستخدام-بعد-التنفيذ)
- [استعلامات مفيدة](#استعلامات-مفيدة)
- [حل المشاكل](#حل-المشاكل)

---

## 🚀 خطوات التنفيذ السريعة

### 1️⃣ افتح Supabase Dashboard
- اذهب إلى: https://supabase.com/dashboard
- اختر مشروعك: **منصة عُمان للوظائف**

### 2️⃣ افتح SQL Editor
- من القائمة الجانبية، اضغط على **SQL Editor**
- اضغط **New query** (استعلام جديد)

### 3️⃣ نفّذ الملف
1. افتح الملف: **`SCRAPER_DATABASE_SETUP.sql`**
2. انسخ المحتوى بالكامل (Ctrl+A ثم Ctrl+C)
3. الصق في SQL Editor (Ctrl+V)
4. اضغط **RUN** أو اضغط `Ctrl + Enter`

### 4️⃣ انتظر التأكيد
- ستظهر رسالة: ✅ **Success. No rows returned**
- في Console سترى: ✅ **تم تنفيذ جميع التعديلات بنجاح!**

---

## 📦 ما الذي سيتم إضافته؟

### أ. تعديلات على جدول `jobs`

| الحقل الجديد | النوع | الوصف |
|--------------|-------|-------|
| `application_url` | TEXT | رابط التقديم على الوظيفة من الموقع الخارجي |
| `date` | TEXT | تاريخ نشر الوظيفة في الموقع الأصلي |
| `source` | TEXT | مصدر الوظيفة (manual, jobsofoman.com, ...) |
| `updated_at` | TIMESTAMP | آخر تحديث للوظيفة (يتم تلقائياً) |

**ملاحظة:** الوظائف الموجودة حالياً سيتم وضع `source = 'manual'` لها تلقائياً.

---

### ب. جدول جديد: `scraping_logs`

جدول لتتبع عمليات جلب الوظائف التلقائي:

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `id` | UUID | معرّف فريد |
| `scrape_date` | TIMESTAMP | تاريخ ووقت عملية الجلب |
| `jobs_scraped` | INTEGER | عدد الوظائف التي تم جلبها |
| `jobs_added` | INTEGER | عدد الوظائف الجديدة المضافة |
| `jobs_duplicated` | INTEGER | عدد الوظائف المكررة |
| `source` | TEXT | المصدر (jobsofoman.com) |
| `status` | TEXT | success أو failed |
| `error_message` | TEXT | رسالة الخطأ في حال الفشل |
| `execution_time_ms` | INTEGER | وقت التنفيذ بالميلي ثانية |

---

### ج. Indexes للأداء العالي

تم إضافة 7 indexes لتسريع:
- ✅ البحث عن الروابط المكررة
- ✅ الفرز حسب المصدر
- ✅ الفرز حسب التاريخ
- ✅ الاستعلامات المعقدة

---

### د. Functions مساعدة

#### 1. `check_duplicate_job(title, url)`
للتحقق من وجود وظيفة مكررة:
```sql
SELECT check_duplicate_job('مطلوب مهندس برمجيات', 'https://example.com/job1');
-- يرجع true إذا كانت موجودة
```

#### 2. `cleanup_old_jobs(days)`
لحذف الوظائف القديمة المنتهية:
```sql
SELECT cleanup_old_jobs(90); -- حذف الوظائف الأقدم من 90 يوم
```

#### 3. `update_updated_at_column()`
يعمل تلقائياً عند تحديث أي وظيفة

---

### هـ. View للإحصائيات: `scraping_stats`

عرض شامل لإحصائيات الجلب:
```sql
SELECT * FROM scraping_stats;
```

يعرض:
- إجمالي عمليات الجلب لكل مصدر
- متوسط الوظائف المضافة
- آخر عملية جلب
- نسبة النجاح/الفشل

---

## ✅ التحقق من نجاح التنفيذ

### 1. تحقق من أعمدة جدول jobs

نفّذ في SQL Editor:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'jobs'
ORDER BY ordinal_position;
```

**يجب أن ترى:**
- ✅ application_url | text
- ✅ date | text
- ✅ source | text
- ✅ updated_at | timestamp

---

### 2. تحقق من جدول scraping_logs

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'scraping_logs';
```

**النتيجة المتوقعة:**
```
scraping_logs
```

---

### 3. تحقق من الـ Indexes

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('jobs', 'scraping_logs');
```

**يجب أن ترى على الأقل:**
- idx_jobs_application_url
- idx_jobs_source
- idx_jobs_date
- idx_scraping_logs_date

---

### 4. تحقق من الـ Functions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE 'check_duplicate%' 
   OR routine_name LIKE 'cleanup_old%';
```

---

## 🎯 الاستخدام بعد التنفيذ

### 1. اختبر نظام الـ Scraper

اذهب إلى لوحة تحكم الأدمن:
```
https://your-site.com/admin/scraper
```

اضغط **"جلب الوظائف الآن"** وشاهد النتائج!

---

### 2. راقب السجلات

```sql
-- آخر 10 عمليات جلب
SELECT 
  scrape_date,
  source,
  jobs_scraped,
  jobs_added,
  jobs_duplicated,
  status
FROM scraping_logs
ORDER BY scrape_date DESC
LIMIT 10;
```

---

### 3. شاهد الوظائف المجلوبة

```sql
-- الوظائف من jobsofoman.com فقط
SELECT 
  title,
  application_url,
  date,
  source,
  posted_date
FROM jobs
WHERE source = 'jobsofoman.com'
ORDER BY posted_date DESC
LIMIT 20;
```

---

## 📊 استعلامات مفيدة

### عدد الوظائف حسب المصدر

```sql
SELECT 
  source,
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs
FROM jobs
GROUP BY source
ORDER BY total_jobs DESC;
```

**نتيجة متوقعة:**
```
source              | total_jobs | active_jobs
--------------------|------------|------------
jobsofoman.com      | 150        | 120
manual              | 50         | 45
```

---

### إحصائيات الجلب اليومية

```sql
SELECT 
  DATE(scrape_date) as day,
  COUNT(*) as scrape_operations,
  SUM(jobs_added) as total_jobs_added,
  AVG(execution_time_ms) as avg_time_ms
FROM scraping_logs
WHERE scrape_date >= NOW() - INTERVAL '7 days'
GROUP BY DATE(scrape_date)
ORDER BY day DESC;
```

---

### أفضل الأوقات للجلب

```sql
SELECT 
  EXTRACT(HOUR FROM scrape_date) as hour_of_day,
  AVG(jobs_added) as avg_jobs_added,
  COUNT(*) as operations_count
FROM scraping_logs
WHERE status = 'success'
GROUP BY hour_of_day
ORDER BY avg_jobs_added DESC;
```

---

### الوظائف المضافة آخر 24 ساعة

```sql
SELECT 
  title,
  source,
  application_url,
  posted_date
FROM jobs
WHERE posted_date >= NOW() - INTERVAL '24 hours'
ORDER BY posted_date DESC;
```

---

## 🔧 حل المشاكل

### ❌ خطأ: "relation jobs already exists"

**السبب:** الجدول موجود بالفعل (طبيعي!)

**الحل:** الكود يستخدم `IF NOT EXISTS` لذا لن يحدث تضارب. تجاهل هذا التحذير.

---

### ❌ خطأ: "column already exists"

**السبب:** الحقل موجود من تنفيذ سابق

**الحل:** الكود يستخدم `ADD COLUMN IF NOT EXISTS` لذا آمن. المتابعة عادية.

---

### ❌ خطأ: "permission denied"

**السبب:** صلاحيات غير كافية

**الحل:** 
1. تأكد أنك مسجل دخول كـ Owner للمشروع
2. استخدم Service Role Key إذا لزم الأمر
3. تواصل مع دعم Supabase

---

### ❌ الوظائف لا تُضاف

**تحقق من:**

1. **هل application_url موجود؟**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'application_url';
```

2. **هل هناك أخطاء في السيرفر؟**
افتح Console وشاهد logs

3. **هل RLS يمنع الإضافة؟**
```sql
-- تأكد من وجود policy للإدراج
SELECT * FROM pg_policies WHERE tablename = 'jobs';
```

---

### ❌ الـ Scraper بطيء

**الحلول:**

1. **تحقق من الـ Indexes:**
```sql
SELECT * FROM pg_indexes WHERE tablename = 'jobs';
```

2. **نظّف الوظائف القديمة:**
```sql
SELECT cleanup_old_jobs(90);
```

3. **راقب أداء الـ View:**
```sql
EXPLAIN ANALYZE SELECT * FROM scraping_stats;
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. **راجع ملف:** `SCRAPER_FAQ.md`
2. **تحقق من logs:** في SQL Editor أو Server Console
3. **استخدم:** `SCRAPER_TROUBLESHOOTING.md`

---

## 🎉 مبروك!

نظام قاعدة البيانات جاهز الآن لجلب آلاف الوظائف تلقائياً! 🚀

**الخطوة التالية:**
اذهب إلى لوحة الأدمن واضغط "جلب الوظائف الآن" لاختبار النظام.

---

**تم إنشاؤه بواسطة:** منصة عُمان للوظائف  
**التاريخ:** 2025-01-17  
**الإصدار:** 1.0

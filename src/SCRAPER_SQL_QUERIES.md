# 📊 استعلامات SQL مفيدة - نظام جلب الوظائف

مجموعة من الاستعلامات الجاهزة للاستخدام في Supabase SQL Editor.

---

## 🔍 استعلامات التحقق والمراقبة

### 1. التحقق من تثبيت الأعمدة الجديدة

```sql
-- التحقق من أعمدة جدول jobs
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs'
AND column_name IN ('application_url', 'date', 'source', 'updated_at')
ORDER BY column_name;
```

**النتيجة المتوقعة:**
```
application_url | text      | YES | NULL
date           | text      | YES | NULL
source         | text      | YES | 'manual'
updated_at     | timestamp | YES | now()
```

---

### 2. التحقق من وجود جدول scraping_logs

```sql
-- التحقق من إنشاء الجدول
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name = 'scraping_logs';
```

---

### 3. عرض جميع الـ Indexes

```sql
-- عرض جميع Indexes المُنشأة
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('jobs', 'scraping_logs')
ORDER BY tablename, indexname;
```

---

### 4. التحقق من Functions

```sql
-- عرض جميع Functions المُنشأة
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
  routine_name LIKE 'check_duplicate%' 
  OR routine_name LIKE 'cleanup_old%'
  OR routine_name LIKE 'update_updated%'
)
ORDER BY routine_name;
```

---

## 📊 استعلامات الإحصائيات

### 5. عدد الوظائف حسب المصدر

```sql
-- إحصائيات الوظائف حسب المصدر
SELECT 
  COALESCE(source, 'غير محدد') as المصدر,
  COUNT(*) as إجمالي_الوظائف,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as الوظائف_النشطة,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as الوظائف_المغلقة,
  ROUND(
    COUNT(CASE WHEN status = 'active' THEN 1 END) * 100.0 / COUNT(*), 
    1
  ) as نسبة_النشطة
FROM jobs
GROUP BY source
ORDER BY إجمالي_الوظائف DESC;
```

---

### 6. إحصائيات عمليات الجلب

```sql
-- إحصائيات شاملة لعمليات الجلب
SELECT 
  COUNT(*) as إجمالي_العمليات,
  SUM(jobs_scraped) as إجمالي_الوظائف_المجلوبة,
  SUM(jobs_added) as إجمالي_الوظائف_المضافة,
  SUM(jobs_duplicated) as إجمالي_المكررات,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as عمليات_ناجحة,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as عمليات_فاشلة,
  ROUND(AVG(jobs_added), 1) as متوسط_الوظائف_المضافة,
  ROUND(AVG(execution_time_ms) / 1000.0, 2) as متوسط_الوقت_بالثواني,
  ROUND(
    COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 
    1
  ) as نسبة_النجاح
FROM scraping_logs;
```

---

### 7. إحصائيات من View الجاهز

```sql
-- استخدام View للإحصائيات (أسهل وأسرع)
SELECT 
  source as المصدر,
  total_runs as عدد_العمليات,
  total_jobs_added as إجمالي_المضافة,
  avg_jobs_per_run as متوسط_لكل_عملية,
  TO_CHAR(last_scrape_date, 'YYYY-MM-DD HH24:MI') as آخر_جلب,
  successful_runs as الناجحة,
  failed_runs as الفاشلة,
  ROUND(avg_execution_time_ms / 1000.0, 2) as متوسط_الوقت_ثانية
FROM scraping_stats
ORDER BY total_jobs_added DESC;
```

---

## 📅 استعلامات حسب التاريخ

### 8. عمليات الجلب في آخر 7 أيام

```sql
-- عمليات الجلب اليومية (آخر أسبوع)
SELECT 
  DATE(scrape_date) as التاريخ,
  COUNT(*) as عدد_العمليات,
  SUM(jobs_scraped) as الوظائف_المجلوبة,
  SUM(jobs_added) as الوظائف_المضافة,
  SUM(jobs_duplicated) as المكررات,
  ROUND(AVG(execution_time_ms) / 1000.0, 2) as متوسط_الوقت_ثانية
FROM scraping_logs
WHERE scrape_date >= NOW() - INTERVAL '7 days'
GROUP BY DATE(scrape_date)
ORDER BY التاريخ DESC;
```

---

### 9. الوظائف المضافة اليوم

```sql
-- الوظائف المضافة اليوم
SELECT 
  title as العنوان,
  source as المصدر,
  application_url as رابط_التقديم,
  TO_CHAR(posted_date, 'HH24:MI') as الوقت
FROM jobs
WHERE DATE(posted_date) = CURRENT_DATE
AND source != 'manual'
ORDER BY posted_date DESC;
```

---

### 10. الوظائف المضافة آخر 24 ساعة

```sql
-- وظائف آخر 24 ساعة مع التفاصيل
SELECT 
  title,
  company,
  source,
  application_url,
  AGE(NOW(), posted_date) as منذ
FROM jobs
WHERE posted_date >= NOW() - INTERVAL '24 hours'
ORDER BY posted_date DESC;
```

---

## 🔎 استعلامات البحث والتحليل

### 11. أفضل الأوقات للجلب

```sql
-- أفضل ساعات اليوم للجلب (أكثر وظائف جديدة)
SELECT 
  EXTRACT(HOUR FROM scrape_date) as الساعة,
  COUNT(*) as عدد_العمليات,
  ROUND(AVG(jobs_added), 1) as متوسط_الوظائف_المضافة,
  ROUND(AVG(jobs_duplicated), 1) as متوسط_المكررات,
  MAX(jobs_added) as أعلى_عدد_مضاف
FROM scraping_logs
WHERE status = 'success'
GROUP BY الساعة
ORDER BY متوسط_الوظائف_المضافة DESC
LIMIT 10;
```

---

### 12. أيام الأسبوع الأكثر إنتاجية

```sql
-- أفضل أيام الأسبوع للجلب
SELECT 
  TO_CHAR(scrape_date, 'Day') as اليوم,
  EXTRACT(DOW FROM scrape_date) as رقم_اليوم,
  COUNT(*) as عدد_العمليات,
  ROUND(AVG(jobs_added), 1) as متوسط_الوظائف
FROM scraping_logs
WHERE status = 'success'
GROUP BY اليوم, رقم_اليوم
ORDER BY رقم_اليوم;
```

---

### 13. البحث عن وظائف مكررة محتملة

```sql
-- البحث عن عناوين متشابهة (مكررات محتملة)
SELECT 
  title,
  COUNT(*) as عدد_التكرار,
  STRING_AGG(DISTINCT source, ', ') as المصادر,
  MIN(posted_date) as أول_إضافة,
  MAX(posted_date) as آخر_إضافة
FROM jobs
GROUP BY LOWER(TRIM(title))
HAVING COUNT(*) > 1
ORDER BY عدد_التكرار DESC
LIMIT 20;
```

---

### 14. الوظائف بدون رابط تقديم

```sql
-- الوظائف التي تحتاج إلى تحديث رابط التقديم
SELECT 
  id,
  title,
  company,
  source,
  posted_date
FROM jobs
WHERE application_url IS NULL
OR application_url = ''
ORDER BY posted_date DESC
LIMIT 50;
```

---

## ⚠️ استعلامات الأخطاء والمشاكل

### 15. عمليات الجلب الفاشلة

```sql
-- عرض العمليات الفاشلة مع الأخطاء
SELECT 
  scrape_date as التاريخ,
  source as المصدر,
  error_message as رسالة_الخطأ,
  execution_time_ms as الوقت_مللي_ثانية
FROM scraping_logs
WHERE status = 'failed'
ORDER BY scrape_date DESC
LIMIT 10;
```

---

### 16. العمليات البطيئة

```sql
-- العمليات التي استغرقت وقتاً طويلاً (أكثر من 10 ثواني)
SELECT 
  scrape_date,
  jobs_scraped,
  jobs_added,
  ROUND(execution_time_ms / 1000.0, 2) as الوقت_بالثواني
FROM scraping_logs
WHERE execution_time_ms > 10000
ORDER BY execution_time_ms DESC
LIMIT 20;
```

---

### 17. معدل الأخطاء حسب المصدر

```sql
-- نسبة نجاح/فشل العمليات حسب المصدر
SELECT 
  source,
  COUNT(*) as إجمالي_العمليات,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as الناجحة,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as الفاشلة,
  ROUND(
    COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 
    1
  ) as نسبة_النجاح
FROM scraping_logs
GROUP BY source
ORDER BY نسبة_النجاح DESC;
```

---

## 🧹 استعلامات الصيانة

### 18. حذف الوظائف القديمة المنتهية

```sql
-- حذف الوظائف الأقدم من 90 يوم (باستخدام Function)
SELECT cleanup_old_jobs(90);

-- أو يدوياً:
DELETE FROM jobs
WHERE posted_date < NOW() - INTERVAL '90 days'
AND (deadline < NOW() OR status = 'closed');
```

---

### 19. حذف سجلات الجلب القديمة

```sql
-- حذف سجلات أقدم من 6 أشهر
DELETE FROM scraping_logs
WHERE scrape_date < NOW() - INTERVAL '6 months';

-- أو الاحتفاظ بآخر 1000 سجل فقط:
DELETE FROM scraping_logs
WHERE id NOT IN (
  SELECT id
  FROM scraping_logs
  ORDER BY scrape_date DESC
  LIMIT 1000
);
```

---

### 20. تحديث مصدر الوظائف اليدوية

```sql
-- وضع 'manual' لجميع الوظائف بدون مصدر
UPDATE jobs
SET source = 'manual'
WHERE source IS NULL;
```

---

## 🔧 استعلامات الاختبار والتطوير

### 21. اختبار Function للمكررات

```sql
-- اختبار التحقق من وظيفة مكررة
SELECT check_duplicate_job(
  'مطلوب مهندس برمجيات',
  'https://example.com/job123'
);
-- يرجع true إذا كانت موجودة
```

---

### 22. عرض 10 وظائف عشوائية للمراجعة

```sql
-- وظائف عشوائية للتحقق من الجودة
SELECT 
  title,
  source,
  application_url,
  date,
  posted_date
FROM jobs
WHERE source != 'manual'
ORDER BY RANDOM()
LIMIT 10;
```

---

### 23. مقارنة الوظائف اليدوية مع المجلوبة

```sql
-- مقارنة الجودة بين المصادر
SELECT 
  source,
  COUNT(*) as العدد,
  COUNT(CASE WHEN application_url IS NOT NULL THEN 1 END) as مع_رابط_تقديم,
  COUNT(CASE WHEN company IS NOT NULL THEN 1 END) as مع_اسم_شركة,
  COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as مع_وصف,
  ROUND(AVG(LENGTH(description)), 0) as متوسط_طول_الوصف
FROM jobs
GROUP BY source
ORDER BY العدد DESC;
```

---

## 📈 استعلامات للتقارير

### 24. تقرير شهري للوظائف المضافة

```sql
-- تقرير شهري
SELECT 
  TO_CHAR(posted_date, 'YYYY-MM') as الشهر,
  source,
  COUNT(*) as عدد_الوظائف,
  COUNT(DISTINCT company) as عدد_الشركات
FROM jobs
WHERE posted_date >= NOW() - INTERVAL '12 months'
GROUP BY الشهر, source
ORDER BY الشهر DESC, عدد_الوظائف DESC;
```

---

### 25. أكثر الشركات نشراً للوظائف

```sql
-- أكثر 20 شركة نشراً للوظائف
SELECT 
  company,
  COUNT(*) as عدد_الوظائف,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as النشطة,
  STRING_AGG(DISTINCT source, ', ') as المصادر,
  MAX(posted_date) as آخر_وظيفة
FROM jobs
WHERE company IS NOT NULL
GROUP BY company
ORDER BY عدد_الوظائف DESC
LIMIT 20;
```

---

## 💡 نصائح الاستخدام

### ✅ للاستخدام اليومي:
- استخدم استعلامات **5، 7، 9** للمراقبة السريعة
- استخدم **15** لفحص الأخطاء

### ✅ للتحليل الأسبوعي:
- استخدم **8، 11، 12** لتحسين التوقيت
- استخدم **24** للتقارير

### ✅ للصيانة الشهرية:
- نفّذ **18، 19** لتنظيف القاعدة
- استخدم **23** لمراجعة الجودة

---

## 🎯 استعلامات سريعة (نسخ ولصق مباشر)

```sql
-- آخر 5 عمليات جلب
SELECT scrape_date, jobs_added, status FROM scraping_logs ORDER BY scrape_date DESC LIMIT 5;

-- عدد الوظائف حسب المصدر
SELECT source, COUNT(*) FROM jobs GROUP BY source;

-- آخر 10 وظائف مضافة
SELECT title, source, posted_date FROM jobs ORDER BY posted_date DESC LIMIT 10;

-- الإحصائيات الشاملة
SELECT * FROM scraping_stats;
```

---

**تم إنشاؤه:** 2025-01-17  
**للاستفسارات:** راجع `SCRAPER_FAQ.md`

# ✅ نظام جلب الوظائف التلقائي - الإعداد الكامل

## 🎯 الحالة: جاهز للاختبار!

تم الانتهاء من جميع المكونات. يتبقى خطوة واحدة فقط في Supabase.

---

## 📋 ما تم إنجازه؟

### ✅ 1. مكونات البرمجة (جاهزة)
- **Web Scraper** → `/supabase/functions/server/job-scraper.tsx`
- **Server Endpoint** → `/make-server-8a20c00b/admin/scrape-jobs`
- **Admin Page** → `/pages/admin/AdminScraperPage.tsx`
- **Logging System** → تسجيل تلقائي في `scraping_logs`

### ✅ 2. ملفات التوثيق (7 ملفات)
- دليل الاستخدام
- الأسئلة الشائعة
- حل المشاكل
- الميزات المتقدمة

### ⏳ 3. قاعدة البيانات (خطوة واحدة متبقية)
**يجب عليك تنفيذ ملف SQL واحد فقط!**

---

## 🚀 الخطوة المطلوبة (5 دقائق)

### افتح Supabase وشغّل هذا الملف:

```bash
📄 SCRAPER_DATABASE_SETUP.sql
```

### كيفية التنفيذ:

1. **اذهب إلى:** https://supabase.com/dashboard
2. **اختر مشروعك:** منصة عُمان للوظائف
3. **افتح:** SQL Editor
4. **افتح الملف:** `SCRAPER_DATABASE_SETUP.sql`
5. **انسخ المحتوى بالكامل** (Ctrl+A → Ctrl+C)
6. **الصق في SQL Editor** (Ctrl+V)
7. **اضغط RUN** أو `Ctrl + Enter`

### النتيجة المتوقعة:
```
✅ Success. No rows returned
✅ تم تنفيذ جميع التعديلات بنجاح!
📊 الجداول المحدثة: jobs, scraping_logs
🔍 Indexes المضافة: 7 indexes
⚡ Functions المضافة: 3 functions
📈 Views المضافة: scraping_stats
```

---

## 📦 ماذا سيضيف ملف SQL؟

### أ. تعديل جدول `jobs`

سيضيف 4 أعمدة جديدة:

```sql
-- الحقول الجديدة
application_url    TEXT      -- رابط التقديم
date              TEXT      -- تاريخ النشر
source            TEXT      -- المصدر (jobsofoman.com)
updated_at        TIMESTAMP -- آخر تحديث
```

**ملاحظة:** الوظائف الموجودة حالياً سيتم وضع `source = 'manual'` لها تلقائياً.

---

### ب. جدول جديد `scraping_logs`

لتسجيل وتتبع عمليات الجلب:

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `id` | UUID | معرّف فريد |
| `scrape_date` | TIMESTAMP | تاريخ ووقت العملية |
| `jobs_scraped` | INTEGER | عدد الوظائف المجلوبة من الموقع |
| `jobs_added` | INTEGER | عدد الوظائف الجديدة المضافة |
| `jobs_duplicated` | INTEGER | عدد الوظائف المكررة المتجاهلة |
| `source` | TEXT | المصدر (jobsofoman.com) |
| `status` | TEXT | success أو failed |
| `error_message` | TEXT | رسالة الخطأ إن وجدت |
| `execution_time_ms` | INTEGER | وقت التنفيذ بالميلي ثانية |

---

### ج. Indexes للأداء (7 indexes)

```sql
-- للبحث السريع عن المكررات
idx_jobs_application_url
idx_jobs_title_url

-- للفرز والتصفية
idx_jobs_source
idx_jobs_date
idx_scraping_logs_date
idx_scraping_logs_source
idx_scraping_logs_status
```

**الفائدة:** سرعة فائقة في البحث والفرز حتى مع آلاف الوظائف.

---

### د. Functions مساعدة (3 functions)

#### 1. `check_duplicate_job(title, url)`
للتحقق من وجود وظيفة مكررة:
```sql
SELECT check_duplicate_job('مهندس برمجيات', 'https://example.com/job');
-- يرجع true إذا كانت موجودة
```

#### 2. `cleanup_old_jobs(days)`
لحذف الوظائف القديمة المنتهية:
```sql
SELECT cleanup_old_jobs(90); -- حذف وظائف أقدم من 90 يوم
```

#### 3. `update_updated_at_column()`
يعمل تلقائياً: يحدّث `updated_at` عند تعديل أي وظيفة.

---

### هـ. View للإحصائيات `scraping_stats`

عرض شامل لجميع الإحصائيات:

```sql
SELECT * FROM scraping_stats;
```

**يعرض:**
- إجمالي عمليات الجلب لكل مصدر
- إجمالي الوظائف المضافة
- متوسط الوظائف لكل عملية
- آخر عملية جلب
- نسبة النجاح/الفشل
- متوسط وقت التنفيذ

---

## 🔌 Endpoints الجديدة في السيرفر

تم إضافة 3 endpoints جديدة:

### 1. `POST /admin/scrape-jobs`
**الوظيفة:** جلب الوظائف من الموقع وإضافتها للقاعدة.

**الاستخدام:**
```javascript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({ sourceUrl: 'https://jobsofoman.com/ar/index.php' })
  }
);
```

**الرد:**
```json
{
  "success": true,
  "message": "تم جلب وإضافة 15 وظيفة جديدة بنجاح",
  "jobsScraped": 25,
  "jobsAdded": 15,
  "jobsDuplicated": 10,
  "executionTimeMs": 3456,
  "jobs": [...]
}
```

---

### 2. `GET /admin/scraping-logs?limit=20`
**الوظيفة:** عرض سجلات عمليات الجلب.

**الاستخدام:**
```javascript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/scraping-logs?limit=20`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);
```

**الرد:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "...",
      "scrapeDate": "2025-01-17T10:30:00Z",
      "jobsScraped": 25,
      "jobsAdded": 15,
      "jobsDuplicated": 10,
      "source": "jobsofoman.com",
      "status": "success",
      "executionTimeMs": 3456
    }
  ]
}
```

---

### 3. `GET /admin/scraping-stats`
**الوظيفة:** عرض إحصائيات شاملة من الـ View.

**الاستخدام:**
```javascript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/scraping-stats`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);
```

**الرد:**
```json
{
  "success": true,
  "stats": [
    {
      "source": "jobsofoman.com",
      "totalRuns": 50,
      "totalJobsScraped": 1250,
      "totalJobsAdded": 450,
      "totalJobsDuplicated": 800,
      "avgJobsPerRun": 9,
      "avgExecutionTimeMs": 3200,
      "lastScrapeDate": "2025-01-17T10:30:00Z",
      "failedRuns": 2,
      "successfulRuns": 48
    }
  ]
}
```

---

## 🧪 كيفية الاختبار

### 1. بعد تنفيذ ملف SQL:

#### تحقق من الأعمدة الجديدة:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jobs'
AND column_name IN ('application_url', 'date', 'source', 'updated_at');
```

**النتيجة المتوقعة:**
```
application_url | text
date           | text
source         | text
updated_at     | timestamp
```

---

#### تحقق من جدول scraping_logs:
```sql
SELECT COUNT(*) FROM scraping_logs;
```

**النتيجة المتوقعة:** `0` (فارغ في البداية)

---

### 2. اختبر الجلب من لوحة الأدمن:

1. **اذهب إلى:** `https://your-site.com/admin/scraper`
2. **اضغط:** "جلب الوظائف الآن"
3. **انتظر:** سترى progress indicator
4. **النتيجة:** رسالة نجاح مع عدد الوظائف المضافة

---

### 3. تحقق من النتائج:

```sql
-- عرض الوظائف المجلوبة
SELECT 
  title,
  source,
  application_url,
  date,
  posted_date
FROM jobs
WHERE source = 'jobsofoman.com'
ORDER BY posted_date DESC
LIMIT 10;

-- عرض سجل العملية
SELECT 
  scrape_date,
  jobs_scraped,
  jobs_added,
  jobs_duplicated,
  status,
  execution_time_ms
FROM scraping_logs
ORDER BY scrape_date DESC
LIMIT 1;
```

---

## 📊 استعلامات مفيدة

### عدد الوظائف حسب المصدر:
```sql
SELECT 
  source,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active
FROM jobs
GROUP BY source
ORDER BY total DESC;
```

### نسبة نجاح عمليات الجلب:
```sql
SELECT 
  COUNT(*) as total_runs,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  ROUND(
    COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate
FROM scraping_logs;
```

### أفضل وقت للجلب (أكثر وظائف):
```sql
SELECT 
  EXTRACT(HOUR FROM scrape_date) as hour,
  AVG(jobs_added) as avg_jobs,
  COUNT(*) as operations
FROM scraping_logs
WHERE status = 'success'
GROUP BY hour
ORDER BY avg_jobs DESC
LIMIT 5;
```

---

## 🔄 الجدولة التلقائية (اختياري)

بعد التأكد من نجاح النظام، يمكنك جدولته:

### أ. GitHub Actions (مجاني):
راجع `SCRAPER_FAQ.md` → قسم "الجدولة"

### ب. Cron Jobs (إذا كان لديك VPS):
```bash
# كل 6 ساعات
0 */6 * * * curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### ج. Supabase Edge Functions Cron (قريباً):
سيتم إضافة دعم مدمج في Supabase.

---

## 🛠️ حل المشاكل الشائعة

### ❌ خطأ: "column does not exist"

**السبب:** لم يتم تنفيذ ملف SQL بعد.

**الحل:** نفّذ `SCRAPER_DATABASE_SETUP.sql` في Supabase SQL Editor.

---

### ❌ خطأ: "permission denied for table scraping_logs"

**السبب:** RLS غير مُعد بشكل صحيح.

**الحل:**
```sql
ALTER TABLE scraping_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read scraping logs" 
ON scraping_logs FOR SELECT USING (true);
```

---

### ❌ الوظائف لا تُضاف

**تحقق:**
1. هل application_url موجود في جدول jobs؟
2. هل السيرفر يعمل؟ (افتح Console)
3. هل هناك أخطاء في scraping_logs؟

```sql
SELECT * FROM scraping_logs 
WHERE status = 'failed' 
ORDER BY scrape_date DESC;
```

---

## 📚 ملفات التوثيق الكاملة

| الملف | الوصف | الأولوية |
|-------|-------|----------|
| ⭐ `SCRAPER_DATABASE_SETUP.sql` | الملف الوحيد المطلوب للتنفيذ | **عالية** |
| ⭐ `QUICK_START_SCRAPER.md` | دليل البدء السريع | **عالية** |
| `SCRAPER_DB_GUIDE.md` | دليل قاعدة البيانات الشامل | متوسطة |
| `SCRAPER_SETUP.md` | شرح النظام بالكامل | متوسطة |
| `SCRAPER_USAGE.md` | دليل الاستخدام اليومي | متوسطة |
| `SCRAPER_FAQ.md` | أسئلة وأجوبة + الجدولة | مهمة |
| `SCRAPER_TROUBLESHOOTING.md` | حل المشاكل التقنية | عند الحاجة |
| `SCRAPER_ADVANCED.md` | ميزات متقدمة | عند الحاجة |

---

## ✅ Checklist النهائي

قبل الإنتاج، تأكد من:

- [ ] ✅ تنفيذ `SCRAPER_DATABASE_SETUP.sql` في Supabase
- [ ] ✅ التأكد من وجود أعمدة application_url و date و source
- [ ] ✅ التأكد من إنشاء جدول scraping_logs
- [ ] ✅ اختبار الجلب من لوحة الأدمن مرة واحدة على الأقل
- [ ] ✅ التحقق من ظهور الوظائف المجلوبة في القاعدة
- [ ] ✅ التحقق من تسجيل العملية في scraping_logs
- [ ] ⏳ (اختياري) إعداد الجدولة التلقائية

---

## 🎉 تهانينا!

نظامك جاهز الآن لجلب مئات الوظائف تلقائياً! 🚀

**الخطوة التالية:**  
افتح `SCRAPER_DATABASE_SETUP.sql` ونفّذه في Supabase.

---

## 📞 الدعم

**للمشاكل التقنية:** راجع `SCRAPER_TROUBLESHOOTING.md`  
**للأسئلة:** راجع `SCRAPER_FAQ.md`  
**للاستخدام اليومي:** راجع `SCRAPER_USAGE.md`

---

**تم بواسطة:** منصة عُمان للوظائف  
**التاريخ:** 2025-01-17  
**الحالة:** ✅ جاهز للاختبار والإنتاج

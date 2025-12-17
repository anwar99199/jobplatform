-- =====================================================
-- ملف SQL لإعداد قاعدة البيانات لنظام جلب الوظائف التلقائي
-- منصة عُمان للوظائف - Job Scraper Database Setup
-- =====================================================
-- 
-- تعليمات التنفيذ:
-- 1. افتح Supabase Dashboard
-- 2. اذهب إلى SQL Editor
-- 3. انسخ هذا الملف بالكامل والصقه
-- 4. اضغط RUN أو Ctrl+Enter
-- 
-- =====================================================

-- =====================================================
-- 1. تعديل جدول jobs (إضافة حقول الـ scraper)
-- =====================================================

-- إضافة حقل application_url (رابط التقديم على الوظيفة)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS application_url TEXT;

-- إضافة حقل date (تاريخ نشر الوظيفة في الموقع الخارجي)
-- يمكن استخدامه بدلاً من posted_date
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS date TEXT;

-- إضافة حقل source (مصدر الوظيفة - مثل jobsofoman.com)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- =====================================================
-- 2. إنشاء Indexes لتحسين الأداء
-- =====================================================

-- Index على application_url للبحث السريع عن الروابط المكررة
CREATE INDEX IF NOT EXISTS idx_jobs_application_url 
ON jobs(application_url);

-- Index على source لتصفية الوظائف حسب المصدر
CREATE INDEX IF NOT EXISTS idx_jobs_source 
ON jobs(source);

-- Index على date للفرز حسب التاريخ
CREATE INDEX IF NOT EXISTS idx_jobs_date 
ON jobs(date);

-- Index مركب للبحث عن المكررات (title + application_url)
CREATE INDEX IF NOT EXISTS idx_jobs_title_url 
ON jobs(title, application_url);

-- =====================================================
-- 3. إنشاء جدول scraping_logs (سجلات عمليات الجلب)
-- =====================================================

CREATE TABLE IF NOT EXISTS scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_date TIMESTAMP NOT NULL DEFAULT NOW(),
  jobs_scraped INTEGER NOT NULL,
  jobs_added INTEGER NOT NULL,
  jobs_duplicated INTEGER DEFAULT 0,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- إضافة تعليقات توضيحية للجدول
COMMENT ON TABLE scraping_logs IS 'سجل عمليات جلب الوظائف التلقائي من المواقع الخارجية';
COMMENT ON COLUMN scraping_logs.jobs_scraped IS 'عدد الوظائف التي تم جلبها من الموقع';
COMMENT ON COLUMN scraping_logs.jobs_added IS 'عدد الوظائف الجديدة المضافة للقاعدة';
COMMENT ON COLUMN scraping_logs.jobs_duplicated IS 'عدد الوظائف المكررة التي تم تجاهلها';
COMMENT ON COLUMN scraping_logs.source IS 'مصدر الوظائف (مثل jobsofoman.com)';
COMMENT ON COLUMN scraping_logs.status IS 'حالة العملية (success أو failed)';

-- =====================================================
-- 4. إنشاء Indexes لجدول scraping_logs
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scraping_logs_date 
ON scraping_logs(scrape_date DESC);

CREATE INDEX IF NOT EXISTS idx_scraping_logs_source 
ON scraping_logs(source);

CREATE INDEX IF NOT EXISTS idx_scraping_logs_status 
ON scraping_logs(status);

-- =====================================================
-- 5. تفعيل Row Level Security (RLS)
-- =====================================================

-- تفعيل RLS على scraping_logs
ALTER TABLE scraping_logs ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة العامة
CREATE POLICY "Allow public read scraping logs" 
ON scraping_logs 
FOR SELECT 
USING (true);

-- ملاحظة: policies جدول jobs موجودة مسبقاً من SETUP.md

-- =====================================================
-- 6. إنشاء View للإحصائيات (اختياري)
-- =====================================================

CREATE OR REPLACE VIEW scraping_stats AS
SELECT 
  source,
  COUNT(*) as total_runs,
  SUM(jobs_scraped) as total_jobs_scraped,
  SUM(jobs_added) as total_jobs_added,
  SUM(jobs_duplicated) as total_jobs_duplicated,
  AVG(jobs_added) as avg_jobs_per_run,
  AVG(execution_time_ms) as avg_execution_time_ms,
  MAX(scrape_date) as last_scrape_date,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_runs,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_runs
FROM scraping_logs
GROUP BY source;

-- تعليق توضيحي
COMMENT ON VIEW scraping_stats IS 'إحصائيات شاملة لعمليات جلب الوظائف حسب المصدر';

-- =====================================================
-- 7. إنشاء Function للتحقق من الوظائف المكررة
-- =====================================================

CREATE OR REPLACE FUNCTION check_duplicate_job(
  job_title TEXT,
  job_url TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM jobs 
    WHERE LOWER(TRIM(title)) = LOWER(TRIM(job_title))
    OR application_url = job_url
  );
END;
$$ LANGUAGE plpgsql;

-- تعليق توضيحي
COMMENT ON FUNCTION check_duplicate_job IS 'التحقق من وجود وظيفة مكررة بناءً على العنوان أو الرابط';

-- =====================================================
-- 8. إنشاء Function لتنظيف الوظائف القديمة (اختياري)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_jobs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- حذف الوظائف الأقدم من X يوم والتي انتهت
  DELETE FROM jobs
  WHERE posted_date < NOW() - INTERVAL '1 day' * days_old
  AND (deadline < NOW() OR status = 'closed');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- تعليق توضيحي
COMMENT ON FUNCTION cleanup_old_jobs IS 'حذف الوظائف القديمة المنتهية (افتراضياً أقدم من 90 يوم)';

-- =====================================================
-- 9. تحديث الوظائف اليدوية القديمة (إضافة source)
-- =====================================================

-- تحديث جميع الوظائف الموجودة بدون source لتكون 'manual'
UPDATE jobs 
SET source = 'manual' 
WHERE source IS NULL;

-- =====================================================
-- 10. إنشاء Trigger لتحديث updated_at تلقائياً
-- =====================================================

-- إنشاء function للـ trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة عمود updated_at إذا لم يكن موجوداً
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- إنشاء trigger
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- التحقق من نجاح التنفيذ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ تم تنفيذ جميع التعديلات بنجاح!';
  RAISE NOTICE '📊 الجداول المحدثة: jobs, scraping_logs';
  RAISE NOTICE '🔍 Indexes المضافة: 7 indexes';
  RAISE NOTICE '⚡ Functions المضافة: 3 functions';
  RAISE NOTICE '📈 Views المضافة: scraping_stats';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 النظام جاهز الآن لجلب الوظائف تلقائياً!';
END $$;

-- =====================================================
-- نهاية الملف
-- =====================================================

-- للتحقق من الأعمدة الجديدة في جدول jobs:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'jobs';

-- للتحقق من scraping_logs:
-- SELECT * FROM scraping_logs ORDER BY scrape_date DESC LIMIT 10;

-- لعرض الإحصائيات:
-- SELECT * FROM scraping_stats;

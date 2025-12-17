# دليل نظام جلب الوظائف التلقائي
# Job Scraper System Guide

## نظرة عامة
نظام جلب الوظائف التلقائي هو ميزة قوية في منصة عُمان للوظائف تسمح باستيراد الوظائف تلقائياً من مواقع خارجية مثل jobsofoman.com دون الحاجة لإدخالها يدوياً.

---

## المكونات الرئيسية

### 1. Backend (السيرفر)

#### الملف: `/supabase/functions/server/job-scraper.tsx`
- **الوظيفة**: استخراج الوظائف من المواقع الخارجية
- **المميزات**:
  - دعم multiple selectors للعثور على عناصر الوظائف
  - استخراج ذكي للعنوان والوصف ورابط التقديم
  - timeout protection (30 ثانية)
  - تجنب التكرار في نفس الجلسة
  - تتبع المصدر لكل وظيفة

#### الـ Endpoint: `/make-server-8a20c00b/admin/scrape-jobs`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `X-Admin-Token: [admin token]`
- **Body** (اختياري):
  ```json
  {
    "sourceUrl": "https://jobsofoman.com/ar/index.php"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "تم جلب وإضافة X وظيفة جديدة بنجاح",
    "jobsScraped": 50,
    "jobsAdded": 25,
    "jobs": [...]
  }
  ```

### 2. Frontend (واجهة المستخدم)

#### الصفحة: `/pages/admin/AdminScraperPage.tsx`
- **المسار**: `/admin/scraper`
- **الوصول**: Admin فقط
- **المميزات**:
  - واجهة سهلة لتشغيل العملية يدوياً
  - عرض النتائج في الوقت الفعلي
  - إحصائيات تفصيلية (مستخرجة، مضافة، مكررة)
  - دليل شامل لجدولة العملية تلقائياً
  - عرض الوظائف المضافة مع روابطها

#### API Function: `/utils/adminApi.ts`
```typescript
export const scrapeJobs = async (sourceUrl?: string) => {
  // إرسال طلب لجلب الوظائف
}
```

---

## كيفية الاستخدام

### الطريقة 1: التشغيل اليدوي

1. قم بتسجيل الدخول كـ Admin
2. انتقل إلى لوحة التحكم
3. اضغط على "جلب الوظائف تلقائياً"
4. اضغط على زر "جلب الوظائف الآن"
5. انتظر حتى تكتمل العملية
6. راجع النتائج والوظائف المضافة

### الطريقة 2: الجدولة التلقائية باستخدام Cron-Job.org

#### الخطوات:

1. **التسجيل**:
   - اذهب إلى https://cron-job.org
   - أنشئ حساب مجاني

2. **إنشاء Cron Job**:
   - اضغط على "Create Cronjob"
   - أدخل العنوان: "Scrape Jobs - Oman Jobs Platform"

3. **الإعدادات**:
   - **URL**: 
     ```
     https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs
     ```
   - **Request Method**: POST
   - **Headers**:
     ```
     Content-Type: application/json
     X-Admin-Token: YOUR_ADMIN_TOKEN
     ```
   - **Body** (اختياري):
     ```json
     {"sourceUrl": "https://jobsofoman.com/ar/index.php"}
     ```

4. **جدولة التوقيت**:
   - **يومياً**: `0 2 * * *` (كل يوم الساعة 2 صباحاً)
   - **كل 6 ساعات**: `0 */6 * * *`
   - **كل 12 ساعة**: `0 */12 * * *`

5. **حفظ وتفعيل**

### الطريقة 3: GitHub Actions

#### إنشاء Workflow:

1. أنشئ مستودع GitHub جديد
2. أنشئ ملف: `.github/workflows/scrape-jobs.yml`
3. أضف الكود التالي:

```yaml
name: Scrape Jobs

on:
  schedule:
    # يعمل كل 6 ساعات
    - cron: '0 */6 * * *'
  # يمكن تشغيله يدوياً من GitHub Actions tab
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    
    steps:
      - name: Scrape Jobs from JobsOfOman
        run: |
          curl -X POST \
            https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "X-Admin-Token: ${{ secrets.ADMIN_TOKEN }}" \
            -d '{"sourceUrl": "https://jobsofoman.com/ar/index.php"}'
      
      - name: Log Result
        if: always()
        run: echo "Job scraping completed"
```

4. **إضافة Secrets في GitHub**:
   - انتقل إلى Settings → Secrets → Actions
   - أضف:
     - `SUPABASE_ANON_KEY`: مفتاح Supabase العام
     - `ADMIN_TOKEN`: admin token الخاص بك

5. **تفعيل Workflow**:
   - اذهب إلى Actions tab
   - فعّل workflows إذا لم تكن مفعّلة
   - يمكنك تشغيله يدوياً من "Run workflow"

---

## آلية عمل النظام

### 1. جلب الصفحة
- يتم fetch صفحة الموقع المستهدف
- timeout بعد 30 ثانية لتجنب التعليق
- headers واقعية لتجنب الحظر

### 2. استخراج الوظائف
- **استراتيجية متعددة المراحل**:
  1. البحث عن عناصر HTML محددة (`.job`, `.vacancy`, إلخ)
  2. إذا فشل، البحث في الروابط والعناوين
  3. استخراج العنوان، الوصف، الرابط

### 3. تنظيف البيانات
- تحديد طول العنوان (200 حرف)
- تحديد طول الوصف (500 حرف)
- تحويل الروابط النسبية إلى مطلقة
- إزالة HTML tags

### 4. التحقق من التكرار
- **في الجلسة الحالية**: تجنب إضافة نفس الوظيفة مرتين
- **في قاعدة البيانات**: مقارنة بالعنوان والرابط
- إذا كانت الوظيفة موجودة، يتم تخطيها

### 5. إضافة إلى قاعدة البيانات
- إدراج الوظائف الجديدة فقط
- تحديث التاريخ تلقائياً
- إرجاع عدد الوظائف المضافة

---

## معالجة الأخطاء

### الأخطاء الشائعة وحلولها:

#### 1. "Failed to fetch"
- **السبب**: الموقع غير متاح أو timeout
- **الحل**: 
  - تحقق من اتصال الإنترنت
  - جرب لاحقاً
  - تحقق من أن الموقع يعمل

#### 2. "لم يتم العثور على وظائف"
- **السبب**: تغيير في بنية HTML للموقع
- **الحل**:
  - تحديث selectors في `job-scraper.tsx`
  - فحص الموقع يدوياً

#### 3. "جميع الوظائف موجودة بالفعل"
- **السبب**: لا توجد وظائف جديدة
- **الحل**: هذا طبيعي، لا حاجة لفعل شيء

#### 4. "فشل في حفظ الوظائف"
- **السبب**: مشكلة في قاعدة البيانات
- **الحل**:
  - تحقق من اتصال Supabase
  - راجع console logs
  - تحقق من RLS policies

---

## الأداء والتحسين

### التوصيات:

1. **التوقيت**:
   - جدولة مرة أو مرتين يومياً كافية
   - تجنب الجدولة كل ساعة (تحميل زائد)

2. **المراقبة**:
   - راجع النتائج بانتظام
   - تحقق من جودة الوظائف المستخرجة
   - احذف الوظائف غير المناسبة

3. **الصيانة**:
   - تحديث selectors عند تغيير بنية الموقع
   - إضافة مواقع جديدة عند الحاجة
   - تحسين خوارزمية التنظيف

---

## إضافة مواقع جديدة

لإضافة موقع جديد للـ scraping:

1. **إنشاء دالة جديدة** في `job-scraper.tsx`:

```typescript
export async function scrapeNewWebsite(): Promise<ScrapedJob[]> {
  const url = 'https://newwebsite.com/jobs';
  const jobs: ScrapedJob[] = [];
  
  try {
    // Fetch and parse
    const response = await fetch(url, { /* headers */ });
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract jobs
    const jobElements = doc.querySelectorAll('.job-selector');
    
    for (const element of jobElements) {
      jobs.push({
        title: /* extract title */,
        description: /* extract description */,
        applicationUrl: /* extract url */,
        date: new Date().toISOString().split('T')[0],
        source: 'newwebsite.com'
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping:', error);
    throw error;
  }
}
```

2. **تحديث `scrapeWebsite`**:

```typescript
export async function scrapeWebsite(url: string): Promise<ScrapedJob[]> {
  if (url.includes('jobsofoman.com')) {
    return scrapeJobsOfOman();
  } else if (url.includes('newwebsite.com')) {
    return scrapeNewWebsite();
  }
  
  throw new Error(`Scraping not supported for URL: ${url}`);
}
```

3. **اختبار** من صفحة Admin Scraper

---

## الأمان

### الاعتبارات الأمنية:

1. **Admin Token**:
   - لا تشارك admin token مع أحد
   - استخدم environment variables
   - غيّر token بانتظام

2. **Rate Limiting**:
   - لا تجدول أكثر من كل 6 ساعات
   - احترم شروط استخدام المواقع المصدر

3. **Headers**:
   - استخدم User-Agent واقعي
   - لا تتظاهر بأنك متصفح حقيقي

---

## الخلاصة

نظام جلب الوظائف التلقائي يوفر:
- ✅ توفير الوقت والجهد
- ✅ تحديثات منتظمة للوظائف
- ✅ تجنب التكرار تلقائياً
- ✅ سهولة الاستخدام والإدارة
- ✅ قابلية التوسع لمواقع جديدة

للدعم أو الاستفسارات، راجع الكود أو اتصل بمطور النظام.

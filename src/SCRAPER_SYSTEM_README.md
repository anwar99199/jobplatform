# 🤖 نظام جلب الوظائف التلقائي - Job Scraper System

## 📋 نظرة عامة

نظام متقدم لجلب الوظائف تلقائياً من مواقع خارجية وإضافتها إلى منصة عُمان للوظائف دون أي تدخل يدوي.

### ✨ المميزات الرئيسية

- ✅ **جلب تلقائي**: استيراد الوظائف من مواقع خارجية بشكل تلقائي
- ✅ **تجنب التكرار**: فحص ذكي للوظائف المكررة
- ✅ **واجهة إدارية**: صفحة admin سهلة الاستخدام
- ✅ **جدولة مرنة**: دعم عدة طرق للجدولة التلقائية
- ✅ **إحصائيات مفصلة**: تقارير عن كل عملية جلب
- ✅ **قابل للتوسع**: سهولة إضافة مواقع جديدة

---

## 🏗️ البنية التقنية

### Backend Components

```
/supabase/functions/server/
├── index.tsx                 # Main server with /admin/scrape-jobs endpoint
└── job-scraper.tsx          # Web scraping logic
```

### Frontend Components

```
/pages/admin/
└── AdminScraperPage.tsx     # Admin UI for manual scraping

/utils/
└── adminApi.ts              # API functions (scrapeJobs)
```

### Database

```sql
-- jobs table (existing)
- id (uuid)
- title (text)
- description (text)
- application_url (text)
- date (date)
- created_at (timestamp)
```

---

## 🚀 كيفية الاستخدام

### 1️⃣ التشغيل اليدوي

**الخطوات:**
1. تسجيل الدخول كـ Admin
2. الذهاب إلى لوحة التحكم → "جلب الوظائف تلقائياً"
3. الضغط على زر "جلب الوظائف الآن"
4. انتظار اكتمال العملية (15-60 ثانية عادة)
5. مراجعة النتائج والإحصائيات

**النتيجة المتوقعة:**
```
الوظائف المستخرجة: 45
الوظائف المضافة: 12
الوظائف المكررة: 33
```

---

### 2️⃣ الجدولة التلقائية

#### خيار A: Cron-Job.org (موصى به للمبتدئين)

**المميزات:**
- 🆓 مجاني
- 🔧 سهل الإعداد
- 📊 لوحة تحكم بسيطة
- 📧 إشعارات بالبريد عند الفشل

**الخطوات:**

1. **التسجيل**
   - الذهاب إلى https://cron-job.org
   - إنشاء حساب مجاني

2. **إنشاء Cron Job**
   - الضغط على "Create Cronjob"
   - Title: `Scrape Jobs - Oman Jobs Platform`

3. **الإعدادات التفصيلية**

   **URL:**
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs
   ```

   **Request Method:** `POST`

   **Headers:**
   ```
   Content-Type: application/json
   X-Admin-Token: YOUR_ADMIN_TOKEN
   ```

   **Request Body (اختياري):**
   ```json
   {
     "sourceUrl": "https://jobsofoman.com/ar/index.php"
   }
   ```

4. **جدولة الوقت**
   
   اختر أحد الخيارات:
   - **يومياً الساعة 2 صباحاً**: `0 2 * * *`
   - **كل 6 ساعات**: `0 */6 * * *`
   - **مرتين يومياً (8 صباحاً و 8 مساءً)**: `0 8,20 * * *`
   - **كل 12 ساعة**: `0 */12 * * *`

5. **حفظ وتفعيل**
   - مراجعة الإعدادات
   - الضغط على "Create Cronjob"
   - التأكد من تفعيل الـ cronjob

---

#### خيار B: GitHub Actions (موصى به للمحترفين)

**المميزات:**
- 🆓 مجاني تماماً
- 🔐 أكثر أماناً (Secrets management)
- 📝 Version control
- 🔄 سهولة التحديث

**الخطوات:**

1. **إنشاء Repository**
   ```bash
   mkdir oman-jobs-automation
   cd oman-jobs-automation
   git init
   ```

2. **إنشاء Workflow File**
   
   أنشئ ملف: `.github/workflows/scrape-jobs.yml`

   ```yaml
   name: Auto Scrape Jobs
   
   on:
     schedule:
       # يعمل كل 6 ساعات
       - cron: '0 */6 * * *'
     
     # يمكن تشغيله يدوياً
     workflow_dispatch:
   
   jobs:
     scrape-jobs:
       runs-on: ubuntu-latest
       
       steps:
         - name: Scrape Jobs from JobsOfOman
           run: |
             response=$(curl -X POST \
               https://${{ secrets.SUPABASE_PROJECT_ID }}.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
               -H "Content-Type: application/json" \
               -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
               -H "X-Admin-Token: ${{ secrets.ADMIN_TOKEN }}" \
               -d '{"sourceUrl": "https://jobsofoman.com/ar/index.php"}' \
               -w "\n%{http_code}")
             
             echo "$response"
             http_code=$(echo "$response" | tail -n1)
             
             if [ "$http_code" -ne 200 ]; then
               echo "Error: HTTP $http_code"
               exit 1
             fi
         
         - name: Log Success
           if: success()
           run: echo "✅ Jobs scraped successfully at $(date)"
         
         - name: Log Failure
           if: failure()
           run: echo "❌ Job scraping failed at $(date)"
   ```

3. **إضافة GitHub Secrets**
   
   في Repository Settings → Secrets → Actions:
   
   - `SUPABASE_PROJECT_ID`: معرف مشروع Supabase
   - `SUPABASE_ANON_KEY`: المفتاح العام من Supabase
   - `ADMIN_TOKEN`: admin token من تسجيل الدخول

4. **Push إلى GitHub**
   ```bash
   git add .
   git commit -m "Add job scraping automation"
   git push origin main
   ```

5. **تفعيل Actions**
   - الذهاب إلى Actions tab
   - تفعيل workflows
   - (اختياري) تشغيل يدوي للاختبار: "Run workflow"

---

#### خيار C: Vercel Cron Jobs

**للمواقع المستضافة على Vercel:**

1. إنشاء ملف `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/scrape-jobs",
       "schedule": "0 */6 * * *"
     }]
   }
   ```

2. إنشاء API route في `/pages/api/scrape-jobs.ts`:
   ```typescript
   export default async function handler(req, res) {
     const response = await fetch(
       'https://YOUR_PROJECT.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs',
       {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'X-Admin-Token': process.env.ADMIN_TOKEN
         }
       }
     );
     const data = await response.json();
     res.json(data);
   }
   ```

---

## 🔧 التكوين المتقدم

### تخصيص Scraper

**إضافة موقع جديد:**

في `/supabase/functions/server/job-scraper.tsx`:

```typescript
export async function scrapeNewSite(): Promise<ScrapedJob[]> {
  const url = 'https://newsite.com/jobs';
  const jobs: ScrapedJob[] = [];
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0...'
      }
    });
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // استخراج الوظائف حسب بنية الموقع
    const jobElements = doc.querySelectorAll('.job-item');
    
    for (const el of jobElements) {
      jobs.push({
        title: el.querySelector('.title')?.textContent || '',
        description: el.querySelector('.desc')?.textContent || '',
        applicationUrl: el.querySelector('a')?.href || '',
        date: new Date().toISOString().split('T')[0],
        source: 'newsite.com'
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**تحديث `scrapeWebsite` function:**

```typescript
export async function scrapeWebsite(url: string): Promise<ScrapedJob[]> {
  if (url.includes('jobsofoman.com')) {
    return scrapeJobsOfOman();
  } else if (url.includes('newsite.com')) {
    return scrapeNewSite();
  }
  
  throw new Error(`Unsupported URL: ${url}`);
}
```

---

## 📊 المراقبة والتحليل

### مؤشرات الأداء (KPIs)

راقب هذه المؤشرات:

- **Success Rate**: نسبة العمليات الناجحة
- **Jobs Scraped**: إجمالي الوظائف المستخرجة
- **Jobs Added**: الوظائف الجديدة المضافة
- **Duplicate Rate**: نسبة الوظائف المكررة
- **Scraping Duration**: وقت كل عملية

### Logging

**في السيرفر:**
```typescript
console.log(`Starting scrape at ${new Date().toISOString()}`);
console.log(`Found ${jobs.length} jobs`);
console.log(`Added ${newJobs.length} new jobs`);
```

**في Frontend:**
```typescript
console.log('Scrape result:', result);
```

---

## 🐛 حل المشاكل

### المشاكل الشائعة

| المشكلة | السبب المحتمل | الحل |
|---------|---------------|------|
| No jobs found | تغيير في بنية HTML | تحديث selectors في job-scraper.tsx |
| All duplicates | لا وظائف جديدة | طبيعي، انتظر وقت أطول بين العمليات |
| Timeout error | الموقع بطيء | زيادة timeout أو إعادة المحاولة |
| 401 Unauthorized | Admin token خاطئ | التحقق من token |
| 500 Server Error | مشكلة في السيرفر | فحص console logs |

### Debug Mode

لتفعيل debug mode، أضف في `job-scraper.tsx`:

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('HTML length:', html.length);
  console.log('Job elements found:', jobElements.length);
  console.log('First job:', jobs[0]);
}
```

---

## 🔐 الأمان

### Best Practices

1. **Tokens**:
   - ✅ استخدم environment variables
   - ✅ لا تشارك tokens في الكود
   - ✅ غيّر tokens دورياً

2. **Rate Limiting**:
   - ✅ لا تجدول أكثر من كل 6 ساعات
   - ✅ احترم robots.txt
   - ✅ استخدم User-Agent واقعي

3. **Data Validation**:
   - ✅ تحقق من طول العنوان والوصف
   - ✅ تنظيف HTML tags
   - ✅ validate URLs

---

## 📈 التحسينات المستقبلية

### Roadmap

- [ ] دعم مواقع إضافية
- [ ] تحسين استخراج البيانات بـ AI
- [ ] إشعارات عند إضافة وظائف جديدة
- [ ] تصنيف تلقائي للوظائف
- [ ] API endpoint عام للمستخدمين
- [ ] Dashboard للإحصائيات التاريخية

---

## 📚 الموارد

### ملفات مهمة

- `JOB_SCRAPER_GUIDE.md`: دليل شامل مفصل
- `QUICK_START_SCRAPER.md`: دليل البدء السريع
- `/supabase/functions/server/job-scraper.tsx`: كود الـ scraper
- `/pages/admin/AdminScraperPage.tsx`: واجهة Admin

### روابط مفيدة

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno DOM Parser](https://deno.land/x/deno_dom)
- [Cron Expression Generator](https://crontab.guru/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 💡 نصائح الاستخدام

1. **ابدأ بالاختبار اليدوي** قبل الجدولة التلقائية
2. **راجع النتائج** بعد أول عملية جلب
3. **احذف الوظائف غير المناسبة** يدوياً
4. **جدول العملية في أوقات هادئة** (منتصف الليل)
5. **راقب الإحصائيات** أسبوعياً

---

## 📞 الدعم

للمساعدة:
1. راجع ملفات التوثيق
2. افحص console logs
3. تحقق من إعدادات Supabase
4. اتصل بمطور النظام

---

## 📝 الترخيص

هذا النظام جزء من منصة عُمان للوظائف وخاضع لنفس الترخيص.

---

**آخر تحديث:** ديسمبر 2024  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للاستخدام

---

## ✅ Checklist للإعداد الأولي

- [ ] اختبار التشغيل اليدوي
- [ ] التحقق من نتائج أول عملية جلب
- [ ] مراجعة جودة البيانات المستخرجة
- [ ] إعداد الجدولة التلقائية
- [ ] إضافة monitoring/alerts
- [ ] توثيق أي تخصيصات

🎉 **مبروك! نظام جلب الوظائف التلقائي جاهز للعمل!**

# أوامر cURL للاختبار السريع
# Quick cURL Commands for Testing

## 📝 ملاحظة مهمة

**استبدل القيم التالية قبل التشغيل:**
- `YOUR_PROJECT_ID`: معرف مشروع Supabase الخاص بك
- `YOUR_ADMIN_TOKEN`: admin token من تسجيل الدخول
- `YOUR_SUPABASE_ANON_KEY`: المفتاح العام من Supabase

---

## 🚀 الأوامر الأساسية

### 1. جلب الوظائف (الأمر الأساسي)

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

### 2. جلب الوظائف مع تحديد URL

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -d '{"sourceUrl": "https://jobsofoman.com/ar/index.php"}'
```

### 3. جلب مع عرض تفصيلي (Verbose)

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -v
```

### 4. جلب وحفظ النتيجة في ملف

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -o scrape_result.json
```

---

## 🔍 أوامر الاختبار

### 5. اختبار مع Authorization Bearer

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

### 6. اختبار مع قياس الوقت

```bash
time curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

### 7. اختبار مع عرض HTTP Status Code فقط

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -o /dev/null -s
```

### 8. اختبار مع Headers كاملة

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -H "User-Agent: Mozilla/5.0" \
  -i
```

---

## 📊 أوامر للمراقبة

### 9. جلب مع استخراج عدد الوظائف فقط (Linux/Mac)

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -s | jq '.jobsAdded'
```

### 10. جلب مع استخراج رسالة النجاح (Linux/Mac)

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -s | jq '.message'
```

### 11. جلب مع عرض JSON منسق (Linux/Mac)

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -s | jq '.'
```

---

## 🔄 أوامر للجدولة

### 12. سكريبت Shell بسيط للجدولة

```bash
#!/bin/bash
# save as: scrape_jobs.sh

PROJECT_ID="YOUR_PROJECT_ID"
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"

echo "Starting job scraping at $(date)"

response=$(curl -X POST \
  "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: ${ADMIN_TOKEN}" \
  -s)

echo "Response: $response"
echo "Completed at $(date)"
```

**لتشغيله:**
```bash
chmod +x scrape_jobs.sh
./scrape_jobs.sh
```

### 13. سكريبت مع Logging

```bash
#!/bin/bash
# save as: scrape_jobs_with_log.sh

PROJECT_ID="YOUR_PROJECT_ID"
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
LOG_FILE="scrape_jobs.log"

echo "=== Starting job scraping at $(date) ===" | tee -a $LOG_FILE

response=$(curl -X POST \
  "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: ${ADMIN_TOKEN}" \
  -s)

echo "Response: $response" | tee -a $LOG_FILE
echo "=== Completed at $(date) ===" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
```

---

## 🐛 أوامر Debug

### 14. اختبار الاتصال بـ Supabase

```bash
curl -X GET \
  https://YOUR_PROJECT_ID.supabase.co/rest/v1/ \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -v
```

### 15. اختبار Health Check (إذا كان موجود)

```bash
curl -X GET \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/health \
  -v
```

### 16. جلب مع عرض جميع Headers

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -D -
```

---

## 📱 أوامر للهواتف (Termux)

### 17. للاستخدام في Termux على Android

```bash
pkg install curl jq
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -s | jq '.'
```

---

## 🔐 أوامر مع Environment Variables (أكثر أماناً)

### 18. استخدام Environment Variables

```bash
# أولاً، احفظ المتغيرات
export SUPABASE_PROJECT_ID="YOUR_PROJECT_ID"
export ADMIN_TOKEN="YOUR_ADMIN_TOKEN"

# ثم استخدمها
curl -X POST \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: ${ADMIN_TOKEN}"
```

### 19. استخدام ملف .env

```bash
# أنشئ ملف .env
cat > .env << EOF
SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
ADMIN_TOKEN=YOUR_ADMIN_TOKEN
EOF

# أنشئ سكريبت
cat > scrape.sh << 'EOF'
#!/bin/bash
source .env
curl -X POST \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: ${ADMIN_TOKEN}"
EOF

chmod +x scrape.sh
./scrape.sh
```

---

## 📧 أوامر مع إشعارات

### 20. جلب مع إرسال إشعار بالبريد (Linux)

```bash
#!/bin/bash
PROJECT_ID="YOUR_PROJECT_ID"
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
EMAIL="your@email.com"

response=$(curl -X POST \
  "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: ${ADMIN_TOKEN}" \
  -s)

echo "Job Scraping Results:\n$response" | mail -s "Job Scraper Results" $EMAIL
```

---

## 🔁 أوامر Loop للاختبار المتكرر

### 21. تشغيل كل 5 دقائق (للاختبار فقط)

```bash
#!/bin/bash
while true; do
  echo "Running at $(date)"
  curl -X POST \
    https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \
    -H "Content-Type: application/json" \
    -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
    -s | jq '.message'
  
  echo "Waiting 5 minutes..."
  sleep 300
done
```

---

## 🎯 أوامر سريعة للنسخ المباشر

### نسخة مبسطة - جاهزة للنسخ:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs -H "Content-Type: application/json" -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

### نسخة مع تنسيق JSON:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs -H "Content-Type: application/json" -H "X-Admin-Token: YOUR_ADMIN_TOKEN" -s | python -m json.tool
```

---

## 💡 نصائح الاستخدام

1. **احفظ tokens بشكل آمن**: لا تشارك admin token في أكواد عامة
2. **استخدم environment variables**: أكثر أماناً من hardcoding
3. **راقب الـ rate limits**: لا تشغل أكثر من اللازم
4. **احفظ logs**: للمراجعة والـ debugging
5. **اختبر أولاً**: جرب الأمر يدوياً قبل الجدولة

---

## 🔧 تثبيت الأدوات المساعدة

### تثبيت jq (لمعالجة JSON):

**Ubuntu/Debian:**
```bash
sudo apt-get install jq
```

**macOS:**
```bash
brew install jq
```

**Windows (PowerShell):**
```powershell
choco install jq
```

---

## 📚 الموارد

- [cURL Documentation](https://curl.se/docs/)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)

---

**ملاحظة:** تذكر دائماً استبدال القيم الافتراضية بقيمك الحقيقية قبل التشغيل!

🎉 **استمتع باستخدام نظام جلب الوظائف!**

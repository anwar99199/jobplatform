# 🔧 حل مشكلة OpenAI API

## ❌ الخطأ الحالي:
```
Error converting CV: Error: خدمة الذكاء الاصطناعي غير متاحة حالياً
```

---

## 🔍 التشخيص

### الخطوة 1: التحقق من وجود API Key

```bash
# في Supabase Dashboard:
1. اذهب إلى: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions
2. تحقق من Secrets (Environment Variables)
3. تأكد من وجود: OPENAI_API_KEY
```

### الخطوة 2: اختبار API Key

بعد نشر السيرفر، اختبر الـ API key:

```bash
# Option 1: Via Browser
افتح:
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/test-openai

# Option 2: Via curl
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/test-openai
```

**النتائج المتوقعة:**

✅ **إذا كان المفتاح صحيح:**
```json
{
  "success": true,
  "hasKey": true,
  "keyLength": 51,
  "keyPrefix": "sk-proj...",
  "status": 200,
  "response": "API key is valid"
}
```

❌ **إذا كان المفتاح غير موجود:**
```json
{
  "success": false,
  "error": "OPENAI_API_KEY not found",
  "hasKey": false
}
```

❌ **إذا كان المفتاح غير صالح:**
```json
{
  "success": false,
  "hasKey": true,
  "status": 401,
  "response": "Incorrect API key provided..."
}
```

❌ **إذا نفدت الحصة (quota):**
```json
{
  "success": false,
  "status": 429,
  "response": "You exceeded your current quota..."
}
```

---

## ✅ الحلول

### الحل 1: إضافة/تحديث API Key

#### 1.1 احصل على API Key من OpenAI:
```
1. اذهب إلى: https://platform.openai.com/api-keys
2. سجل الدخول
3. اضغط "+ Create new secret key"
4. انسخ المفتاح (يبدأ بـ sk-proj-...)
```

#### 1.2 أضف المفتاح في Supabase:
```
1. اذهب إلى Supabase Dashboard
2. Project Settings → Edge Functions → Secrets
3. أضف/حدّث: OPENAI_API_KEY
4. Value: sk-proj-xxxxxxxxxxxx...
5. اضغط Save
```

#### 1.3 أعد نشر السيرفر:
```bash
supabase functions deploy make-server-8a20c00b
```

---

### الحل 2: إعادة شحن حساب OpenAI (إذا نفدت الحصة)

```
1. اذهب إلى: https://platform.openai.com/account/billing
2. تحقق من الرصيد (Balance)
3. إذا كان $0.00، أضف رصيد:
   - Billing → Add to credit balance
   - أضف على الأقل $5
```

**ملاحظة:** OpenAI يتطلب إضافة رصيد لاستخدام API بعد انتهاء الـ free trial.

---

### الحل 3: استخدام مفتاح بديل مؤقت

إذا لم يكن لديك مفتاح صالح، يمكنك استخدام **نص ثابت** مؤقتاً للاختبار:

```typescript
// في /supabase/functions/server/index.tsx
// بدلاً من استدعاء OpenAI:

if (!openaiApiKey || openaiApiKey === 'DEMO_MODE') {
  // وضع العرض التجريبي
  const demoConvertedText = `
===================
السيرة الذاتية المحولة لنظام ATS
===================

[ملاحظة: هذه نسخة تجريبية. للحصول على تحويل حقيقي، يرجى إضافة OpenAI API Key]

الملخص المهني:
${cvText.substring(0, 500)}...

المهارات:
• مهارة 1
• مهارة 2
• مهارة 3

الخبرات العملية:
• منصب 1
• منصب 2

التعليم:
• درجة علمية

---
ملاحظة: هذا نص تجريبي فقط. أضف OpenAI API Key للحصول على تحويل حقيقي.
  `;

  return c.json({
    success: true,
    convertedText: demoConvertedText.trim(),
    demo: true
  });
}
```

---

## 🐛 التشخيص المتقدم

### مراقبة Logs:

```bash
# راقب الـ logs مباشرة
supabase functions logs make-server-8a20c00b --tail

# ابحث عن:
# ✅ "OPENAI_API_KEY found"
# أو
# ❌ "OPENAI_API_KEY is not configured"
```

### ما يجب أن تراه في Logs:

#### ✅ نجاح:
```
✅ OPENAI_API_KEY found
📝 CV Text length: 2500
🌐 Calling OpenAI API...
📊 Model: gpt-4o-mini
📥 OpenAI Response status: 200
📊 OpenAI response data: {...}
✅ Conversion successful!
```

#### ❌ فشل - مفتاح مفقود:
```
❌ OPENAI_API_KEY is not configured
```

#### ❌ فشل - مفتاح غير صالح:
```
✅ OPENAI_API_KEY found
🌐 Calling OpenAI API...
📥 OpenAI Response status: 401
❌ OpenAI API error response: {"error":{"message":"Incorrect API key..."}}
```

#### ❌ فشل - quota:
```
✅ OPENAI_API_KEY found
🌐 Calling OpenAI API...
📥 OpenAI Response status: 429
❌ OpenAI API error response: {"error":{"type":"insufficient_quota"...}}
```

---

## 📋 Checklist السريع

- [ ] **1. نشر السيرفر المحدث:**
  ```bash
  supabase functions deploy make-server-8a20c00b
  ```

- [ ] **2. اختبار test endpoint:**
  ```
  افتح: https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/test-openai
  ```

- [ ] **3. تحقق من النتيجة:**
  - ✅ إذا `success: true` → المفتاح يعمل
  - ❌ إذا `hasKey: false` → أضف المفتاح
  - ❌ إذا `status: 401` → المفتاح غير صالح
  - ❌ إذا `status: 429` → نفدت الحصة

- [ ] **4. راقب الـ logs:**
  ```bash
  supabase functions logs make-server-8a20c00b --tail
  ```

- [ ] **5. جرّب ATS converter:**
  - افتح `/premium/ats-converter`
  - ارفع ملف DOCX
  - راقب الـ logs

---

## 🚀 الخطوة التالية

```bash
# 1. نشر التحديثات
supabase functions deploy make-server-8a20c00b

# 2. اختبر test endpoint
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/test-openai

# 3. إذا كان الاختبار ناجح، جرّب الميزة الكاملة!
```

---

## 💡 نصيحة

**للتطوير المحلي:**
```bash
# أنشئ ملف .env في /supabase/functions/server/
echo "OPENAI_API_KEY=sk-proj-xxxxx" > .env

# أو استخدم:
export OPENAI_API_KEY=sk-proj-xxxxx
```

**للإنتاج:**
استخدم Supabase Secrets فقط (لا تضع المفتاح في الكود أبداً!)

---

## 📞 الدعم

إذا استمرت المشكلة بعد جميع الخطوات:

1. شارك نتيجة test endpoint
2. شارك آخر 50 سطر من الـ logs
3. تحقق من:
   - حالة حساب OpenAI
   - الرصيد المتبقي
   - تاريخ انتهاء المفتاح

---

## ✅ الخلاصة

**أكثر الأسباب شيوعاً:**

| السبب | الاحتمال | الحل |
|------|---------|------|
| مفتاح غير موجود | 60% | أضف OPENAI_API_KEY |
| حصة منتهية | 30% | أعد شحن الحساب |
| مفتاح غير صالح | 10% | احصل على مفتاح جديد |

**جرّب test endpoint أولاً لمعرفة السبب الدقيق! 🎯**

# 🚀 دليل ربط Amwal Pay - خطوات مفصلة

## ✅ الكود جاهز 100%! - فقط أضف البيانات

تم تعديل الكود ليدعم بيانات Amwal Pay الحقيقية:
- ✅ MID (Merchant ID)
- ✅ TID (Terminal ID)  
- ✅ SECURE HASH
- ✅ UAT Environment Support
- ✅ Payment Success Page جاهزة
- ✅ Webhook Endpoint جاهز

---

## 📍 الخطوة 1: إضافة البيانات في Supabase (الأهم!)

### 🔗 افتح هذا الرابط:
👉 **https://supabase.com/dashboard/project/jvfaelfsmpigdeiypuic/settings/secrets**

### 📝 أضف هذه المتغيرات الأربعة:

اضغط "Add secret" لكل واحد منهم:

**1️⃣ المتغير الأول:**
```
Name: AMWAL_MERCHANT_ID
Value: [ضع قيمة MID هنا - مثال: 12345678]
```

**2️⃣ المتغير الثاني:**
```
Name: AMWAL_TERMINAL_ID
Value: [ضع قيمة TID هنا - مثال: 87654321]
```

**3️⃣ المتغير الثالث:**
```
Name: AMWAL_SECURE_HASH
Value: [ضع قيمة SECURE HASH هنا - مثال: abc123def456]
```

**4️⃣ المتغير الرابع:**
```
Name: AMWAL_ENVIRONMENT
Value: UAT
```

⚠️ **ملاحظة مهمة**: بعد إضافة هذه المتغيرات، يجب إعادة نشر السيرفر (الخطوة 2)!

---

## 📍 الخطوة 2: إعادة نشر Edge Function

بعد إضافة البيانات، يجب إعادة نشر السيرفر:

### الطريقة 1: عبر Dashboard (الأسهل)
1. اذهب إلى: https://supabase.com/dashboard/project/jvfaelfsmpigdeiypuic/functions
2. ابحث عن Function اسمها `server`
3. اضغط على Deploy/Redeploy

### الطريقة 2: عبر CLI
```bash
supabase functions deploy server
```

---

## 📍 الخطوة 3: تكوين Callback URLs في Amwal Dashboard

**مهم جداً**: يجب إضافة هذه الروابط في حساب Amwal Pay الخاص بك:

### Success URL (بعد نجاح الدفع):
```
https://your-domain.com/payment/success
```

### Failure URL (بعد فشل الدفع):
```
https://your-domain.com/premium?status=failed
```

### Cancel URL (عند الإلغاء):
```
https://your-domain.com/premium?status=cancelled
```

### Webhook URL (الأهم - للإشعارات التلقائية):
```
https://jvfaelfsmpigdeiypuic.supabase.co/functions/v1/make-server-8a20c00b/payment/webhook
```

---

## 📍 الخطوة 4: اختبار النظام

### 1. جرب إنشاء اشتراك:
- اذهب إلى صفحة Premium في موقعك
- اختر أي باقة (نصف سنوي أو سنوي)
- اضغط "اختر هذه الباقة"
- يجب أن يتم توجيهك لصفحة دفع Amwal Pay

### 2. راقب الـ Logs:
افتح Supabase Logs لمراقبة العملية:
👉 https://supabase.com/dashboard/project/jvfaelfsmpigdeiypuic/functions/server/logs

ستشاهد:
```
Creating Amwal payment with: {...}
Amwal Pay response: {...}
```

### 3. أكمل الدفع:
- استخدم بيانات بطاقة اختبار من Amwal Pay
- أكمل العملية
- يجب أن يتم تفعيل اشتراكك تلقائياً

---

## 🔍 استكشاف الأخطاء

### خطأ: "نظام الدفع غير مكتمل الإعداد"
✅ **الحل**: تأكد من إضافة الـ 4 Environment Variables في Supabase وأعد نشر السيرفر

### خطأ من Amwal Pay API
✅ **الحل**: 
1. تحقق من Logs في Supabase
2. تأكد من صحة MID, TID, SECURE HASH
3. تأكد من أن AMWAL_ENVIRONMENT = UAT للاختبار

### الدفع نجح لكن الاشتراك لم يُفعّل
✅ **الحل**: 
1. تأكد من إضافة Webhook URL في Amwal Dashboard
2. راقب logs لمعرفة إذا وصل إشعار الـ webhook

---

## 🎯 معلومات تقنية

### كيف يعمل النظام؟

1. **المستخدم يختار باقة** → Frontend يرسل request لـ `/payment/create-session`

2. **السيرفر ينشئ Secure Hash**:
   ```
   SHA256(MID + TID + Amount + Currency + TransactionRef + SecureHash)
   ```

3. **السيرفر يرسل طلب لـ Amwal Pay**:
   ```
   POST https://uat.amwal.tech/payments/create
   ```

4. **Amwal ترد برابط الدفع** → المستخدم ينتقل لصفحة الدفع

5. **بعد الدفع**:
   - Amwal ترسل webhook notification
   - السيرفر يتحقق ويفعّل الاشتراك

6. **المستخدم يُوجّه لصفحة النجاح**

---

## 📊 Endpoints الجاهزة

### 1. إنشاء جلسة دفع
```
POST /make-server-8a20c00b/payment/create-session
Body: { planType, userId, userEmail, userName }
```

### 2. التحقق من الدفع
```
POST /make-server-8a20c00b/payment/verify
Body: { transactionRef }
```

### 3. Webhook (تلقائي من Amwal)
```
POST /make-server-8a20c00b/payment/webhook
Body: { event_type, merchant_reference, payment_status, ... }
```

---

## 🔐 الأمان

✅ **تم تطبيق**:
- Secure Hash لكل عملية
- تخزين آمن للمفاتيح في Environment Variables
- تحقق من حالة الدفع قبل التفعيل
- منع التكرار (duplicate processing prevention)

---

## 📞 الدعم الفني

إذا واجهت مشاكل:

1. **تحقق من Logs**: 
   https://supabase.com/dashboard/project/jvfaelfsmpigdeiypuic/functions/server/logs

2. **تواصل مع Amwal Pay**:
   - البريد: support@amwal.tech
   - الهاتف: [رقم الدعم الفني]

3. **راجع API Documentation**:
   https://docs.amwal.tech

---

## ✅ Checklist - تأكد من:

- [ ] أضفت AMWAL_MERCHANT_ID
- [ ] أضفت AMWAL_TERMINAL_ID  
- [ ] أضفت AMWAL_SECURE_HASH
- [ ] أضفت AMWAL_ENVIRONMENT = UAT
- [ ] أعدت نشر السيرفر (Redeploy)
- [ ] أضفت Webhook URL في Amwal Dashboard
- [ ] أضفت Success/Failure/Cancel URLs
- [ ] اختبرت عملية دفع كاملة
- [ ] تأكدت من تفعيل الاشتراك

---

## 🎉 بعد الانتهاء من UAT

عندما تكون جاهزاً للانتقال للإنتاج (PRODUCTION):

1. احصل على بيانات Production من Amwal Pay
2. غيّر Environment Variables:
   ```
   AMWAL_MERCHANT_ID = [Production MID]
   AMWAL_TERMINAL_ID = [Production TID]
   AMWAL_SECURE_HASH = [Production Hash]
   AMWAL_ENVIRONMENT = PRODUCTION
   ```
3. أعد نشر السيرفر
4. اختبر بمبلغ صغير حقيقي

---

**الكود جاهز 100%! 🚀**
**فقط أضف البيانات واختبر! ✨**

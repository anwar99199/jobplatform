# ✅ تم إعداد Amwal Pay SmartBox بنجاح!

## 📋 ملخص التنفيذ

تم إعداد نظام الدفع **Amwal Pay SmartBox** بالكامل في منصة عُمان للوظائف. النظام جاهز للعمل ويحتاج فقط إلى **بيانات Amwal Pay** من طرفك.

---

## ✨ ما تم تنفيذه

### 1️⃣ **تحميل SmartBox Script** ✅
- تم إضافة سكريبت SmartBox.js في `/App.tsx`
- يتم تحميله تلقائياً عند تشغيل التطبيق
- **بيئة UAT (الاختبار)**: `https://test.amwalpg.com:7443/js/SmartBox.js?v=1.1`

```typescript
// في App.tsx - يتم تحميل السكريبت تلقائياً
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://test.amwalpg.com:7443/js/SmartBox.js?v=1.1';
  script.async = true;
  document.body.appendChild(script);
}, []);
```

### 2️⃣ **Backend - إعداد SmartBox Configuration** ✅
تم إنشاء endpoint جديد في السيرفر: `/payment/prepare-smartbox`

**المهام:**
- ✅ قراءة بيانات Amwal Pay من Environment Variables
- ✅ حساب **SecureHash** باستخدام SHA-256
- ✅ إنشاء transaction reference فريد
- ✅ حفظ المعاملة في قاعدة البيانات
- ✅ إرجاع إعدادات SmartBox كاملة

**الصيغة المستخدمة لحساب SecureHash:**
```
MID + TID + CurrencyId + AmountTrxn + MerchantReference + TrxDateTime + SecureHashKey
```

**مثال:**
```
MERCHANT123TERMINAL45651210.000OMANJOBS_user123_1701234567892024-11-27 14:30:00YOUR_SECRET_KEY
```

ثم يتم تحويلها إلى SHA-256 hash.

### 3️⃣ **Frontend - Utility للتكامل مع SmartBox** ✅
تم إنشاء ملف `/utils/amwal-smartbox.ts` يحتوي على:

**الوظائف الرئيسية:**
- ✅ `initializeSmartBox()` - تهيئة SmartBox مع callbacks
- ✅ `isSmartBoxLoaded()` - التحقق من تحميل السكريبت
- ✅ `waitForSmartBox()` - انتظار تحميل السكريبت

**المميزات:**
- معالجة callbacks: نجاح، فشل، إلغاء
- دعم Sandbox Mode
- TypeScript types كاملة

### 4️⃣ **تحديث صفحة Premium** ✅
تم تحديث `/pages/PremiumPage.tsx` لاستخدام SmartBox:

**التحسينات:**
- ✅ استخدام SmartBox Popup بدلاً من redirect
- ✅ معالجة callbacks للنجاح والفشل
- ✅ التحقق من الدفع تلقائياً
- ✅ تفعيل الاشتراك فوراً بعد الدفع
- ✅ دعم وضع Sandbox

---

## 🔑 ما يجب عليك فعله الآن

### الخطوة 1: الحصول على بيانات Amwal Pay

يجب عليك التسجيل في **Amwal Pay** والحصول على البيانات التالية:

#### للتجربة (UAT/Test Environment):
1. **MERCHANT_ID** (MID) - معرف التاجر للاختبار
2. **TERMINAL_ID** (TID) - معرف الطرفية للاختبار
3. **SECURE_HASH** - المفتاح السري للاختبار

#### للإنتاج (Production Environment):
1. **MERCHANT_ID** (MID) - معرف التاجر الحقيقي
2. **TERMINAL_ID** (TID) - معرف الطرفية الحقيقي
3. **SECURE_HASH** - المفتاح السري الحقيقي

---

### الخطوة 2: إضافة البيانات في Supabase

#### الطريقة الأولى: عبر Supabase Dashboard (الأسهل)

1. اذهب إلى: 
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/secrets
   ```

2. أضف المتغيرات التالية:

   **للاختبار (UAT):**
   ```
   AMWAL_MERCHANT_ID = YOUR_TEST_MERCHANT_ID
   AMWAL_TERMINAL_ID = YOUR_TEST_TERMINAL_ID
   AMWAL_SECURE_HASH = YOUR_TEST_SECURE_HASH
   AMWAL_ENVIRONMENT = UAT
   AMWAL_SANDBOX_MODE = false
   ```

   **للإنتاج (Production):**
   ```
   AMWAL_MERCHANT_ID = YOUR_PRODUCTION_MERCHANT_ID
   AMWAL_TERMINAL_ID = YOUR_PRODUCTION_TERMINAL_ID
   AMWAL_SECURE_HASH = YOUR_PRODUCTION_SECURE_HASH
   AMWAL_ENVIRONMENT = PRODUCTION
   AMWAL_SANDBOX_MODE = false
   ```

3. احفظ التغييرات

4. **أعد نشر Edge Functions** (مهم جداً!)

#### الطريقة الثانية: عبر Supabase CLI

```bash
# للاختبار (UAT)
supabase secrets set AMWAL_MERCHANT_ID="YOUR_TEST_MERCHANT_ID"
supabase secrets set AMWAL_TERMINAL_ID="YOUR_TEST_TERMINAL_ID"
supabase secrets set AMWAL_SECURE_HASH="YOUR_TEST_SECURE_HASH"
supabase secrets set AMWAL_ENVIRONMENT="UAT"
supabase secrets set AMWAL_SANDBOX_MODE="false"

# للإنتاج (Production)
supabase secrets set AMWAL_MERCHANT_ID="YOUR_PRODUCTION_MERCHANT_ID"
supabase secrets set AMWAL_TERMINAL_ID="YOUR_PRODUCTION_TERMINAL_ID"
supabase secrets set AMWAL_SECURE_HASH="YOUR_PRODUCTION_SECURE_HASH"
supabase secrets set AMWAL_ENVIRONMENT="PRODUCTION"
supabase secrets set AMWAL_SANDBOX_MODE="false"
```

---

### الخطوة 3: التحديث للإنتاج (عند الجاهزية)

عندما تكون جاهزاً للانتقال للإنتاج:

1. **غيّر سكريبت SmartBox في `/App.tsx`:**

   من (UAT):
   ```typescript
   script.src = 'https://test.amwalpg.com:7443/js/SmartBox.js?v=1.1';
   ```

   إلى (Production):
   ```typescript
   script.src = 'https://amwalpg.com/js/SmartBox.js?v=1.1';
   ```

2. **غيّر Environment Variable:**
   ```
   AMWAL_ENVIRONMENT = PRODUCTION
   ```

3. **أعد نشر التطبيق**

---

## 🎭 وضع Sandbox (الوضع الحالي)

حالياً، النظام يعمل في **Sandbox Mode**:
- ✅ لا يحتاج بيانات Amwal Pay الحقيقية
- ✅ لا يتم خصم أموال حقيقية
- ✅ مثالي للتجربة والتطوير
- ✅ يعرض صفحة دفع تجريبية

**للتحويل إلى وضع الدفع الحقيقي:**
1. أضف جميع بيانات Amwal Pay (كما في الخطوة 2)
2. اضبط `AMWAL_SANDBOX_MODE=false`
3. أعد نشر Edge Functions

---

## 🔐 SecureHash - كيفية الحساب (حسب الوثائق الرسمية)

يتم حساب SecureHash في السيرفر فقط (لأمان المفتاح السري).

**الصيغة الصحيحة:**
```
Amount=VALUE&CurrencyId=512&MerchantId=VALUE&MerchantReference=VALUE&RequestDateTime=VALUE&SessionToken=&TerminalId=VALUE
```

**مثال عملي:**
```javascript
// Input Parameters (sorted alphabetically)
Amount: "10"
CurrencyId: "512"
MerchantId: "48804"
MerchantReference: "OMANJOBS_user123_1701234567"
RequestDateTime: "2024-12-31T15:27:10.361969Z"
SessionToken: "" (empty for non-recurring)
TerminalId: "113176"

// String to hash (sorted alphabetically)
const hashString = "Amount=10&CurrencyId=512&MerchantId=48804&MerchantReference=OMANJOBS_user123_1701234567&RequestDateTime=2024-12-31T15:27:10.361969Z&SessionToken=&TerminalId=113176";

// HMAC-SHA256 with HEX key converted to binary
const secureHash = HMAC_SHA256(hashString, hexToBytes(SecureHashKey)).toUpperCase();
```

**ملاحظات مهمة:**
- ✅ يتم حساب الـ hash في **Backend فقط**
- ✅ **لا يظهر** SecureHashKey في Frontend أبداً
- ✅ يستخدم **HMAC-SHA256** وليس SHA-256 عادي
- ✅ المفتاح السري بصيغة **HEX** ويجب تحويله إلى Binary
- ✅ المعاملات **مرتبة أبجدياً** (alphabetically)
- ✅ Amount بدون أرقام عشرية: `10` وليس `10.000`
- ✅ CurrencyId دائماً `512` للريال العماني
- ✅ RequestDateTime بصيغة ISO: `YYYY-MM-DDTHH:MM:SS.FFFFFFZ`

---

## 📊 تدفق العمل الكامل

### عند الضغط على "اشترك الآن":

1. **Frontend:**
   - ✅ التحقق من تسجيل الدخول
   - ✅ انتظار تحميل SmartBox script
   - ✅ استدعاء `/payment/prepare-smartbox`

2. **Backend:**
   - ✅ التحقق من بيانات Amwal Pay
   - ✅ إنشاء transaction reference فريد
   - ✅ حساب SecureHash
   - ✅ حفظ المعاملة في DB
   - ✅ إرجاع configuration كاملة

3. **Frontend:**
   - ✅ تكوين SmartBox.Checkout
   - ✅ عرض نافذة الدفع (Popup)

4. **عند نجاح الدفع:**
   - ✅ استدعاء `completeCallback`
   - ✅ إرسال طلب `/payment/verify`
   - ✅ تفعيل الاشتراك في DB
   - ✅ التوجيه لصفحة النجاح

5. **عند فشل الدفع:**
   - ✅ استدعاء `errorCallback`
   - ✅ عرض رسالة الخطأ

6. **عند الإلغاء:**
   - ✅ استدعاء `cancelCallback`
   - ✅ عرض رسالة الإلغاء

---

## 🧪 الاختبار

### في وضع Sandbox (الحالي):
1. اذهب إلى صفحة Premium
2. اضغط "اشترك الآن"
3. ستظهر صفحة دفع تجريبية
4. أكمل العملية (لن يتم خصم أموال)
5. سيتم تفعيل الاشتراك تلقائياً

### بعد إضافة بيانات Amwal Pay الحقيقية:
1. اذهب إلى صفحة Premium
2. اضغط "اشترك الآن"
3. ستظهر نافذة Amwal Pay الحقيقية (Popup)
4. أدخل بيانات البطاقة
5. أكمل الدفع
6. سيتم التحقق وتفعيل الاشتراك تلقائياً

---

## ⚙️ إعدادات SmartBox المستخدمة

```typescript
{
  MID: "YOUR_MERCHANT_ID",
  TID: "YOUR_TERMINAL_ID",
  CurrencyId: 512,                    // OMR (Omani Rial)
  AmountTrxn: 10.000,                 // المبلغ (10 ريال للسنوي، 6 للنصف سنوي)
  MerchantReference: "OMANJOBS_...",  // Reference فريد
  LanguageId: 'ar',                   // العربية
  PaymentViewType: 1,                 // 1 = Popup (نافذة منبثقة)
  TrxDateTime: "2024-11-27 14:30:00", // تاريخ ووقت المعاملة
  SessionToken: null,                 // للدفعات المتكررة (غير مستخدم)
  ContactInfoType: 2,                 // 2 = Email only
  SecureHash: "CALCULATED_HASH",      // محسوب في Backend
  completeCallback: function(data) { ... },
  errorCallback: function(data) { ... },
  cancelCallback: function() { ... }
}
```

---

## 📝 متغيرات البيئة المطلوبة

| المتغير | الوصف | مثال |
|--------|-------|------|
| `AMWAL_MERCHANT_ID` | معرف التاجر | `MERCHANT123` |
| `AMWAL_TERMINAL_ID` | معرف الطرفية | `TERMINAL456` |
| `AMWAL_SECURE_HASH` | المفتاح السري لحساب Hash | `your_secret_key` |
| `AMWAL_ENVIRONMENT` | البيئة | `UAT` أو `PRODUCTION` |
| `AMWAL_SANDBOX_MODE` | وضع التجربة | `true` أو `false` |

---

## ✅ Checklist - قبل الإطلاق

### للاختبار (UAT):
- [ ] سجلت في Amwal Pay
- [ ] حصلت على بيانات UAT (MID, TID, SECURE_HASH)
- [ ] أضفت البيانات في Supabase
- [ ] اضبطت `AMWAL_ENVIRONMENT=UAT`
- [ ] اضبطت `AMWAL_SANDBOX_MODE=false`
- [ ] أعدت نشر Edge Functions
- [ ] اختبرت عملية دفع تجريبية
- [ ] تحققت من تفعيل الاشتراك

### للإنتاج (Production):
- [ ] حصلت على بيانات Production (MID, TID, SECURE_HASH)
- [ ] حدّثت البيانات في Supabase
- [ ] غيّرت السكريبت إلى Production URL
- [ ] اضبطت `AMWAL_ENVIRONMENT=PRODUCTION`
- [ ] اختبرت عملية دفع حقيقية صغيرة
- [ ] تحققت من وصول الأموال
- [ ] تحققت من تفعيل الاشتراك تلقائياً

---

## 🆘 استكشاف الأخطاء

### المشكلة: "نظام الدفع غير محمّل"
**الحل:**
- تحقق من تحميل SmartBox.js في Console
- افتح Console وابحث عن: `✅ Amwal Pay SmartBox script loaded successfully`

### المشكلة: "نظام الدفع غير مكتمل الإعداد"
**الحل:**
- تأكد من إضافة جميع Environment Variables
- تأكد من إعادة نشر Edge Functions
- تحقق من Logs في Supabase

### المشكلة: "SecureHash غير صحيح"
**الحل:**
- تحقق من صيغة حساب Hash
- تأكد من تطابق البيانات مع Amwal Pay
- تحقق من SECURE_HASH الصحيح

### المشكلة: نافذة الدفع لا تظهر
**الحل:**
- افتح Console وتحقق من الأخطاء
- تأكد من تحميل SmartBox.js
- تحقق من PaymentViewType (يجب أن يكون 1 للـ Popup)

---

## 📞 الدعم

- **وثائق Amwal Pay:** [https://docs.amwal.tech](https://docs.amwal.tech)
- **دعم Amwal Pay:** support@amwal.tech
- **Supabase Logs:** Dashboard → Functions → server → Logs

---

## 🎉 خلاصة

✅ **النظام جاهز تماماً!**

كل ما تحتاجه الآن هو:
1. ✅ الحصول على بيانات Amwal Pay (MID, TID, SECURE_HASH)
2. ✅ إضافتها في Supabase Environment Variables
3. ✅ إعادة نشر Edge Functions
4. ✅ الاختبار!

**الكود كامل ومجهز - فقط أضف المفاتيح!** 🚀

---

**تاريخ الإعداد:** 27 نوفمبر 2024  
**الحالة:** ✅ جاهز للتشغيل  
**الوضع الحالي:** 🎭 Sandbox Mode (للتجربة)

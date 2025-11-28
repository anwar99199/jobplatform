# 🔄 تصحيحات Amwal Pay SecureHash (بناءً على الوثائق الرسمية)

## ✅ ما تم تصحيحه

بعد الحصول على الوثائق الرسمية من Amwal Pay، تم إجراء التصحيحات التالية:

---

## 1️⃣ تغيير من SHA-256 إلى HMAC-SHA256

### ❌ الطريقة القديمة (خاطئة):
```typescript
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
```

### ✅ الطريقة الجديدة (صحيحة):
```typescript
// Convert HEX key to binary
const hexKeyBytes = new Uint8Array(
  amwalSecureHashKey!.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
);

// Import key for HMAC
const cryptoKey = await crypto.subtle.importKey(
  'raw',
  hexKeyBytes,
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign']
);

// Calculate HMAC-SHA256
const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
```

---

## 2️⃣ تغيير صيغة Hash String

### ❌ الصيغة القديمة (خاطئة):
```
MID + TID + CurrencyId + AmountTrxn + MerchantReference + TrxDateTime + SecureHashKey
```

**مثال:**
```
MERCHANT123TERMINAL45651210.000OMANJOBS_user123_17012345672024-11-27 14:30:00SECRET_KEY
```

### ✅ الصيغة الجديدة (صحيحة):
```
Amount=VALUE&CurrencyId=512&MerchantId=VALUE&MerchantReference=VALUE&RequestDateTime=VALUE&SessionToken=&TerminalId=VALUE
```

**مثال:**
```
Amount=10&CurrencyId=512&MerchantId=48804&MerchantReference=OMANJOBS_user123_1701234567&RequestDateTime=2024-12-31T15:27:10.361969Z&SessionToken=&TerminalId=113176
```

---

## 3️⃣ تغيير أسماء المعاملات

### ❌ الأسماء القديمة (خاطئة):
- `MID` → يجب أن تكون `MerchantId`
- `TID` → يجب أن تكون `TerminalId`
- `AmountTrxn` → يجب أن تكون `Amount`
- `TrxDateTime` → يجب أن تكون `RequestDateTime`

### ✅ الأسماء الجديدة (صحيحة):
```typescript
const hashParams = {
  Amount: planDetails.amount.toString(),
  CurrencyId: "512",
  MerchantId: amwalMerchantId,
  MerchantReference: transactionRef,
  RequestDateTime: requestDateTime,
  SessionToken: "", // Empty for non-recurring
  TerminalId: amwalTerminalId
};
```

---

## 4️⃣ ترتيب المعاملات أبجدياً

### ❌ الطريقة القديمة (بدون ترتيب):
```typescript
const hashString = `${merchantId}${terminalId}512${amount}...`;
```

### ✅ الطريقة الجديدة (مرتبة):
```typescript
// Sort parameters alphabetically
const sortedKeys = Object.keys(hashParams).sort();
const hashString = sortedKeys
  .map(key => `${key}=${hashParams[key]}`)
  .join('&');
```

**النتيجة:**
```
Amount=10&CurrencyId=512&MerchantId=48804&MerchantReference=...&RequestDateTime=...&SessionToken=&TerminalId=113176
```

---

## 5️⃣ تنسيق التاريخ والوقت

### ❌ التنسيق القديم (خاطئ):
```typescript
const trxDateTime = now.toISOString().replace('T', ' ').substring(0, 19);
// النتيجة: "2024-11-27 14:30:00"
```

### ✅ التنسيق الجديد (صحيح):
```typescript
const requestDateTime = now.toISOString();
// النتيجة: "2024-12-31T15:27:10.361969Z"
```

---

## 6️⃣ تنسيق المبلغ

### ❌ التنسيق القديم:
```typescript
const amountFormatted = planDetails.amount.toFixed(3);
// النتيجة: "10.000"
```

### ✅ التنسيق الجديد:
```typescript
Amount: planDetails.amount.toString()
// النتيجة: "10"
```

---

## 📊 مقارنة كاملة

### ❌ الكود القديم:
```typescript
const hashString = `${merchantId}${terminalId}512${amount.toFixed(3)}${reference}${dateTime}${secretKey}`;

const encoder = new TextEncoder();
const data = encoder.encode(hashString);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
```

### ✅ الكود الجديد:
```typescript
// Build sorted parameters
const hashParams = {
  Amount: amount.toString(),
  CurrencyId: "512",
  MerchantId: merchantId,
  MerchantReference: reference,
  RequestDateTime: now.toISOString(),
  SessionToken: "",
  TerminalId: terminalId
};

// Sort and concatenate
const sortedKeys = Object.keys(hashParams).sort();
const hashString = sortedKeys
  .map(key => `${key}=${hashParams[key]}`)
  .join('&');

// Convert HEX key to binary
const hexKeyBytes = new Uint8Array(
  secretKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
);

// Import key for HMAC
const cryptoKey = await crypto.subtle.importKey(
  'raw',
  hexKeyBytes,
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign']
);

// Calculate HMAC-SHA256
const encoder = new TextEncoder();
const data = encoder.encode(hashString);
const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

// Convert to HEX and uppercase
const hashArray = Array.from(new Uint8Array(signature));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
```

---

## 🧪 مثال عملي

### المدخلات:
```javascript
Amount: "10"
CurrencyId: "512"
MerchantId: "48804"
MerchantReference: "OMANJOBS_user123_1701234567"
RequestDateTime: "2024-12-31T15:27:10.361969Z"
SessionToken: ""
TerminalId: "113176"
SecureHashKey: "64373939653761352D343730352D343666632D623264312D343632353234636161656564" (HEX)
```

### HashString (مرتب أبجدياً):
```
Amount=10&CurrencyId=512&MerchantId=48804&MerchantReference=OMANJOBS_user123_1701234567&RequestDateTime=2024-12-31T15:27:10.361969Z&SessionToken=&TerminalId=113176
```

### الخطوات:
1. ترتيب المعاملات أبجدياً ✅
2. تحويل SecureHashKey من HEX إلى Binary ✅
3. حساب HMAC-SHA256 ✅
4. تحويل النتيجة إلى HEX ✅
5. تحويل إلى UPPERCASE ✅

### النتيجة:
```
8A8E9F1BC2979D6D89A947008831199E76331689D5B28D41395FA1DA65FFDE7B
```

---

## ✅ ما تم التحديث في الكود

### الملفات المعدلة:
1. ✅ `/supabase/functions/server/index.tsx` - تصحيح endpoint `/payment/prepare-smartbox`
2. ✅ `/AMWAL_SECUREHASH_FORMAT.md` - تحديث التوثيق
3. ✅ `/AMWAL_SMARTBOX_SETUP_COMPLETE.md` - تحديث الشرح
4. ✅ `/AMWAL_CORRECTIONS_APPLIED.md` - هذا الملف (الجديد)

---

## ⚠️ ملاحظات مهمة

### 1. المفتاح السري بصيغة HEX
- يجب أن يكون AMWAL_SECURE_HASH بصيغة HEX
- مثال: `64373939653761352D343730352D343666632D623264312D343632353234636161656564`
- **لا تستخدم** النص العادي (Plain Text)

### 2. ترتيب المعاملات ضروري
- يجب ترتيب المعاملات **أبجدياً** (alphabetically)
- الترتيب الصحيح: `Amount, CurrencyId, MerchantId, MerchantReference, RequestDateTime, SessionToken, TerminalId`

### 3. SessionToken فارغ للدفعات العادية
- استخدم `SessionToken: ""` (فارغ)
- فقط للدفعات المتكررة (Recurring) يكون له قيمة

### 4. RequestDateTime بصيغة ISO
- يجب استخدام `toISOString()`
- مثال: `2024-12-31T15:27:10.361969Z`
- **لا تستخدم** تنسيق مثل `2024-11-27 14:30:00`

### 5. Amount بدون أرقام عشرية
- استخدم `"10"` وليس `"10.000"`
- في الـ SecureHash فقط
- في SmartBox config يمكن استخدام `10.000`

---

## 🧪 الاختبار

بعد التصحيحات:

1. ✅ تأكد من إعادة نشر Edge Functions في Supabase
2. ✅ أضف AMWAL_SECURE_HASH بصيغة HEX
3. ✅ جرّب عملية دفع تجريبية
4. ✅ تحقق من Logs:
   ```
   ✅ Secure hash generated successfully using HMAC-SHA256
   ```

---

## 📞 إذا استمر الخطأ

إذا حصلت على خطأ "Invalid SecureHash" بعد التصحيحات:

1. تحقق من أن AMWAL_SECURE_HASH بصيغة HEX
2. تأكد من ترتيب المعاملات أبجدياً
3. تحقق من تنسيق RequestDateTime
4. راجع Logs في Supabase Functions
5. تواصل مع دعم Amwal Pay: **support@amwal.tech**

---

## ✅ الخلاصة

**تم تصحيح جميع الأخطاء بناءً على الوثائق الرسمية!**

الآن النظام يستخدم:
- ✅ HMAC-SHA256 (بدلاً من SHA-256 عادي)
- ✅ أسماء معاملات صحيحة (MerchantId بدلاً من MID)
- ✅ ترتيب أبجدي للمعاملات
- ✅ تحويل HEX key إلى Binary
- ✅ تنسيق ISO للتاريخ والوقت

**النظام جاهز الآن للاختبار مع Amwal Pay الحقيقي!** 🚀

---

**تاريخ التصحيح:** 27 نوفمبر 2024  
**الحالة:** ✅ تم التصحيح بالكامل

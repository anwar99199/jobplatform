# 🔐 Amwal Pay - SecureHash Format Guide (UPDATED)

## ✅ الصيغة الصحيحة (من وثائق Amwal الرسمية)

**تم التحديث بناءً على الوثائق الرسمية!**

**الصيغة المستخدمة حالياً في الكود:**

```
Amount=VALUE&CurrencyId=512&MerchantId=VALUE&MerchantReference=VALUE&RequestDateTime=VALUE&SessionToken=&TerminalId=VALUE
```

**ملاحظات مهمة:**
1. ✅ المعاملات مرتبة **أبجدياً** (alphabetically)
2. ✅ الصيغة: `key1=value1&key2=value2`
3. ✅ يستخدم **HMAC-SHA256** (وليس SHA-256 عادي!)
4. ✅ المفتاح السري بصيغة **HEX** ويجب تحويله إلى **Binary**
5. ✅ النتيجة **UPPERCASE**

**مثال:**
```
Amount=10&CurrencyId=512&MerchantId=48804&MerchantReference=OMANJOBS_123&RequestDateTime=2024-12-31T15:27:10.361969Z&SessionToken=&TerminalId=113176
```

ثم يتم حساب **HMAC-SHA256** باستخدام المفتاح السري وتحويله إلى **UPPERCASE**.

---

## 📝 تفاصيل الحقول للـ SecureHash

| الحقل | القيمة المستخدمة | ملاحظات |
|------|------------------|---------|
| **Amount** | `10` أو `6` | بدون أرقام عشرية في الـ hash |
| **CurrencyId** | `512` | ثابت - الريال العماني |
| **MerchantId** | من Environment Variable | `AMWAL_MERCHANT_ID` |
| **MerchantReference** | `OMANJOBS_userId_timestamp` | فريد لكل معاملة |
| **RequestDateTime** | `2024-12-31T15:27:10.361969Z` | بصيغة ISO 8601 |
| **SessionToken** | (فارغ) | للدفعات المتكررة فقط |
| **TerminalId** | من Environment Variable | `AMWAL_TERMINAL_ID` |
| **SecureHashKey** | من Environment Variable | `AMWAL_SECURE_HASH` - HEX format!

---

## ⚠️ تحذير مهم!

**صيغة SecureHash قد تختلف حسب وثائق Amwal Pay الرسمية.**

يجب عليك **التحقق من وثائق Amwal Pay** للتأكد من الصيغة الصحيحة.

### الصيغ المحتملة الأخرى:

#### الصيغة 1 (مستخدمة حالياً):
```
MID + TID + CurrencyId + AmountTrxn + MerchantReference + TrxDateTime + SecureHashKey
```

#### الصيغة 2 (بدون TrxDateTime):
```
MID + TID + CurrencyId + AmountTrxn + MerchantReference + SecureHashKey
```

#### الصيغة 3 (مع فواصل):
```
MID|TID|CurrencyId|AmountTrxn|MerchantReference|TrxDateTime|SecureHashKey
```

#### الصيغة 4 (ترتيب مختلف):
```
SecureHashKey + MID + TID + AmountTrxn + CurrencyId + MerchantReference
```

---

## 🔧 كيفية تغيير الصيغة (إذا لزم الأمر)

إذا أخبرك دعم Amwal Pay أن الصيغة مختلفة، قم بتعديل السطر التالي في:

**الملف:** `/supabase/functions/server/index.tsx`  
**السطر:** حوالي 2109

**الكود الحالي:**
```typescript
const hashString = `${amwalMerchantId}${amwalTerminalId}512${amountFormatted}${transactionRef}${trxDateTime}${amwalSecureHashKey}`;
```

**أمثلة للتعديل:**

### مثال 1: بدون TrxDateTime
```typescript
const hashString = `${amwalMerchantId}${amwalTerminalId}512${amountFormatted}${transactionRef}${amwalSecureHashKey}`;
```

### مثال 2: مع فواصل |
```typescript
const hashString = `${amwalMerchantId}|${amwalTerminalId}|512|${amountFormatted}|${transactionRef}|${trxDateTime}|${amwalSecureHashKey}`;
```

### مثال 3: ترتيب مختلف
```typescript
const hashString = `${amwalSecureHashKey}${amwalMerchantId}${amwalTerminalId}${amountFormatted}512${transactionRef}`;
```

---

## 🧪 كيفية اختبار الصيغة الصحيحة

### الطريقة 1: استخدام أداة Amwal Pay
- بعض مزودي الدفع يوفرون أداة لاختبار SecureHash
- تحقق من لوحة تحكم Amwal Pay

### الطريقة 2: اختبار في Sandbox
1. أدخل بيانات UAT الصحيحة
2. حاول إجراء معاملة تجريبية
3. إذا فشلت المعاملة بخطأ "Invalid SecureHash"، فالصيغة خاطئة

### الطريقة 3: التواصل مع دعم Amwal Pay
- أرسل لهم مثال على HashString (بدون SecureHashKey!)
- اسألهم عن الصيغة الصحيحة

---

## 📞 تواصل مع دعم Amwal Pay

**إذا واجهت خطأ "Invalid SecureHash":**

1. تواصل مع: **support@amwal.tech**
2. اسأل عن الصيغة الدقيقة لحساب SecureHash
3. اسأل عن:
   - ترتيب الحقول
   - هل يوجد فواصل بين الحقول؟
   - هل TrxDateTime جزء من Hash؟
   - هل Hash يكون UPPERCASE أم lowercase؟
   - هل Algorithm هو SHA-256؟

---

## 🔍 Debugging SecureHash

في حال الخطأ، يمكنك تتبع القيم في Logs:

**في السيرفر، سطر 2111:**
```typescript
console.log("🔐 Hash calculation:", {
  merchantId: amwalMerchantId,
  terminalId: amwalTerminalId,
  currency: 512,
  amount: amountFormatted,
  reference: transactionRef,
  dateTime: trxDateTime,
  hashKeyPresent: !!amwalSecureHashKey
});
```

**لن يتم طباعة:**
- القيمة الكاملة لـ `hashString` (لأنها تحتوي على SecretKey)
- القيمة النهائية للـ Hash (لأنها حساسة)

**لكن للتجربة فقط (احذفها بعد الاختبار):**

يمكنك إضافة مؤقتاً:
```typescript
console.log("⚠️ DEBUG ONLY - Hash String (REMOVE THIS!):", hashString);
console.log("⚠️ DEBUG ONLY - Calculated Hash:", secureHashValue);
```

**⚠️ احذف هذه السطور فوراً بعد الاختبار!** (لا تتركها في Production)

---

## ✅ ملخص

**الصيغة الحالية المستخدمة:**
```
MID + TID + 512 + AmountTrxn + MerchantReference + TrxDateTime + SecureHashKey
→ SHA-256 → UPPERCASE
```

**إذا لم تعمل:**
1. تواصل مع دعم Amwal Pay
2. احصل على الصيغة الصحيحة
3. عدّل السطر 2109 في `/supabase/functions/server/index.tsx`
4. أعد نشر Edge Functions
5. جرّب مرة أخرى

---

**ملاحظة:** هذا الملف للتوثيق فقط. الصيغة الحالية مبنية على معايير شائعة في أنظمة الدفع، لكن يجب التحقق من وثائق Amwal Pay الرسمية للتأكد من الدقة.

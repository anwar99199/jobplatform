# 🚀 إعداد Amwal Pay للدفع الإلكتروني

## 📋 نظرة عامة

تم استبدال نظام الدفع من **ثواني (Thawani)** إلى **Amwal Pay** بالكامل.

---

## 🔧 خطوات الإعداد

### 1️⃣ إنشاء حساب Amwal Pay

1. زيارة موقع Amwal Pay: [https://amwal.tech](https://amwal.tech)
2. التسجيل وإنشاء حساب تاجر (Merchant Account)
3. إكمال التحقق من الهوية (KYC)
4. الحصول على الموافقة من Amwal Pay

### 2️⃣ الحصول على المفاتيح

بعد الموافقة على حسابك، ستحصل على:

- **Merchant ID** - معرف التاجر الخاص بك
- **API Key** - مفتاح الـ API للدخول

### 3️⃣ إضافة المفاتيح في Supabase

1. افتح **Supabase Dashboard**
2. اذهب إلى **Project Settings** → **Edge Functions** → **Secrets**
3. أضف المتغيرات التالية:

```
AMWAL_MERCHANT_ID=your_merchant_id_here
AMWAL_API_KEY=your_api_key_here
```

### 4️⃣ إنشاء جدول payment_sessions

في **Supabase SQL Editor**، نفذ الكود التالي:

```sql
-- Create payment_sessions table for Amwal Pay transactions
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payment_sessions_transaction_ref ON public.payment_sessions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(status);

-- Enable RLS
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payment sessions"
  ON public.payment_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment sessions"
  ON public.payment_sessions
  FOR ALL
  USING (auth.role() = 'service_role');
```

### 5️⃣ إعادة تشغيل Edge Functions

بعد إضافة المفاتيح، أعد تشغيل Edge Functions من Supabase Dashboard.

---

## 📊 كيفية عمل النظام

### تدفق الدفع (Payment Flow)

```
1. المستخدم يختار باقة → PremiumPage
   ↓
2. Frontend يطلب إنشاء جلسة دفع
   POST /payment/create-session
   ↓
3. Server ينشئ معاملة في Amwal Pay
   ↓
4. يحفظ transaction_ref في جدول payment_sessions
   ↓
5. يعيد payment_url للمستخدم
   ↓
6. المستخدم يُحوَّل إلى صفحة Amwal Pay
   ↓
7. بعد الدفع الناجح → يعود إلى /payment/success?transaction_ref=XXX
   ↓
8. Frontend يطلب التحقق من الدفع
   POST /payment/verify
   ↓
9. Server يتحقق من حالة المعاملة من Amwal Pay
   ↓
10. إذا نجح → ينشئ/يحدث اشتراك في premium_subscriptions
```

---

## 🔍 API Endpoints

### 1. إنشاء جلسة دفع

**Endpoint:** `POST /make-server-8a20c00b/payment/create-session`

**Request Body:**
```json
{
  "planType": "yearly",  // أو "semi-annual"
  "userId": "uuid",
  "userEmail": "user@example.com",
  "userName": "اسم المستخدم"
}
```

**Response:**
```json
{
  "success": true,
  "transactionRef": "OMANJOBS_uuid_timestamp",
  "checkoutUrl": "https://pay.amwal.tech/...",
  "transactionData": { ... }
}
```

### 2. التحقق من الدفع

**Endpoint:** `POST /make-server-8a20c00b/payment/verify`

**Request Body:**
```json
{
  "transactionRef": "OMANJOBS_uuid_timestamp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تفعيل اشتراكك بنجاح",
  "subscription": {
    "userId": "uuid",
    "planType": "yearly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2025-01-01T00:00:00.000Z",
    "status": "active"
  }
}
```

---

## 💰 الأسعار

- **الباقة النصف سنوية:** 6 ريال عماني (6 أشهر)
- **الباقة السنوية:** 10 ريال عماني (12 شهر) - توفير 2 ريال

---

## 🧪 الاختبار

### وضع التطوير (Sandbox)

Amwal Pay يوفر بيئة sandbox للاختبار:

1. استخدم **Sandbox Merchant ID** و **Sandbox API Key**
2. استخدم بطاقات اختبار من توثيق Amwal Pay
3. جرب العمليات التالية:
   - دفع ناجح
   - دفع فاشل
   - إلغاء الدفع

### وضع الإنتاج (Production)

عند الجاهزية للإنتاج:

1. استبدل مفاتيح Sandbox بمفاتيح الإنتاج
2. تأكد من اكتمال KYC verification
3. اختبر بمبلغ صغير حقيقي أولاً

---

## 🔒 الأمان

✅ **تم تطبيق:**
- مفاتيح API محفوظة في Environment Variables
- RLS policies على جدول payment_sessions
- التحقق من المعاملات من خلال Amwal Pay API
- لا يتم تخزين بيانات بطاقات ائتمانية

---

## 📝 ملاحظات مهمة

1. **لا تشارك مفاتيح API** مع أي شخص
2. **احتفظ بنسخة احتياطية** من المفاتيح في مكان آمن
3. **راقب المعاملات** بانتظام من لوحة تحكم Amwal Pay
4. **اختبر جيداً** قبل الانتقال للإنتاج

---

## 🆘 الدعم

إذا واجهت أي مشكلة:

1. تحقق من logs في Supabase Edge Functions
2. راجع توثيق Amwal Pay: [https://docs.amwal.tech](https://docs.amwal.tech)
3. تواصل مع دعم Amwal Pay

---

## ✅ Checklist

- [ ] إنشاء حساب Amwal Pay
- [ ] الحصول على Merchant ID و API Key
- [ ] إضافة المفاتيح في Supabase Secrets
- [ ] تنفيذ SQL لإنشاء جدول payment_sessions
- [ ] اختبار الدفع في وضع Sandbox
- [ ] التحقق من استلام الاشتراكات بشكل صحيح
- [ ] الانتقال للإنتاج

---

**تم التحديث:** نوفمبر 2024  
**النظام:** Amwal Pay Integration v1.0

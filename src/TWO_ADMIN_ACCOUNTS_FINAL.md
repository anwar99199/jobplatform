# 🔐 تم: حسابي Admin ثابتين فقط

## ✅ التحديث النهائي

تم تحديث النظام ليسمح بـ **حسابي admin ثابتين فقط** بدون إمكانية إنشاء حسابات جديدة.

---

## 👥 بيانات الحسابين

### **Admin 1:**
```
📧 Email: as8543245@gmail.com
🔑 Password: A1999anw#
👤 Name: المدير العام
```

### **Admin 2:**
```
📧 Email: anwaralrawahi459@gmail.com
🔑 Password: 6101999
👤 Name: أنور الرواحي
```

---

## 📊 الخطوة 1: إضافة الحسابين في Supabase

### **نفذ هذا SQL في Supabase SQL Editor:**

```sql
-- حذف أي admin موجود
DELETE FROM admins;

-- إضافة Admin الأول
INSERT INTO admins (id, email, password, name, created_at) 
VALUES (
  'admin_fixed_001',
  'as8543245@gmail.com',
  'A1999anw#',
  'المدير العام',
  NOW()
);

-- إضافة Admin الثاني
INSERT INTO admins (id, email, password, name, created_at) 
VALUES (
  'admin_fixed_002',
  'anwaralrawahi459@gmail.com',
  '6101999',
  'أنور الرواحي',
  NOW()
);

-- التحقق
SELECT * FROM admins ORDER BY created_at;
```

**✅ الملف جاهز في:** `/INSERT_TWO_ADMIN_ACCOUNTS.sql`

---

## 🔄 الخطوة 2: السيرفر مُحدّث تلقائياً

### **في `/supabase/functions/server/index.tsx`:**

```typescript
// Admin login endpoint
app.post("/make-server-8a20c00b/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // الحسابات الثابتة المسموح بها
    const ALLOWED_ADMINS = [
      { email: "as8543245@gmail.com", password: "A1999anw#" },
      { email: "anwaralrawahi459@gmail.com", password: "6101999" }
    ];
    
    // التحقق من أن البريد من الحسابات المسموح بها
    const allowedAdmin = ALLOWED_ADMINS.find(admin => admin.email === email);
    
    if (!allowedAdmin) {
      return c.json({ 
        success: false, 
        message: "هذا البريد غير مسموح به. فقط المدراء المعتمدون يمكنهم الدخول" 
      }, 403);
    }
    
    // التحقق من كلمة المرور
    if (password !== allowedAdmin.password) {
      return c.json({ success: false, message: "كلمة المرور غير صحيحة" }, 401);
    }
    
    // ... باقي الكود
  }
});
```

---

## 🔒 آلية الحماية

### **طبقات الأمان:**

#### **1. التحقق من البريد:**
```typescript
// فقط الإيميلات المسموح بها:
✅ as8543245@gmail.com
✅ anwaralrawahi459@gmail.com
❌ any_other@email.com → 403 Forbidden
```

#### **2. التحقق من كلمة المرور:**
```typescript
// لكل إيميل كلمة مروره الخاصة:
✅ as8543245@gmail.com → A1999anw#
✅ anwaralrawahi459@gmail.com → 6101999
❌ wrong password → 401 Unauthorized
```

#### **3. التحقق من وجود الحساب في Supabase:**
```typescript
// يجب أن يكون الحساب موجود في جدول admins
✅ موجود → تسجيل دخول ناجح
❌ غير موجود → 404 Not Found
```

---

## 🧪 الاختبار

### ✅ **تسجيل دخول Admin 1:**
```
Email: as8543245@gmail.com
Password: A1999anw#
النتيجة: ✅ نجح → /admin/dashboard
```

### ✅ **تسجيل دخول Admin 2:**
```
Email: anwaralrawahi459@gmail.com
Password: 6101999
النتيجة: ✅ نجح → /admin/dashboard
```

### ❌ **محاولة بريد آخر:**
```
Email: someone@example.com
Password: 123456
النتيجة: ❌ "هذا البريد غير مسموح به. فقط المدراء المعتمدون يمكنهم الدخول"
```

### ❌ **كلمة مرور خاطئة:**
```
Email: as8543245@gmail.com
Password: wrong_password
النتيجة: ❌ "كلمة المرور غير صحيحة"
```

---

## 📝 ملاحظات مهمة

### ⚠️ **إضافة admin جديد (مستقبلاً):**

إذا أردت إضافة admin ثالث:

#### **1. في السيرفر:**
```typescript
const ALLOWED_ADMINS = [
  { email: "as8543245@gmail.com", password: "A1999anw#" },
  { email: "anwaralrawahi459@gmail.com", password: "6101999" },
  { email: "new_admin@gmail.com", password: "new_password" } // ← جديد
];
```

#### **2. في Supabase SQL:**
```sql
INSERT INTO admins (id, email, password, name, created_at) 
VALUES (
  'admin_fixed_003',
  'new_admin@gmail.com',
  'new_password',
  'اسم المدير الجديد',
  NOW()
);
```

---

### 🔄 **تغيير كلمة مرور:**

#### **في السيرفر:**
```typescript
{ email: "anwaralrawahi459@gmail.com", password: "NEW_PASSWORD" }
```

#### **في Supabase:**
```sql
UPDATE admins 
SET password = 'NEW_PASSWORD' 
WHERE email = 'anwaralrawahi459@gmail.com';
```

---

## 📊 مقارنة قبل/بعد

### **قبل:**
```
❌ حساب admin واحد فقط
```

### **الآن:**
```
✅ حسابي admin ثابتين:
   1. as8543245@gmail.com
   2. anwaralrawahi459@gmail.com
✅ محمي من إنشاء حسابات جديدة
✅ كل حساب له كلمة مروره الخاصة
```

---

## 🎯 الخلاصة

### **الحسابات الثابتة:**
| Email | Password | Name |
|-------|----------|------|
| as8543245@gmail.com | A1999anw# | المدير العام |
| anwaralrawahi459@gmail.com | 6101999 | أنور الرواحي |

### **الوصول:**
- ✅ `/admin/login` - تسجيل الدخول
- ✅ `/admin/dashboard` - لوحة التحكم
- ❌ `/admin/register` - غير متاح

---

## 🚀 الخطوة النهائية

**فقط نفذ SQL في Supabase وجرّب تسجيل الدخول بأي من الحسابين! 🎉**

```bash
1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ من /INSERT_TWO_ADMIN_ACCOUNTS.sql
4. Run
5. ✅ جاهز!
```

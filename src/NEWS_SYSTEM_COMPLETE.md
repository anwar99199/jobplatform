# ✅ نظام إدارة الأخبار - مكتمل

## 📋 التاريخ: 13 نوفمبر 2025

---

## 🎯 الملخص

تم بناء نظام إدارة الأخبار الكامل مع جدول **Supabase** حقيقي وصلاحيات RLS محكمة.

---

## 🗄️ جدول `news` في Supabase

### البنية:

```sql
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### الفهارس (Indexes):
- `idx_news_date` - لترتيب الأخبار حسب التاريخ
- `idx_news_created_at` - لترتيب الأخبار حسب تاريخ الإنشاء

---

## 🔐 صلاحيات RLS (Row Level Security)

### 1️⃣ القراءة (Public):
```sql
-- الكل يقدر يقرأ الأخبار (حتى بدون تسجيل دخول)
CREATE POLICY "Allow public read access to news"
ON news FOR SELECT TO public
USING (true);
```

### 2️⃣ الإضافة (Admin فقط):
```sql
CREATE POLICY "Allow admin insert to news"
ON news FOR INSERT TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'as8543245@gmail.com',
    'anwaralrawahi459@gmail.com'
  )
);
```

### 3️⃣ التعديل (Admin فقط):
```sql
CREATE POLICY "Allow admin update to news"
ON news FOR UPDATE TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'as8543245@gmail.com',
    'anwaralrawahi459@gmail.com'
  )
)
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'as8543245@gmail.com',
    'anwaralrawahi459@gmail.com'
  )
);
```

### 4️⃣ الحذف (Admin فقط):
```sql
CREATE POLICY "Allow admin delete to news"
ON news FOR DELETE TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'as8543245@gmail.com',
    'anwaralrawahi459@gmail.com'
  )
);
```

---

## 🌐 API Routes (في `/supabase/functions/server/index.tsx`)

### 1️⃣ **GET** `/make-server-8a20c00b/news`
- **الوصف:** جلب جميع الأخبار
- **الصلاحية:** Public (الكل)
- **الترتيب:** حسب التاريخ (الأحدث أولاً)
- **Response:**
  ```json
  {
    "success": true,
    "news": [
      {
        "id": "uuid",
        "title": "عنوان الخبر",
        "summary": "ملخص الخبر",
        "content": "المحتوى الكامل",
        "image_url": "https://...",
        "date": "2025-11-13",
        "created_at": "2025-11-13T...",
        "updated_at": "2025-11-13T..."
      }
    ]
  }
  ```

### 2️⃣ **GET** `/make-server-8a20c00b/news/:id`
- **الوصف:** جلب خبر واحد بالـ ID
- **الصلاحية:** Public (الكل)
- **Response:**
  ```json
  {
    "success": true,
    "news": { ... }
  }
  ```

### 3️⃣ **POST** `/make-server-8a20c00b/admin/news`
- **الوصف:** إضافة خبر جديد
- **الصلاحية:** Admin فقط (يحتاج `access_token`)
- **Headers:**
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "title": "عنوان الخبر",
    "summary": "ملخص الخبر",
    "content": "المحتوى الكامل",
    "imageUrl": "https://...",
    "date": "2025-11-13"
  }
  ```

### 4️⃣ **PUT** `/make-server-8a20c00b/admin/news/:id`
- **الوصف:** تعديل خبر موجود
- **الصلاحية:** Admin فقط (يحتاج `access_token`)
- **Headers & Body:** نفس POST

### 5️⃣ **DELETE** `/make-server-8a20c00b/admin/news/:id`
- **الوصف:** حذف خبر
- **الصلاحية:** Admin فقط (يحتاج `access_token`)
- **Headers:**
  ```
  Authorization: Bearer <access_token>
  ```

---

## 📱 الصفحات (Frontend)

### 1️⃣ `/news` - صفحة الأخبار العامة
**المسار:** `/pages/NewsPage.tsx`

**الميزات:**
- ✅ عرض جميع الأخبار في Grid Layout
- ✅ صور الأخبار (إذا موجودة)
- ✅ تاريخ النشر
- ✅ ملخص الخبر
- ✅ عرض المحتوى الكامل عند الضغط
- ✅ تصميم Responsive

**الوصول:** الكل (لا يحتاج تسجيل دخول)

---

### 2️⃣ `/admin/news` - صفحة إدارة الأخبار
**المسار:** `/pages/admin/AdminNewsPage.tsx`

**الميزات:**
- ✅ نموذج لإضافة خبر جديد
- ✅ تعديل الأخبار الموجودة
- ✅ حذف الأخبار
- ✅ عرض قائمة جميع الأخبار
- ✅ حفظ access_token في localStorage
- ✅ إرسال access_token مع كل طلب Admin

**الوصول:** Admin فقط (يحتاج تسجيل دخول)

**الاستخدام:**
```typescript
// يتم جلب access_token من localStorage
const accessToken = localStorage.getItem('admin_access_token');

// ثم إرساله مع الطلب
headers: {
  Authorization: `Bearer ${accessToken || publicAnonKey}`
}
```

---

## 🔄 كيفية عمل النظام

### **للمستخدمين العاديين:**
1. يزور `/news`
2. يشاهد جميع الأخبار بدون تسجيل دخول
3. يقرأ المحتوى الكامل عند الضغط على الخبر

### **للمدراء (Admin):**
1. يسجل دخول عبر `/admin/login`
2. يحصل على `access_token` ويتم حفظه في localStorage
3. يذهب إلى `/admin/news`
4. يضيف/يعدل/يحذف الأخبار
5. جميع العمليات تستخدم access_token للتحقق

---

## 🧪 طريقة الاختبار

### **1️⃣ اختبار القراءة (Public):**
```bash
# جلب جميع الأخبار (لا يحتاج authentication)
GET https://YOUR_PROJECT.supabase.co/functions/v1/make-server-8a20c00b/news
```

### **2️⃣ اختبار الإضافة (Admin):**
```bash
# سجّل دخول أولاً واحصل على access_token
POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-8a20c00b/admin/login
Body: { "email": "as8543245@gmail.com", "password": "A1999anw#" }

# ثم أضف خبر
POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-8a20c00b/admin/news
Headers: { "Authorization": "Bearer <access_token>" }
Body: {
  "title": "خبر تجريبي",
  "summary": "هذا خبر للاختبار",
  "content": "المحتوى الكامل هنا",
  "date": "2025-11-13"
}
```

### **3️⃣ اختبار RLS:**
```bash
# محاولة الإضافة بدون access_token أو بـ token غير مدير
# النتيجة المتوقعة: ❌ Permission denied
```

---

## 🎯 الحالة النهائية

### ✅ **ما تم إنجازه:**
1. ✅ جدول `news` في Supabase
2. ✅ صلاحيات RLS كاملة
3. ✅ API Routes في السيرفر (5 endpoints)
4. ✅ صفحة `/news` للعرض العام
5. ✅ صفحة `/admin/news` لإدارة الأخبار
6. ✅ التحقق من صلاحيات Admin
7. ✅ استخدام access_token من localStorage

### 🔐 **حسابات Admin:**
```
📧 Email 1: as8543245@gmail.com
🔑 Password: A1999anw#

📧 Email 2: anwaralrawahi459@gmail.com  
🔑 Password: 6101999
```

### 🚀 **جاهز للاستخدام!**

---

## 📝 ملاحظات مهمة

1. **Access Token:**
   - يتم حفظ access_token في localStorage عند تسجيل دخول Admin
   - المفتاح المستخدم: `admin_access_token`
   - يجب إرساله مع كل طلب Admin في header

2. **أسماء الحقول:**
   - في Frontend: `image_url`
   - في API Body: `imageUrl` (يتم التحويل في السيرفر)
   - في Database: `image_url`

3. **RLS Security:**
   - القراءة: مفتوحة للجميع
   - الكتابة/التعديل/الحذف: فقط للإيميلات المحددة في RLS policies

4. **التاريخ:**
   - يتم حفظه بصيغة `DATE` (فقط التاريخ بدون الوقت)
   - Format: `YYYY-MM-DD`

---

## 🎉 النظام جاهز!

النظام الآن يعمل بشكل كامل ومتكامل مع Supabase.

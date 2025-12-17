# ✅ إصلاح خطأ جدول الوظائف (jobs)

<div dir="rtl">

## 🐛 المشكلة

كان الكود يحاول إدراج حقول غير موجودة في جدول `jobs` في Supabase، مما تسبب في الخطأ:

```
Error creating job in Supabase: {
  code: "PGRST204",
  details: null,
  hint: null,
  message: "Could not find the 'company' column of 'jobs' in the schema cache"
}
```

### السبب:
- الكود كان يحاول إدراج: `company`, `location`, `type`, `requirements`
- لكن جدول `jobs` الفعلي في Supabase يحتوي فقط على: `title`, `description`, `application_url`, `date`

---

## ✅ الحل

تم تحديث الكود في **3 ملفات** لمطابقة بنية الجدول الفعلية:

### 1️⃣ `/utils/adminApi.ts`

#### قبل:
```typescript
// createJob
body: JSON.stringify({
  title: jobData.title,
  company: jobData.company,              // ❌ حقل غير موجود
  location: jobData.location || 'مسقط',  // ❌ حقل غير موجود
  type: jobData.type || 'دوام كامل',     // ❌ حقل غير موجود
  description: jobData.description || '',
  applicationUrl: jobData.applicationUrl || '',
  date: jobData.date || new Date().toISOString().split('T')[0]
})
```

#### بعد:
```typescript
// createJob
body: JSON.stringify({
  title: jobData.title,                  // ✅
  description: jobData.description || '', // ✅
  applicationUrl: jobData.applicationUrl || '', // ✅
  date: jobData.date || new Date().toISOString().split('T')[0] // ✅
})
```

نفس التحديث تم على `updateJob()`.

---

### 2️⃣ `/supabase/functions/server/index.tsx`

تم تحديث **3 endpoints**:

#### أ. `POST /admin/jobs` (إنشاء وظيفة)

قبل:
```typescript
const jobData = {
  title,
  company: "غير محدد",      // ❌
  location: "عُمان",        // ❌
  type: "غير محدد",         // ❌
  description: description || "",
  requirements: "",         // ❌
  application_url: applicationUrl || "",
  date: date || new Date().toISOString().split("T")[0]
};
```

بعد:
```typescript
const jobData = {
  title,                    // ✅
  description: description || "", // ✅
  application_url: applicationUrl || "", // ✅
  date: date || new Date().toISOString().split("T")[0] // ✅
};
```

#### ب. `PUT /admin/jobs/:id` (تحديث وظيفة)

تم نفس التحديث (إزالة `company`, `location`, `type`, `requirements`).

#### ج. `POST /jobs` (Legacy endpoint)

تم التحديث أيضاً لإزالة الحقول غير الموجودة.

---

## 📊 الحقول الفعلية في جدول `jobs`

| اسم الحقل | النوع | الوصف |
|-----------|------|-------|
| `id` | UUID | معرف فريد (auto-generated) |
| `title` | TEXT | المسمى الوظيفي ✅ |
| `description` | TEXT | وصف الوظيفة ✅ |
| `application_url` | TEXT | رابط التقديم ✅ |
| `date` | DATE | تاريخ النشر ✅ |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء (auto) |

---

## 🎯 الحقول المستخدمة في النموذج

صفحة `/admin/jobs/new` تحتوي على:

1. **المسمى الوظيفي** (`title`) - مطلوب
2. **تاريخ النشر** (`date`) - اختياري (القيمة الافتراضية: اليوم)
3. **رابط التقديم** (`applicationUrl`) - اختياري
4. **وصف الوظيفة** (`description`) - اختياري

---

## ✅ النتيجة

الآن عند إضافة وظيفة جديدة:
- ✅ لا توجد أخطاء من Supabase
- ✅ تُحفظ البيانات بنجاح
- ✅ يتم إرجاع الوظيفة الجديدة بنجاح
- ✅ التوافق الكامل مع بنية الجدول

---

## 📝 ملاحظات

### إذا كنت تريد إضافة الحقول المحذوفة لاحقاً:

يمكنك تنفيذ هذا SQL في Supabase:

```sql
-- إضافة الحقول الاختيارية
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements TEXT;

-- تحديث القيم الموجودة
UPDATE jobs SET 
  company = 'غير محدد' WHERE company IS NULL,
  location = 'عُمان' WHERE location IS NULL,
  type = 'غير محدد' WHERE type IS NULL,
  requirements = '' WHERE requirements IS NULL;
```

**لكن هذا غير مطلوب حالياً** لأن التطبيق يعمل بشكل كامل بدون هذه الحقول.

---

## 🔄 الملفات المحدّثة

1. ✅ `/utils/adminApi.ts` - تحديث `createJob()` و `updateJob()`
2. ✅ `/supabase/functions/server/index.tsx` - تحديث 3 endpoints
3. ✅ `/pages/admin/AdminJobFormPage.tsx` - لم يحتاج تعديل (كان صحيحاً)

---

## 🎉 الخلاصة

تم حل المشكلة بالكامل! الآن يمكنك:
- ✅ إضافة وظائف جديدة
- ✅ تعديل وظائف موجودة
- ✅ حذف وظائف
- ✅ عرض جميع الوظائف

**لا توجد أخطاء في قاعدة البيانات!** 🚀

---

_تم الإصلاح في: 14 ديسمبر 2024_

</div>

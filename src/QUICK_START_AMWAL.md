# ⚡ دليل سريع - ربط Amwal Pay في 3 خطوات

## ✅ الكود جاهز 100%!

---

## 🎯 الخطوة 1: أضف البيانات في Supabase

**افتح:** https://supabase.com/dashboard/project/jvfaelfsmpigdeiypuic/settings/secrets

**أضف هذه الأربعة:**

| Secret Name | Value |
|------------|-------|
| `AMWAL_MERCHANT_ID` | ضع MID هنا |
| `AMWAL_TERMINAL_ID` | ضع TID هنا |
| `AMWAL_SECURE_HASH` | ضع SECURE HASH هنا |
| `AMWAL_ENVIRONMENT` | `UAT` |

---

## 🎯 الخطوة 2: أعد نشر السيرفر

**افتح:** https://supabase.com/dashboard/project/jvfaelfsmpigdeiypuic/functions

**ابحث عن:** `server`

**اضغط:** `Deploy` أو `Redeploy`

---

## 🎯 الخطوة 3: أضف Webhook URL في حساب Amwal

**اذهب إلى:** Amwal Pay Dashboard → Settings → Webhooks

**أضف هذا الرابط:**
```
https://jvfaelfsmpigdeiypuic.supabase.co/functions/v1/make-server-8a20c00b/payment/webhook
```

**الأحداث المطلوبة:**
- ✅ payment.success
- ✅ payment.failed
- ✅ payment.cancelled

---

## ✅ جاهز للاختبار!

1. اذهب إلى صفحة Premium في موقعك
2. اختر أي باقة
3. أكمل الدفع باستخدام بطاقة اختبار
4. يجب أن يتم تفعيل الاشتراك تلقائياً!

---

## 🔍 لمراقبة العمليات:

**Logs:** https://supabase.com/dashboard/project/jvfaelfsmpigdeiypuic/functions/server/logs

---

## ⚠️ مشاكل شائعة:

### "نظام الدفع غير مكتمل الإعداد"
✅ تأكد من إضافة الـ 4 متغيرات وإعادة نشر السيرفر

### الدفع نجح لكن الاشتراك لم يُفعّل
✅ تأكد من إضافة Webhook URL في Amwal Dashboard

---

## 📞 هل تحتاج مساعدة؟

راجع الملف الكامل: `/AMWAL_INTEGRATION_INSTRUCTIONS.md`

---

**🎉 بالتوفيق!**

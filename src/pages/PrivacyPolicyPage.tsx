import { Shield, Lock, Eye, UserCheck, FileText, RefreshCw, Mail, Cookie, Baby } from "lucide-react";
import { Link } from "react-router-dom";

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="w-16 h-16" />
          </div>
          <h1 className="text-center text-4xl mb-4">سياسة الخصوصية</h1>
          <p className="text-center text-xl text-red-100 max-w-3xl mx-auto">
            نحن نولي خصوصيتكم أهمية قصوى، ونسعى لحماية بياناتكم واستخدامها فقط للأغراض المشروعة المرتبطة بخدمات الموقع
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-4 text-gray-800 flex items-center gap-2">
            <Eye className="w-7 h-7 text-red-600" />
            مرحبًا بكم في منصة عُمان للوظائف
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            من خلال استخدامك للموقع أو التطبيق فإنك توافق على سياسة الخصوصية التالية:
          </p>
        </div>

        {/* Section 1: Data Collection */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-red-600" />
            1) البيانات التي نقوم بجمعها
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            نجمع أنواعًا محدودة من البيانات بهدف تحسين تجربتك وتقديم الخدمات بكفاءة:
          </p>

          {/* أ. بيانات المستخدم ا��مباشرة */}
          <div className="mb-6">
            <h3 className="text-xl mb-3 text-gray-800">أ. بيانات يقدمها المستخدم مباشرة</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              <li>الاسم الثلاثي</li>
              <li>البريد الإلكتروني</li>
              <li>رقم الهاتف (اختياري)</li>
              <li>السيرة الذاتية (إذا رفعها المستخدم)</li>
              <li>بيانات الحساب الشخصي في البروفايل</li>
              <li>بيانات الاشتراك المميز (الباقات)</li>
            </ul>
          </div>

          {/* ب. بيانات تلقائية */}
          <div className="mb-6">
            <h3 className="text-xl mb-3 text-gray-800">ب. البيانات التي يتم جمعها تلقائيًا</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              <li>عنوان IP</li>
              <li>نوع الجهاز والمتصفح</li>
              <li>الصفحات التي ��تم زيارتها داخل المنصة</li>
              <li>الوقت والتاريخ ومدة الاستخدام</li>
            </ul>
          </div>

          {/* ج. بيانات الدفع */}
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-xl mb-3 text-gray-800 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-600" />
              ج. بيانات الدفع
            </h3>
            <p className="text-gray-700 mb-3">عند الاشتراك في الخدمة:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              <li className="text-red-700 font-medium">لا نقوم بتخزين بيانات البطاقة</li>
              <li>ستتم عمليات الدفع عبر بوابة دفع مرخصة وآمنة (عند التفعيل)</li>
              <li>يتم تخزين فقط: رقم العملية – حالة الدفع – تاريخ العملية</li>
            </ul>
          </div>
        </div>

        {/* Section 2: How We Use Data */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-red-600" />
            2) كيف نستخدم بياناتك؟
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">نستخدم بياناتك للأغراض التالية:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
            <li>إنشاء الحساب وتسهيل تسجيل الدخول</li>
            <li>تقديم خدمات توليد السيرة الذاتية والكفر ليتر بالذكاء الاصطناعي</li>
            <li>تحسين تجربة استخدام الموقع</li>
            <li>إرسال إشعارات مهمة (مثل تحديثات الحساب، انتهاء الاشتراك)</li>
            <li>إظهار وظائف مناسبة بناءً على البيانات المدخلة</li>
            <li>معالجة المدفوعات والاشتراكات</li>
          </ul>
        </div>

        {/* Section 3: Third Party Sharing */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-600" />
            3) هل نشارك بياناتك مع أطراف ثالثة؟
          </h2>
          <div className="bg-green-50 border-r-4 border-green-500 p-4 mb-6">
            <p className="text-green-800 font-medium">
              نحن لا نبيع ولا نتاجر ببيانات المستخدمين.
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            قد نشارك الحد الأدنى من البيانات مع:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
            <li>بوابة الدفع المرخصة لمعالجة الدفعات (عند توفرها)</li>
            <li>مزود البريد الإلكتروني لإرسال OTP أو رسائل النظام</li>
            <li>خدمات التحليل لتحسين الموقع (مثل Google Analytics)</li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm italic">
            نلتزم بعدم مشاركة أي بيانات إلا للضرورة القصوى ولتقديم الخدمة فقط.
          </p>
        </div>

        {/* Section 4: Data Protection */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <Lock className="w-7 h-7 text-red-600" />
            4) حماية البيانات
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            نطبق مجموعة من التدابير لحماية بياناتك، منها:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">تشفير الاتصالات</h4>
                  <p className="text-sm text-gray-600">عبر HTTPS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">حماية قواعد البيانات</h4>
                  <p className="text-sm text-gray-600">مع سياسات أمان متقدمة</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">وصول محدود</h4>
                  <p className="text-sm text-gray-600">فقط للمستخدم صاحب الحساب</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">نسخ احتياطية</h4>
                  <p className="text-sm text-gray-600">تخزين آمن ومشفر</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: User Rights */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-red-600" />
            5) حقوق المستخدم
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">يحق لك:</p>
          <div className="space-y-3">
            {[
              "الوصول إلى بيانات حسابك",
              "تعديل بياناتك في أي وقت",
              "حذف الحساب نهائيًا (عند الطلب)",
              "إلغاء الاشتراك في الرسائل",
              "طلب حذف سجلات السيرة الذاتية أو الملفات"
            ].map((right, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
                <p className="text-gray-700">{right}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Cookies */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <Cookie className="w-7 h-7 text-red-600" />
            6) ملفات تعريف الارتباط (Cookies)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            نستخدم ملفات "الكوكيز" لتحسين تجربة المستخدم، مثل:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4 mb-4">
            <li>تذكر تسجيل الدخول</li>
            <li>تخصيص المحتوى</li>
            <li>تحليل الاستخدام</li>
          </ul>
          <p className="text-gray-600 text-sm">
            يمكنك تعطيل الكوكيز من إعدادات المتصفح إن رغبت.
          </p>
        </div>

        {/* Section 7: Children Policy */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <Baby className="w-7 h-7 text-red-600" />
            7) سياسة الأطفال
          </h2>
          <p className="text-gray-700 leading-relaxed">
            خدماتنا غير موجهة للأطفال تحت سن 16 عامًا، ولا نقوم بجمع بياناتهم عمدًا.
          </p>
        </div>

        {/* Section 8: Policy Updates */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-red-600" />
            8) التعديلات على سياسة الخصوصية
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            سيتم نشر التعديلات هنا مع تحديث تاريخ آخر تعديل.
          </p>
          <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4">
            <p className="text-yellow-800 font-medium">
              آخر تحديث: نوفمبر 2024
            </p>
          </div>
        </div>

        {/* Section 9: Contact */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl mb-6 flex items-center gap-2">
            <Mail className="w-7 h-7" />
            9) طرق التواصل
          </h2>
          <p className="leading-relaxed mb-4">
            في حال وجود أي استفسارات تتعلق بالخصوصية، يمكنك التواصل معنا عبر:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <a href="mailto:support@myjobapp.app" className="hover:underline">
                support@myjobapp.app
              </a>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 flex-shrink-0" />
              <Link to="/contact" className="hover:underline">
                نموذج "اتصل بنا" داخل الموقع
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
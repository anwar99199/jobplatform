import { FileText, Shield, UserCheck, CreditCard, FileWarning, AlertTriangle, XCircle, Mail, RefreshCw, CheckCircle, Scale } from "lucide-react";
import { Link } from "react-router-dom";

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Scale className="w-16 h-16" />
          </div>
          <h1 className="text-center text-4xl mb-4">شروط واتفاقية الاستخدام</h1>
          <p className="text-center text-xl text-red-100 max-w-3xl mx-auto">
            Terms of Service
          </p>
          <div className="text-center mt-6 space-y-2">
            <p className="text-red-100">
              <strong>التطبيق:</strong> منصة عُمان للوظائف
            </p>
            <p className="text-red-100">
              <strong>البلد:</strong> سلطنة عُمان
            </p>
            <p className="text-red-100">
              <strong>تاريخ النفاذ:</strong> 20 أكتوبر 2024
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Section 1: Acceptance */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-7 h-7 text-red-600" />
            1) قبول الشروط
          </h2>
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4">
            <p className="text-gray-700 leading-relaxed">
              باستخدامك <strong>منصة عُمان للوظائف</strong> فأنت توافق على هذه الشروط. 
              إذا لم توافق، يرجى عدم استخدام التطبيق.
            </p>
          </div>
        </div>

        {/* Section 2: Account Creation */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-red-600" />
            2) إنشاء الحساب
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">يجب تقديم معلومات صحيحة عند التسجيل.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">أنت مسؤول عن سرية بيانات تسجيل الدخول.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">قد نرسل رمز تحقق (OTP) لإتمام التسجيل.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Allowed Use */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-600" />
            3) الاستخدام المسموح
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-gray-700">
                  يُستخدم التطبيق للاطلاع على الوظائف وخدمات منصة عُمان للوظائف.
                </p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-gray-700">
                  يُحظر أي استخدام غير قانوني أو يضر بالمنصة أو بالمستخدمين.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Subscriptions & Payments */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-red-600" />
            4) الاشتراكات والمدفوعات
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">قد يوفر التطبيق اشتراكًا مدفوعًا لميزات إضافية.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">ستُعرض تفاصيل الأسعار والسياسات داخل التطبيق عند التفعيل.</p>
            </div>
          </div>
          <div className="mt-6 bg-yellow-50 border-r-4 border-yellow-500 p-4">
            <p className="text-yellow-800 text-sm">
              <strong>ملاحظة:</strong> يتم معالجة المدفوعات عبر بوابة الدفع الآمنة Amwal Pay
            </p>
          </div>
        </div>

        {/* Section 5: Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-red-600" />
            5) المحتوى
          </h2>
          <p className="text-gray-700 leading-relaxed">
            قد يتضمن التطبيق محتوىً مضافًا من فريق منصة عُمان للوظائف. نحاول ضمان دقة المعلومات 
            لكن لا نضمن الكمال أو الخلو من الأخطاء.
          </p>
        </div>

        {/* Section 6: Updates & Downtime */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-red-600" />
            6) التعديلات والتوقف
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">قد نحدّث التطبيق أو نعدّل الميزات من وقت لآخر.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">قد نوقف الخدمة بشكل مؤقت للصيانة.</p>
            </div>
          </div>
        </div>

        {/* Section 7: Disclaimer */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <FileWarning className="w-7 h-7 text-red-600" />
            7) إخلاء مسؤولية
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              يُقدّم التطبيق <strong>"كما هو"</strong> و<strong>"حسب توفره"</strong>. 
              نسعى لتقديم خدمة مستقرة، مع عدم تقديم ضمانات صريحة أو ضمنية.
            </p>
          </div>
        </div>

        {/* Section 8: Liability */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            8) المسؤولية
          </h2>
          <p className="text-gray-700 leading-relaxed">
            لن نكون مسؤولين عن أي خسائر غير مباشرة أو تبعية ناتجة عن استخدام التطبيق 
            ضمن الحدود المسموح بها قانونًا.
          </p>
        </div>

        {/* Section 9: Termination */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <XCircle className="w-7 h-7 text-red-600" />
            9) إنهاء الاستخدام
          </h2>
          <div className="bg-red-50 border-r-4 border-red-500 p-4">
            <p className="text-gray-700 leading-relaxed">
              يمكننا تعليق أو إنهاء الوصول إذا خالفت هذه الشروط أو أسأت استخدام الخدمات.
            </p>
          </div>
        </div>

        {/* Section 10: Contact */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <Mail className="w-7 h-7 text-red-600" />
            10) التواصل
          </h2>
          <div className="space-y-3">
            <p className="text-gray-700">للاستفسارات:</p>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-600 flex-shrink-0" />
              <a href="mailto:support@myjobapp.app" className="text-blue-600 hover:underline">
                support@myjobapp.app
              </a>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
              <Link to="/contact" className="text-blue-600 hover:underline">
                نموذج "اتصل بنا" داخل الموقع
              </Link>
            </div>
          </div>
        </div>

        {/* Section 11: Changes to Terms */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-red-600" />
            11) التغييرات على الشروط
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            قد نقوم بتحديث هذه الشروط. عند التحديث سنغيّر تاريخ النفاذ وننشر النسخة الجديدة هنا.
          </p>
          <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4">
            <p className="text-yellow-800 font-medium">
              آخر تحديث: 20 أكتوبر 2024
            </p>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-8 text-white text-center">
          <p className="text-xl mb-2">
            © {new Date().getFullYear()} منصة عُمان للوظائف
          </p>
          <p className="text-red-100">
            جميع الحقوق محفوظة
          </p>
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

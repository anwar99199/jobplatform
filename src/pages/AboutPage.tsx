import { Link } from "react-router-dom";
import {
  Target,
  Shield,
  Users,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Building2,
  Briefcase,
  FileText,
  Crown,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/button";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl mb-6">من نحن</h1>
            <p className="text-xl text-red-100 leading-relaxed">
              نحن منصة عُمانية متخصصة في نشر أحدث الوظائف وتسهيل رحلة البحث عن العمل
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          
          {/* About Section */}
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl text-gray-800 mb-4">منصة عُمان للوظائف</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    <strong className="text-red-600">منصة عُمان للوظائف</strong> هي منصة عُمانية متخصصة في نشر أحدث الوظائف الحكومية والخاصة والعسكرية داخل السلطنة، إضافةً إلى فرص العمل في الشركات الكبرى سواء كانت بدوام كامل أو جزئي أو عن بُعد.
                  </p>
                  <p>
                    نهدف إلى تسهيل رحلة البحث عن عمل من خلال طرح إعلانات الوظائف بشكل يومي ومؤكد المصدر، مع الحرص على ذكر مصدر كل إعلان في صفحته، سواء كان من مواقع الوزارات، المؤسسات، الشركات، الصحف الرسمية أو المنصات الإخبارية.
                  </p>
                  <p>
                    كما تسعى المنصة إلى مساعدة الباحثين عن عمل على تطوير مهاراتهم والوصول إلى وظائف بمرتبات أعلى وفرص أفضل، من خلال أدوات ذكية وخدمات مميزة مثل توليد السيرة الذاتية ورسائل التوظيف باستخدام الذكاء الاصطناعي.
                  </p>
                  <p className="text-lg">
                    <strong className="text-red-600">هدفنا</strong> هو أن نكون المرجع الأول للباحثين عن عمل في عُمان، بمحتوى موثوق وتحديثات يومية تسهّل عليك الوصول إلى الفرصة المناسبة في الوقت المناسب.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl text-gray-800 mb-2">مصادر موثوقة</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    جميع الإعلانات مؤكدة المصدر من الوزارات والمؤسسات الرسمية والشركات الكبرى
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl text-gray-800 mb-2">تحديثات يومية</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    نشر الوظائف بشكل يومي مع الحرص على تحديث المحتوى باستمرار
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl text-gray-800 mb-2">أدوات الذكاء الاصطناعي</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    توليد السيرة الذاتية ورسائل التوظيف بتقنيات الذكاء الاصطناعي المتقدمة
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl text-gray-800 mb-2">مجتمع عُماني</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    منصة عُمانية تهتم بالباحثين عن عمل داخل السلطنة بالدرجة الأولى
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Types Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md p-8 md:p-12 mb-8 text-white">
            <h2 className="text-2xl mb-6 text-center">أنواع الوظائف المتاحة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg mb-2">وظائف حكومية</h3>
                <p className="text-sm text-gray-300">
                  وظائف في الوزارات والمؤسسات الحكومية
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-lg mb-2">وظائف القطاع الخاص</h3>
                <p className="text-sm text-gray-300">
                  فرص عمل في الشركات والمؤسسات الخاصة
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-lg mb-2">وظائف عسكرية</h3>
                <p className="text-sm text-gray-300">
                  فرص التوظيف في القطاع العسكري والأمني
                </p>
              </div>
            </div>
          </div>

          {/* Premium Services */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-8 md:p-12 mb-8 text-gray-900">
            <div className="text-center mb-8">
              <Crown className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl mb-2">خدمات Premium المميزة</h2>
              <p className="text-sm">
                أدوات احترافية لتطوير مسيرتك المهنية
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <FileText className="w-8 h-8 mb-3" />
                <h3 className="text-lg mb-2">بناء السيرة الذاتية</h3>
                <p className="text-sm">
                  توليد CV احترافية بتقنية الذكاء الاصطناعي
                </p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <FileText className="w-8 h-8 mb-3" />
                <h3 className="text-lg mb-2">رسائل التوظيف</h3>
                <p className="text-sm">
                  كتابة Cover Letter مخصصة لكل وظيفة
                </p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <Users className="w-8 h-8 mb-3" />
                <h3 className="text-lg mb-2">البطاقة الرقمية</h3>
                <p className="text-sm">
                  بطاقة احترافية قابلة للمشاركة
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link to="/premium">
                <Button className="bg-gray-900 hover:bg-black text-white">
                  <Crown className="w-4 h-4 ml-2" />
                  اكتشف خدمات Premium
                </Button>
              </Link>
            </div>
          </div>

          {/* Our Commitment */}
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-8">
            <h2 className="text-2xl text-gray-800 mb-6 text-center">التزامنا تجاهك</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  نشر الوظائف بشكل يومي مع ذكر المصدر الرسمي لكل إعلان
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  توفير معلومات دقيقة ومحدثة عن الوظائف المتاحة
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  مساعدة الباحثين عن عمل في تطوير مهاراتهم المهنية
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  تقديم أدوات ذكية تسهل عملية التقديم على الوظائف
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  الحفاظ على الشفافية وذكر مصادر الوظائف بشكل واضح
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-md p-8 text-center text-white">
            <h2 className="text-2xl mb-4">ابدأ رحلتك المهنية الآن</h2>
            <p className="mb-6 text-red-100">
              انضم إلى آلاف الباحثين عن عمل في عُمان واحصل على أحدث الفرص الوظيفية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-white hover:bg-gray-100 text-red-600">
                  <Users className="w-4 h-4 ml-2" />
                  إنشاء حساب مجاني
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <ArrowRight className="w-4 h-4 ml-2" />
                  تصفح الوظائف
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AboutPage;
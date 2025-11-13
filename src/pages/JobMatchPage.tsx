import { ArrowRight, TrendingUp, CheckCircle, Target, Lightbulb, BarChart3, Sparkles, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export function JobMatchPage() {
  const features = [
    {
      icon: <BarChart3 className="w-12 h-12 text-red-600" />,
      title: "تحليل دقيق للتوافق",
      description: "مقارنة شاملة بين ملفك ومتطلبات الوظيفة"
    },
    {
      icon: <Target className="w-12 h-12 text-red-600" />,
      title: "مقارنة المهارات المطلوبة",
      description: "معرفة المهارات الموجودة والمفقودة"
    },
    {
      icon: <Lightbulb className="w-12 h-12 text-red-600" />,
      title: "توصيات للتحسين",
      description: "اقتراحات لزيادة فرص القبول"
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-red-600" />,
      title: "نسبة مئوية واضحة",
      description: "عرض بسيط لمدى توافقك مع الوظيفة"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link to="/premium" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى خدمات Premium
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-gray-800">نسبة التوافق مع الوظائف</h1>
              <p className="text-gray-600">اعرف مدى توافق مهاراتك مع متطلبات كل وظيفة قبل التقديم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* How it Works Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl mb-4 text-gray-800">كيف يعمل؟</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              نقوم بتحليل مهاراتك وخبراتك ومقارنتها بمتطلبات الوظيفة لنعطيك نسبة التوافق المئوية.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all"
            >
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl mb-4">هذه الخدمة متاحة في صفحة الوظائف</h2>
            <p className="text-xl mb-8 text-red-100">
              شاهد نسبة التوافق مباشرة على كل بطاقة وظيفة
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg">
                  <Home className="ml-2 w-5 h-5" />
                  الانتقال إلى الصفحة الرئيسية
                </Button>
              </Link>
              <Link to="/company-jobs">
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600 px-8 py-6 text-lg">
                  <TrendingUp className="ml-2 w-5 h-5" />
                  تصفح وظائف الشركات
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="text-4xl mb-3 text-center">📊</div>
            <h3 className="text-lg mb-2 text-gray-800 text-center">تحليل فوري</h3>
            <p className="text-sm text-gray-600 text-center">
              احصل على نتائج التحليل مباشرة على كل وظيفة
            </p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <div className="text-4xl mb-3 text-center">✅</div>
            <h3 className="text-lg mb-2 text-gray-800 text-center">نتائج دقيقة</h3>
            <p className="text-sm text-gray-600 text-center">
              مقارنة شاملة بين مهاراتك ومتطلبات العمل
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <div className="text-4xl mb-3 text-center">💡</div>
            <h3 className="text-lg mb-2 text-gray-800 text-center">توصيات ذكية</h3>
            <p className="text-sm text-gray-600 text-center">
              اقتراحات عملية لتحسين فرصك في القبول
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { ArrowRight, TrendingUp, CheckCircle, Target, Lightbulb, BarChart3, Sparkles, Home, Lock, Crown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase/client";

export function JobMatchPage() {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // التحقق من حالة المستخدم
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        setIsLoggedIn(false);
        setIsPremium(false);
        setCheckingStatus(false);
        return;
      }

      setIsLoggedIn(true);

      // التحقق من وجود اشتراك Premium نشط
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      setIsPremium(!!subscription);
      setCheckingStatus(false);
    } catch (error) {
      console.log('Error checking user status:', error);
      setIsLoggedIn(false);
      setIsPremium(false);
      setCheckingStatus(false);
    }
  };

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

  // Loading state
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // غير مسجل دخول - يطلب منه تسجيل الدخول
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <Link to="/premium" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة إلى خدمات Premium
            </Link>
          </div>
        </div>

        {/* Access Denied - Not Logged In */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                <Lock className="w-12 h-12 text-red-600" />
              </div>
              
              <h1 className="text-3xl mb-4 text-gray-800">يجب تسجيل الدخول أولاً</h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                هذه الخدمة متاحة فقط للمستخدمين المسجلين. يرجى تسجيل الدخول للمتابعة.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button className="bg-red-600 text-white hover:bg-red-700 px-8 py-6 text-lg">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-8 py-6 text-lg">
                    إنشاء حساب جديد
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // مسجل دخول لكن غير مشترك في Premium
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <Link to="/premium" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة إلى خدمات Premium
            </Link>
          </div>
        </div>

        {/* Access Denied - Not Premium */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-12 text-center border-2 border-yellow-300">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500 rounded-full mb-6">
                <Crown className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-3xl mb-4 text-gray-800">هذه الخدمة حصرية للمشتركين في Premium</h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                ميزة <strong>نسبة التوافق مع الوظائف</strong> متاحة فقط للمشتركين في باقة Premium.
              </p>

              <div className="bg-white rounded-xl p-6 mb-8 text-right">
                <h3 className="text-xl mb-4 text-gray-800">ماذا ستحصل عند الاشتراك؟</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">نسبة توافق تلقائية على جميع بطاقات الوظائف</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">تحليل دقيق لمهاراتك وخبراتك</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">توصيات ذكية لتحسين فرص القبول</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">توليد Cover Letter و CV بالذكاء الاصطناعي</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">بطاقة رقمية احترافية</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/premium">
                  <Button className="bg-red-600 text-white hover:bg-red-700 px-10 py-6 text-xl flex items-center gap-2">
                    <Crown className="w-6 h-6" />
                    اشترك الآن في Premium
                  </Button>
                </Link>
                <Link to="/">
                  <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-8 py-6 text-lg">
                    العودة للصفحة الرئيسية
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // مستخدم Premium - عرض الصفحة الكاملة
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
              <p className="text-gray-600">اعرف مدى تواف�� مهاراتك مع متطلبات كل وظيفة قبل التقديم</p>
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
            <h2 className="text-3xl mb-4">هذه الخدمة متاحة مباشرة على بطاقات الوظائف</h2>
            <p className="text-xl mb-2 text-red-100">
              شاهد نسبة التوافق تلقائياً على كل بطاقة وظيفة
            </p>
            <p className="text-lg mb-8 text-red-100">
              نقوم بتحليل مهاراتك وخبراتك ومقارنتها بمتطلبات الوظيفة لنعطيك نسبة التوافق المئوية
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 text-right">
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                متطلبات الاستخدام:
              </h3>
              <ul className="space-y-3 text-red-50">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">تسجيل الدخول بحساب Premium نشط</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">إكمال الملف الشخصي (المهارات، الخبرة، التخصص)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">الانتقال إلى الصفحة الرئيسية لرؤية النسب</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg">
                  <Home className="ml-2 w-5 h-5" />
                  الانتقال إلى الصفحة الرئيسية
                </Button>
              </Link>
              <Link to="/profile">
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600 px-8 py-6 text-lg">
                  <Target className="ml-2 w-5 h-5" />
                  إكمال الملف الشخصي
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
import { Crown, CheckCircle, Star, Zap, FileText, Target, Sparkles, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

export function PremiumPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // التحقق من حالة الاشتراك
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        setIsPremium(false);
        setCheckingStatus(false);
        return;
      }

      // التحقق من وجود اشتراك نشط
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      setIsPremium(!!subscription);
      setCheckingStatus(false);
    } catch (error) {
      console.log('Error checking premium status:', error);
      setIsPremium(false);
      setCheckingStatus(false);
    }
  };

  const handleSelectPlan = async (planType: "semi-annual" | "yearly") => {
    try {
      setLoading(planType);

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("يرجى تسجيل الدخول أولاً");
        window.location.href = "/login";
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email || "";
      const userName = session.user.user_metadata?.name || "";

      // Create payment session
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/payment/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            planType,
            userId,
            userEmail,
            userName
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "فشل إنشاء جلسة الدفع");
        setLoading(null);
        return;
      }

      // Redirect to Amwal Pay checkout
      window.location.href = result.checkoutUrl;

    } catch (error) {
      console.error("Error creating payment session:", error);
      toast.error("حدث خطأ أثناء معالجة طلبك");
      setLoading(null);
    }
  };

  const premiumFeatures = [
    {
      icon: <FileText className="w-16 h-16 text-red-600" />,
      title: "توليد Cover Letter بالذكاء الاصطناعي",
      description: "احصل على رسالة تعريف احترافية مخصصة لكل وظيفة باستخدام الذكاء الاصطناعي",
      features: [
        "محتوى مخصص لكل وظيفة",
        "ربط مهاراتك بمتطلبات الوظيفة",
        "صياغة احترافية ومقنعة"
      ],
      link: "/premium/cover-letter"
    },
    {
      icon: <Target className="w-16 h-16 text-red-600" />,
      title: "سيرة ذاتية متوافقة مع ATS",
      description: "سيرة ذاتية محسّنة لأنظمة تتبع المتقدمين في الشركات الكبرى",
      features: [
        "تنسيق متوافق مع ATS",
        "كلمات مفتاحية محسّنة",
        "تحليل نسبة القبول"
      ],
      link: "/premium/cv-builder"
    },
    {
      icon: <CreditCard className="w-16 h-16 text-red-600" />,
      title: "بطاقة رقمية احترافية",
      description: "بطاقة تعريف رقمية شخصية يمكن مشاركتها مع أصحاب العمل",
      features: [
        "تصميم احترافي وأنيق",
        "رابط قابل للمشاركة",
        "عرض جميع معلومات التواصل"
      ],
      link: "/premium/digital-card"
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-red-600" />,
      title: "نسبة التوافق مع الوظائف",
      description: "اعرف مدى توافقك مع كل وظيفة قبل التقديم بتحليل ذكي دقيق",
      features: [
        "تحليل دقيق للتوافق مع متطلبات الوظيفة",
        "مقارنة المهارات المطلوبة بمهاراتك",
        "توصيات مخصصة للتحسين",
        "نسبة مئوية واضحة للتوافق"
      ],
      link: "/premium/job-match"
    }
  ];

  const plans = [
    {
      name: "نصف سنوي",
      price: "6",
      duration: "6 أشهر",
      monthly: "شهرياً 1 RO",
      planType: "semi-annual" as const,
      features: [
        "للفترة كاملة",
        "توليد Cover Letter بالذكاء الاصطناعي",
        "توليد CV بنظام ATS بالذكاء الاصطناعي",
        "بطاقة رقمية احترافية",
        "تحليل دقيق ومقارنة المهارات",
        "إشعارات فورية للوظائف الجديدة"
      ],
      popular: false
    },
    {
      name: "سنوي",
      price: "10",
      duration: "12 شهر",
      monthly: "شهرياً 1 RO وفر 2",
      planType: "yearly" as const,
      features: [
        "للفترة كاملة",
        "توليد Cover Letter بالذكاء الاصطناعي",
        "توليد CV بنظام ATS بالذكاء الاصطناعي",
        "بطاقة رقمية احترافية",
        "تحليل دقيق ومقارنة المهارات",
        "إشعارات فورية للوظائف الجديدة"
      ],
      popular: true,
      badge: "الأكثر توفيراً"
    }
  ];

  // Loading state
  if (checkingStatus) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Premium User View - عرض الخدمات فقط بدون الباقات
  if (isPremium) {
    return (
      <div className="container mx-auto px-4 py-12">
        {/* تنبيه الاشتراك النشط */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl text-green-900 mb-2 flex items-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  أنت مشترك في الباقة المميزة
                </h2>
                <p className="text-xl text-green-800">
                  استمتع بجميع الخدمات الحصرية أدناه!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* عنوان الخدمات */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-800">الخدمات المتاحة لك الآن</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            جميع الخدمات Premium جاهزة للاستخدام
          </p>
        </div>

        {/* Features Grid - بدون أزرار الاشتراك */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
          {premiumFeatures.map((feature, index) => (
            <Link to={feature.link} key={index}>
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full border-2 border-green-200">
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl mb-4 text-gray-800 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="text-center mt-6">
                  <span className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2 text-lg">
                    استخدم الأداة الآن
                    <Sparkles className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* نصيحة */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <p className="text-lg text-blue-900">
              💡 <strong>نصيحة:</strong> يمكنك الوصول لهذه الخدمات في أي وقت من القائمة العلوية
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Non-Premium User View - عرض كامل مع الباقات
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl mb-4 text-gray-800">خدمات Premium الحصرية</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          ارتقِ بمستوى بحثك عن الوظائف مع خدماتنا المتقدمة
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
        {premiumFeatures.map((feature, index) => (
          <Link to={feature.link} key={index}>
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl mb-4 text-gray-800 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-6">
                <span className="text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-2">
                  جرب الأداة الآن
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="mb-16">
        <h2 className="text-3xl text-center mb-12 text-gray-800">اختر الباقة المناسبة لك</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg shadow-lg p-8 relative ${
                plan.popular
                  ? "bg-gradient-to-br from-red-600 to-red-700 text-white transform scale-105"
                  : "bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-1/2 transform translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm">
                  {plan.badge || "الأكثر شعبية"} ⭐
                </div>
              )}

              <h3 className={`text-2xl mb-4 ${plan.popular ? "text-white" : "text-gray-800"}`}>
                {plan.name}
              </h3>
              
              <div className="mb-6">
                <span className="text-4xl">{plan.price}</span>
                <span className="text-xl mr-2">ريال عماني</span>
                <p className={`text-sm mt-2 ${plan.popular ? "text-red-100" : "text-gray-600"}`}>
                  {plan.duration}
                </p>
                <p className={`text-sm mt-2 ${plan.popular ? "text-red-100" : "text-gray-600"}`}>
                  {plan.monthly}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.popular ? "text-yellow-300" : "text-green-600"
                    }`} />
                    <span className={plan.popular ? "text-white" : "text-gray-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-6 ${
                  plan.popular
                    ? "bg-white text-red-600 hover:bg-gray-100"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                onClick={() => handleSelectPlan(plan.planType)}
                disabled={loading === plan.planType}
              >
                {loading === plan.planType ? "جاري المعالجة..." : "اختر هذه الباقة"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-3xl text-center mb-12 text-gray-800">الأسئلة الشائعة</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl mb-3 text-red-600">كيف يمكنني الاشتراك في الخدمة؟</h3>
            <p className="text-gray-700">
              يمكنك اختيار الباقة المناسبة والضغط على "اختر هذه الباقة"، ثم إكمال عملية الدفع الآمن��.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl mb-3 text-red-600">هل يمكنني إلغا الاشتراك في أي وقت؟</h3>
            <p className="text-gray-700">
              نعم، يمكنك إلغاء الاشتراك في أي وقت. سيظل إعلانك نشطاً حتى نهاية المدة المدفوعة.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl mb-3 text-red-600">ما هي طرق الدفع المتاحة؟</h3>
            <p className="text-gray-700">
              نقبل جميع طرق الدفع الإلكتروني بما في ذلك البطاقات الائتمانية والتحويل البنكي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
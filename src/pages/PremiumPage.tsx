import { Crown, CheckCircle, Star, Zap, FileText, Target } from "lucide-react";
import { Button } from "../components/ui/button";

export function PremiumPage() {
  const premiumFeatures = [
    {
      icon: <FileText className="w-16 h-16 text-red-600" />,
      title: "توليد Cover Letter بالذكاء الاصطناعي",
      description: "احصل على رسالة تعريف احترافية مخصصة لكل وظيفة باستخدام الذكاء الاصطناعي",
      features: [
        "محتوى مخصص لكل وظيفة",
        "ربط مهاراتك بمتطلبات الوظيفة",
        "صياغة احترافية ومقنعة"
      ]
    },
    {
      icon: <Target className="w-16 h-16 text-red-600" />,
      title: "سيرة ذاتية متوافقة مع ATS",
      description: "سيرة ذاتية محسّنة لأنظمة تتبع المتقدمين في الشركات الكبرى",
      features: [
        "تنسيق متوافق مع ATS",
        "كلمات مفتاحية محسّنة",
        "تحليل نسبة القبول"
      ]
    }
  ];

  const plans = [
    {
      name: "نصف سنوي",
      price: "6",
      duration: "6 أشهر",
      monthly: "شهرياً 1 RO",
      features: [
        "للفترة كاملة",
        "توليد Cover Letter بالذكاء الاصطناعي",
        "توليد CV بنظام ATS بالذكاء الاصطناعي",
        "استخدام AI لتحليل التوافق مع الوظائف",
        "إشعارات فورية للوظائف الجديدة",
        "تحليلات ورؤى متقدمة"
      ],
      popular: false
    },
    {
      name: "سنوي",
      price: "10",
      duration: "12 شهر",
      monthly: "شهرياً 1 RO وفر 2",
      features: [
        "للفترة كاملة",
        "توليد Cover Letter بالذكاء الاصطناعي",
        "توليد CV بنظام ATS بالذكاء الاصطناعي",
        "استخدام AI لتحليل التوافق مع الوظائف",
        "إشعارات فورية للوظائف الجديدة",
        "تحليلات ورؤى متقدمة"
      ],
      popular: true,
      badge: "الأكثر توفيراً"
    }
  ];

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
        <Button className="bg-red-600 text-white hover:bg-red-700 px-8 py-6">
          اشترك الآن وافتح جميع الميزات
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
        {premiumFeatures.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-2xl mb-4 text-gray-800 text-center">{feature.title}</h3>
            <p className="text-gray-600 text-center mb-6">{feature.description}</p>
            <ul className="space-y-3">
              {feature.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span className="text-gray-700">
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
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
              >
                اختر هذه الباقة
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
              يمكنك اختيار الباقة المناسبة والضغط على "اختر هذه الباقة"، ثم إكمال عملية الدفع الآمنة.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl mb-3 text-red-600">هل يمكنني إلغاء الاشتراك في أي وقت؟</h3>
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
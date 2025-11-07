import { Briefcase, TrendingUp, BookOpen, Award } from "lucide-react";

export function CareerPathPage() {
  const careerSteps = [
    {
      icon: <BookOpen className="w-12 h-12 text-red-600" />,
      title: "تحديد المسار المهني",
      description: "ابدأ بتحديد مجال عملك المفضل واستكشف الفرص المتاحة في السوق العماني"
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-red-600" />,
      title: "تطوير المهارات",
      description: "احصل على الدورات التدريبية والشهادات اللازمة لتعزيز فرصك الوظيفية"
    },
    {
      icon: <Briefcase className="w-12 h-12 text-red-600" />,
      title: "البحث عن الوظيفة المناسبة",
      description: "استخدم أدوات البحث المتقدمة لإيجاد الوظيفة التي تناسب مهاراتك وطموحاتك"
    },
    {
      icon: <Award className="w-12 h-12 text-red-600" />,
      title: "التقدم الوظيفي",
      description: "خطط لمستقبلك المهني واستمر في التطوير والتقدم في مجالك"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-center mb-4 text-red-600">المسار الوظيفي</h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          نساعدك في بناء مسار وظيفي ناجح من خلال التوجيه والإرشاد المهني
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {careerSteps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{step.icon}</div>
                <div>
                  <h3 className="text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl mb-4">هل تحتاج لمساعدة في تخطيط مسارك المهني؟</h2>
          <p className="mb-6">استخدم خدمات الذكاء الاصطناعي لدينا للحصول على توصيات مخصصة</p>
          <button className="bg-white text-red-600 px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
            ابدأ الآن
          </button>
        </div>
      </div>
    </div>
  );
}

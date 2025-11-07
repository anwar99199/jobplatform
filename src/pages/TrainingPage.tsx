import { Award, Clock, Building2 } from "lucide-react";

export function TrainingPage() {
  const trainingOpportunities = [
    {
      id: 1,
      title: "برنامج التدريب التعاوني في شركة تنمية نفط عمان",
      company: "شركة تنمية نفط عمان",
      duration: "6 أشهر",
      type: "تدريب صيفي",
      description: "فرصة تدريبية للطلاب الجامعيين في التخصصات الهندسية والإدارية"
    },
    {
      id: 2,
      title: "برنامج الخريجين في بنك مسقط",
      company: "بنك مسقط",
      duration: "12 شهر",
      type: "تدريب على رأس العمل",
      description: "برنامج تدريبي شامل للخريجين الجدد في المجال المصرفي والمالي"
    },
    {
      id: 3,
      title: "التدريب في مجال تقنية المعلومات",
      company: "أوريدو عمان",
      duration: "3 أشهر",
      type: "تدريب تقني",
      description: "تدريب عملي في مجال البرمجة وتطوير التطبيقات والأمن السيبراني"
    },
    {
      id: 4,
      title: "برنامج القادة الشباب",
      company: "مجموعة أسياد",
      duration: "9 أشهر",
      type: "برنامج قيادي",
      description: "برنامج تطويري للكفاءات الوطنية الشابة في القطاعات الصناعية"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Award className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl text-red-600">فرص التدريب</h1>
        </div>

        <p className="text-gray-600 mb-12 text-lg">
          اكتسب الخبرة العملية من خلال فرص التدريب المتنوعة في أفضل الشركات العمانية
        </p>

        <div className="space-y-6">
          {trainingOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-r-4 border-red-600"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl mb-3 text-gray-800">{opportunity.title}</h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 text-red-600" />
                      <span>{opportunity.company}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>المدة: {opportunity.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">
                    {opportunity.type}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {opportunity.description}
              </p>

              <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                التقديم الآن
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-xl mb-2">اكتساب الخبرة</h3>
            <p className="text-gray-600 text-sm">تطبيق المعرفة النظرية في بيئة عمل حقيقية</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
            <div className="text-4xl mb-2">🤝</div>
            <h3 className="text-xl mb-2">بناء العلاقات</h3>
            <p className="text-gray-600 text-sm">التواصل مع المهنيين وبناء شبكة علاقات قوية</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="text-xl mb-2">فرص توظيف</h3>
            <p className="text-gray-600 text-sm">إمكانية التوظيف الدائم بعد انتهاء التدريب</p>
          </div>
        </div>
      </div>
    </div>
  );
}

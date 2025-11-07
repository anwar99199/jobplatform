import { GraduationCap, MapPin, Calendar } from "lucide-react";

export function ScholarshipsPage() {
  const scholarships = [
    {
      id: 1,
      title: "منحة الحكومة اليابانية للدراسات العليا",
      country: "اليابان",
      level: "ماجستير ودكتوراه",
      deadline: "2025-12-31",
      description: "منحة ممولة بالكامل تشمل الرسوم الدراسية والسكن ومصاريف المعيشة"
    },
    {
      id: 2,
      title: "منحة تشيفنينج البريطانية",
      country: "المملكة المتحدة",
      level: "ماجستير",
      deadline: "2025-11-30",
      description: "برنامج المنح الدراسية الرائد في المملكة المتحدة للطلاب المتميزين"
    },
    {
      id: 3,
      title: "منحة الحكومة التركية",
      country: "تركيا",
      level: "بكالوريوس وماجستير ودكتوراه",
      deadline: "2026-01-15",
      description: "منحة شاملة تغطي جميع التكاليف الدراسية والمعيشية"
    },
    {
      id: 4,
      title: "منحة فولبرايت الأمريكية",
      country: "الولايات المتحدة",
      level: "ماجستير ودكتوراه",
      deadline: "2025-12-15",
      description: "برنامج التبادل التعليمي الدولي الأكثر شهرة في العالم"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl text-red-600">المنح الدراسية المجانية</h1>
        </div>

        <p className="text-gray-600 mb-12 text-lg">
          اكتشف أفضل المنح الدراسية المتاحة للطلاب العمانيين حول العالم
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {scholarships.map((scholarship) => (
            <div
              key={scholarship.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-t-4 border-red-600"
            >
              <h2 className="text-xl mb-4 text-gray-800">{scholarship.title}</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>{scholarship.country}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="w-4 h-4 text-red-600" />
                  <span>{scholarship.level}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span>آخر موعد: {scholarship.deadline}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {scholarship.description}
              </p>

              <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                التفاصيل والتقديم
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 p-8 rounded-lg border border-blue-200">
          <h3 className="text-2xl mb-4 text-blue-900">💡 نصائح للحصول على المنح الدراسية</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>ابدأ البحث والتقديم مبكراً قبل انتهاء المواعيد النهائية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>احرص على تجهيز جميع المستندات المطلوبة بدقة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>اكتب خطاب دافع قوي يوضح أهدافك الأكاديمية والمهنية</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

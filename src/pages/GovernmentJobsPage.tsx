import { Landmark, MapPin, GraduationCap, Calendar } from "lucide-react";

export function GovernmentJobsPage() {
  const governmentJobs = [
    {
      id: 1,
      title: "موظف إداري - وزارة التربية والتعليم",
      ministry: "وزارة التربية والتعليم",
      location: "مسقط",
      qualification: "بكالوريوس إدارة أعمال",
      deadline: "2025-11-30",
      description: "مطلوب موظفين إداريين للعمل في مختلف إدارات الوزارة"
    },
    {
      id: 2,
      title: "مهندس مدني - وزارة البلديات الإقليمية وموارد المياه",
      ministry: "وزارة البلديات الإقليمية",
      location: "صلالة",
      qualification: "بكالوريوس هندسة مدنية",
      deadline: "2025-12-15",
      description: "وظيفة مهندس مدني للإشراف على المشاريع التنموية في محافظة ظفار"
    },
    {
      id: 3,
      title: "محاسب قانوني - وزارة المالية",
      ministry: "وزارة المالية",
      location: "مسقط",
      qualification: "بكالوريوس محاسبة",
      deadline: "2025-11-25",
      description: "مطلوب محاسب قانوني للعمل في الإدارة العامة للحسابات"
    },
    {
      id: 4,
      title: "أخصائي تقنية معلومات - وزارة النقل والاتصالات",
      ministry: "وزارة النقل والاتصالات",
      location: "مسقط",
      qualification: "بكالوريوس علوم حاسب",
      deadline: "2025-12-20",
      description: "وظيفة أخصائي تقنية معلومات لتطوير وصيانة الأنظمة الإلكترونية"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Landmark className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl text-red-600">الوظائف الحكومية</h1>
        </div>

        <p className="text-gray-600 mb-12 text-lg">
          استعرض أحدث الوظائف الحكومية المتاحة في مختلف الوزارات والمؤسسات الحكومية
        </p>

        <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg mb-8">
          <h3 className="text-xl mb-2 text-blue-900">📢 معلومة مهمة</h3>
          <p className="text-blue-800">
            يجب على المتقدمين استيفاء الشروط المطلوبة والتقديم من خلال البوابة الإلكترونية الرسمية للوزارة المعنية
          </p>
        </div>

        <div className="space-y-6">
          {governmentJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-t-4 border-red-600"
            >
              <h2 className="text-2xl mb-4 text-gray-800">{job.title}</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2 text-gray-600">
                  <Landmark className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <span>{job.ministry}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="w-5 h-5 text-red-600" />
                  <span>{job.qualification}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span>آخر موعد: {job.deadline}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {job.description}
              </p>

              <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                التفاصيل والتقديم
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-lg">
          <h3 className="text-2xl mb-4">مميزات العمل الحكومي</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🏅</div>
              <p>الاستقرار الوظيفي</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <p>رواتب ومزايا تنافسية</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📈</div>
              <p>فرص التطور المهني</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

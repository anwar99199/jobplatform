import { Building2, MapPin, Briefcase, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { getJobs } from "../utils/api";

interface Job {
  id: string;
  title: string;
  date: string;
  company?: string;
  location?: string;
  type?: string;
  description?: string;
}

export function CompanyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      if (response.success) {
        // Filter only company jobs (not government or training)
        const companyJobs = response.jobs.filter(
          (job: Job) => job.type !== "حكومي" && job.type !== "تدريب"
        );
        setJobs(companyJobs);
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl text-red-600">وظائف الشركات</h1>
        </div>

        <p className="text-gray-600 mb-12 text-lg">
          تصفح أحدث الوظائف المتاحة في القطاع الخاص والشركات العمانية والعالمية
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">جاري تحميل الوظائف...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-r-4 border-red-600"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl mb-4 text-gray-800 hover:text-red-600 cursor-pointer">
                      {job.title}
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {job.company && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4 text-red-600" />
                          <span>{job.company}</span>
                        </div>
                      )}
                      
                      {job.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      {job.type && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4 text-red-600" />
                          <span>{job.type}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span>{job.date}</span>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gray-50 p-8 rounded-lg border-2 border-gray-200">
          <h3 className="text-2xl mb-4">💼 نصائح للتقديم على وظائف الشركات</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600">✓</span>
              <span>تأكد من مراجعة سيرتك الذاتية وتحديثها بانتظام</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">✓</span>
              <span>اكتب رسالة تغطية مخصصة لكل وظيفة تتقدم لها</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">✓</span>
              <span>ابحث عن الشركة واطلع على ثقافتها وقيمها قبل التقديم</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">✓</span>
              <span>استخدم خدمات الذكاء الاصطناعي لتحسين طلب التوظيف الخاص بك</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

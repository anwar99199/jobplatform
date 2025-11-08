import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getJob } from "../utils/api";
import { Calendar, MapPin, Building2, Briefcase, ArrowRight, Send } from "lucide-react";
import { Button } from "../components/ui/button";

interface Job {
  id: string;
  title: string;
  date: string;
  company?: string;
  location?: string;
  type?: string;
  description?: string;
}

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadJob(id);
    }
  }, [id]);

  const loadJob = async (jobId: string) => {
    try {
      setLoading(true);
      const response = await getJob(jobId);
      if (response.success) {
        setJob(response.job);
      } else {
        setError("الوظيفة غير موجودة");
      }
    } catch (err) {
      console.error("Error loading job:", err);
      setError("حدث خطأ أثناء تحميل تفاصيل الوظيفة");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">جاري تحميل تفاصيل الوظيفة...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-600 mb-6">{error || "الوظيفة غير موجودة"}</p>
          <Button onClick={() => navigate("/")} className="bg-red-600 hover:bg-red-700">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl mb-4 text-gray-800">{job.title}</h1>
              
              <div className="grid md:grid-cols-2 gap-4">
                {job.company && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-5 h-5 text-red-600" />
                    <span>{job.company}</span>
                  </div>
                )}
                
                {job.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span>{job.location}</span>
                  </div>
                )}
                
                {job.type && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-5 h-5 text-red-600" />
                    <span>{job.type}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span>تاريخ النشر: {job.date}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-2xl mb-4 text-red-600">وصف الوظيفة</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description || "لا يوجد وصف متاح لهذه الوظيفة."}
            </p>
          </div>
        </div>

        {/* Job Requirements Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl mb-4 text-red-600">المتطلبات</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">•</span>
              <span>مؤهل علمي مناسب للوظيفة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">•</span>
              <span>خبرة عملية في المجال</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">•</span>
              <span>مهارات تواصل جيدة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">•</span>
              <span>القدرة على العمل ضمن فريق</span>
            </li>
          </ul>
        </div>

        {/* Application Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl mb-4">هل أنت مهتم بهذه الوظيفة؟</h2>
          <p className="mb-6 text-red-50">
            قدم طلبك الآن وكن جزءاً من فريق العمل المتميز
          </p>
          <Button 
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg flex items-center gap-2 mx-auto"
          >
            <Send className="w-5 h-5" />
            <span>تقديم الطلب</span>
          </Button>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-xl mb-4 text-blue-900">💡 نصائح للتقديم</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>تأكد من قراءة متطلبات الوظيفة بدقة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>قم بتحديث سيرتك الذاتية لتتناسب مع الوظيفة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>اكتب خطاب تغطية احترافي يبرز مهاراتك</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>استخدم خدمات الذكاء الاصطناعي لتحسين طلبك</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

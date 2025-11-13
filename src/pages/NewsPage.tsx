import { useState, useEffect } from "react";
import { Calendar, Newspaper, Image as ImageIcon } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  date: string;
}

export function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/news`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setNews(result.news);
      } else {
        // If no news in database, show default news
        setNews([
          {
            id: "1",
            title: "وزارة العمل تعلن عن فتح باب التوظيف في القطاع الحكومي",
            date: "2025-11-07",
            summary: "أعلنت وزارة العمل العمانية عن فتح باب التوظيف في عدة وزارات ومؤسسات حكومية للعام 2025",
            content: "أعلنت وزارة العمل العمانية عن فتح باب التوظيف في عدة وزارات ومؤسسات حكومية للعام 2025"
          },
          {
            id: "2",
            title: "ارتفاع نسبة التوظيف في القطاع الخاص بنسبة 15%",
            date: "2025-11-06",
            summary: "أظهرت الإحصائيات الأخيرة ارتفاعاً ملحوظاً في نسب التوظيف في القطاع الخاص خلال الربع الأخير",
            content: "أظهرت الإحصائيات الأخيرة ارتفاعاً ملحوظاً في نسب التوظيف في القطاع الخاص خلال الربع الأخير"
          },
          {
            id: "3",
            title: "إطلاق برنامج جديد لتدريب الخريجين في التقنية",
            date: "2025-11-05",
            summary: "تم إطلاق برنامج تدريبي شامل للخريجين في مجال التقنية والبرمجة بالتعاون مع شركات عالمية",
            content: "تم إطلاق برنامج تدريبي شامل للخريجين في مجال التقنية والبرمجة بالتعاون مع شركات عالمية"
          },
          {
            id: "4",
            title: "مبادرة جديدة لدعم ريادة الأعمال الشبابية",
            date: "2025-11-04",
            summary: "أعلنت الحكومة عن مبادرة جديدة لدعم الشباب العماني في مجال ريادة الأعمال والمشاريع الصغيرة",
            content: "أعلنت الحكومة عن مبادرة جديدة لدعم الشباب العماني في مجال ريادة الأعمال والمشاريع الصغيرة"
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("فشل تحميل الأخبار");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show full article view
  if (selectedArticle) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-red-600 hover:text-red-700 mb-6 flex items-center gap-2"
          >
            ← العودة للأخبار
          </button>

          <article className="bg-white rounded-lg shadow-lg p-8">
            {selectedArticle.image_url && (
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            <h1 className="text-4xl mb-4 text-gray-800">
              {selectedArticle.title}
            </h1>
            
            <div className="flex items-center gap-2 text-gray-500 mb-6 text-sm pb-6 border-b border-gray-200">
              <Calendar className="w-4 h-4" />
              <span>{new Date(selectedArticle.date).toLocaleDateString("ar-EG")}</span>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </p>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Show news list
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl text-red-600">أهم الأخبار</h1>
        </div>

        <p className="text-gray-600 mb-12 text-lg">
          تابع آخر الأخبار والمستجدات في سوق العمل العماني
        </p>

        {news.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد أخبار متاحة حالياً</p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item) => (
              <article
                key={item.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-r-4 border-red-600"
              >
                <div className="flex gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl mb-3 text-gray-800 hover:text-red-600 cursor-pointer">
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.date).toLocaleDateString("ar-EG")}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">{item.summary}</p>
                    <button
                      onClick={() => setSelectedArticle(item)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      اقرأ المزيد ←
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
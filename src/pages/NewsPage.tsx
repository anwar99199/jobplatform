import { Calendar, Newspaper } from "lucide-react";

export function NewsPage() {
  const news = [
    {
      id: 1,
      title: "وزارة العمل تعلن عن فتح باب التوظيف في القطاع الحكومي",
      date: "2025-11-07",
      summary: "أعلنت وزارة العمل العمانية عن فتح باب التوظيف في عدة وزارات ومؤسسات حكومية للعام 2025"
    },
    {
      id: 2,
      title: "ارتفاع نسبة التوظيف في القطاع الخاص بنسبة 15%",
      date: "2025-11-06",
      summary: "أظهرت الإحصائيات الأخيرة ارتفاعاً ملحوظاً في نسب التوظيف في القطاع الخاص خلال الربع الأخير"
    },
    {
      id: 3,
      title: "إطلاق برنامج جديد لتدريب الخريجين في التقنية",
      date: "2025-11-05",
      summary: "تم إطلاق برنامج تدريبي شامل للخريجين في مجال التقنية والبرمجة بالتعاون مع شركات عالمية"
    },
    {
      id: 4,
      title: "مبادرة جديدة لدعم ريادة الأعمال الشبابية",
      date: "2025-11-04",
      summary: "أعلنت الحكومة عن مبادرة جديدة لدعم الشباب العماني في مجال ريادة الأعمال والمشاريع الصغيرة"
    }
  ];

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

        <div className="space-y-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-r-4 border-red-600"
            >
              <h2 className="text-2xl mb-3 text-gray-800 hover:text-red-600 cursor-pointer">
                {item.title}
              </h2>
              <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{item.date}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{item.summary}</p>
              <button className="mt-4 text-red-600 hover:text-red-700">
                اقرأ المزيد ←
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const footerLinks = [
    { title: "من نحن", href: "#" },
    { title: "تواصل معنا", href: "#" },
    { title: "وظائف حكومية", href: "/government-jobs" },
    { title: "وظائف الشركات", href: "/company-jobs" },
    { title: "فرص تدريب", href: "/training" },
    { title: "المنح الدراسية المجانية", href: "/scholarships" },
    { title: "أهم الأخبار", href: "/news" },
    { title: "المسار الوظيفي", href: "/career-path" }
  ];

  return (
    <footer className="bg-gray-800 text-white mt-16">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h3 className="text-2xl mb-6">من نحن</h3>
          <p className="leading-relaxed text-gray-300">
            انقل اليومية في قالب سهل وبسيط و يقوم أيضًا بمساعدة الراغبين بتطوير قدراتهم بالتي ، بوظائف بمرتبات أعلى ، بتقديم الموقع بطرح 
            أخبار الوظائف بشكل يومي و مؤقر لتزويل الخبر من المصدر يعتمد الموقع على عدة مصادر يتم ذكرها في صفحة الإعلان عن الوظيفة، 
            وتكوين مصادر الإعلان إما من موقع الوزارة والمؤسسة والشركة ومصادر الصحف والمواقع الصحفية ومن خلال صحا...
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <a href="#" className="hover:text-red-500 transition-colors">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <Youtube className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </a>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 border-t border-gray-700 pt-8">
          {footerLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="hover:text-red-500 transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-black py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>
            هذا الموقع مستقل ولا يُقرّ أي جهة حكومية ... المحتوى المنشور يعبر عن آراء أصحابه ولا يعكس بالضرورة وجهة نظر الموقع
          </p>
          <p className="mt-2">
            جميع الحقوق محفوظة لموقع وظائف عمان © 2023 – 
            <a href="#" className="text-blue-400 hover:underline mx-1">
              شروط و اتفاقية الاستخدام
            </a>
            - 
            <a href="#" className="text-blue-400 hover:underline mx-1">
              سياسة الخصوصية
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
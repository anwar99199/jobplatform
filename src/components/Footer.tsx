import { Link } from "react-router-dom";

export function Footer() {
  const footerLinks = [
    { title: "من نحن", href: "/about" },
    { title: "تواصل معنا", href: "/contact" },
    { title: "أهم الأخبار", href: "/news" },
    { title: "المسار الوظيفي", href: "/career-path" }
  ];

  return (
    <footer className="bg-gray-800 text-white mt-16">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
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
            جميع الحقوق محفوظة لموقع منصة عُمان للوظائف © {new Date().getFullYear()} – 
            <Link to="/terms-of-service" className="text-blue-400 hover:underline mx-1">
              شروط و اتفاقية الاستخدام
            </Link>
            - 
            <Link to="/privacy-policy" className="text-blue-400 hover:underline mx-1">
              سياسة الخصوصية
            </Link>
            <span className="mx-2">-</span>
            <Link to="/admin/login" className="text-gray-600 hover:text-red-400 transition-colors mx-1">
              •
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
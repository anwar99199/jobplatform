import { Menu, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userToken = localStorage.getItem("userToken");
    const userData = localStorage.getItem("user");
    
    if (userToken && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const navItems = [
    { title: "الرئيسية", path: "/" },
    { title: "من نحن", path: "/about" },
    { title: "خدمات Premium", path: "/premium" },
    { title: "المسار الوظيفي", path: "/career-path" },
    { title: "اهم الأخبار", path: "/news" }
  ];

  return (
    <>
      {/* Top Red Bar */}
      <div className="bg-red-600 text-white py-2 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Menu className="w-5 h-5 cursor-pointer" />
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Link to="/profile" className="hover:text-gray-200 transition-colors flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{user.user_metadata?.name || user.email}</span>
                </Link>
              </div>
              <span className="mx-2">|</span>
              <button
                onClick={handleLogout}
                className="hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="hover:text-gray-200 transition-colors">
                إنشاء حساب
              </Link>
              <span className="mx-2">|</span>
              <Link to="/login" className="hover:text-gray-200 transition-colors">
                تسجيل الدخول
              </Link>
            </>
          )}
        </div>
        <div>
          <Link to="/contact" className="text-white hover:text-gray-200 transition-colors cursor-pointer">
            انشر إعلانك معنا
          </Link>
        </div>
      </div>

      {/* Logo Section */}
      <Link to="/" className="block bg-red-600 text-white py-6 px-4 text-center hover:bg-red-700 transition-colors">
        <h1 className="text-4xl">منصة عُمان</h1>
        <h2 className="text-3xl">للوظائف</h2>
      </Link>

      {/* Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-1">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="hover:text-red-500 transition-colors whitespace-nowrap"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden pb-4 flex flex-col gap-3">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="hover:text-red-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
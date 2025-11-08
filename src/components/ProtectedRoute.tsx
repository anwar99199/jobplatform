import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    const userData = localStorage.getItem("user");
    
    if (userToken && userData) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // انتظار التحقق من حالة المصادقة
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن مسجل دخول، توجيه لصفحة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: "يجب تسجيل الدخول للوصول إلى خدمات Premium" 
        }} 
        replace 
      />
    );
  }

  // إذا كان مسجل دخول، عرض المحتوى
  return <>{children}</>;
}

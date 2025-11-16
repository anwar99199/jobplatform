import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Newspaper,
  MessageSquare
} from "lucide-react";
import { getAdminStats } from "../../utils/adminApi";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    activePremiumSubs: 0,
    todaysJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");
    
    if (!token || !user) {
      navigate("/admin/login");
      return;
    }
    
    setAdminUser(JSON.parse(user));
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin_access_token"); // حذف access_token أيضاً
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const statsCards = [
    { 
      title: "إجمالي الوظائف", 
      value: loading ? "..." : stats.totalJobs.toString(), 
      icon: Briefcase, 
      color: "bg-blue-500" 
    },
    { 
      title: "المستخدمين", 
      value: loading ? "..." : stats.totalUsers.toString(), 
      icon: Users, 
      color: "bg-green-500" 
    },
    { 
      title: "الاشتراكات النشطة", 
      value: loading ? "..." : stats.activePremiumSubs.toString(), 
      icon: TrendingUp, 
      color: "bg-purple-500" 
    },
    { 
      title: "الوظائف الجديدة (24 ساعة)", 
      value: loading ? "..." : stats.todaysJobs.toString(), 
      icon: BarChart3, 
      color: "bg-orange-500" 
    },
  ];

  const quickActions = [
    { title: "إدارة الوظائف", desc: "إضافة، تعديل وحذف الوظائف", icon: Briefcase, path: "/admin/jobs" },
    { title: "إدارة الأخبار", desc: "إضافة وتعديل أخبار سوق العمل", icon: Newspaper, path: "/admin/news" },
    { title: "رسائل التواصل", desc: "عرض ومتابعة رسائل المستخدمين", icon: MessageSquare, path: "/admin/contact" },
    { title: "إدارة المستخدمين", desc: "إدارة حسابات المستخدمين", icon: Users, path: "/admin/users" },
    { title: "الإحصائيات", desc: "عرض تقارير وإحصائيات مفصلة", icon: BarChart3, path: "/admin/analytics" },
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-red-600">لوحة التحكم</h1>
              <p className="text-gray-600 text-sm mt-1">مرحباً، {adminUser.name || adminUser.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex items-center gap-2"
              >
                عرض الموقع
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">الإجراءات السريعة</h2>
            <Button
              onClick={() => navigate("/admin/jobs/new")}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة وظيفة جديدة
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-lg shadow p-6 text-right hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg mb-2">{action.title}</h3>
                    <p className="text-gray-600 text-sm">{action.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl mb-6">النشاط الأخير</h2>
          <div className="space-y-4">
            {[
              { action: "إضافة وظيفة جديدة", item: "مهندس برمجيات - شركة XYZ", time: "منذ ساعة" },
              { action: "تعديل وظيفة", item: "محاسب - شركة ABC", time: "منذ 3 ساعات" },
              { action: "تقديم جديد", item: "مدير مبيعات - شركة DEF", time: "منذ 5 ساعات" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <p className="text-gray-800">{activity.action}</p>
                  <p className="text-gray-600 text-sm">{activity.item}</p>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
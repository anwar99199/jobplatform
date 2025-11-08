import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { 
  ArrowRight,
  TrendingUp,
  Users,
  Briefcase,
  Crown,
  Calendar,
  MapPin,
  Clock,
  Activity
} from "lucide-react";
import { getAnalytics } from "../../utils/adminApi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

interface Analytics {
  overview: {
    totalJobs: number;
    totalUsers: number;
    premiumUsers: number;
    jobsThisMonth: number;
    usersThisMonth: number;
    premiumRevenue: number;
  };
  jobsByType: Array<{ name: string; value: number }>;
  jobsByLocation: Array<{ name: string; value: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  jobGrowth: Array<{ date: string; jobs: number }>;
  premiumGrowth: Array<{ date: string; premium: number }>;
  topJobs: Array<{ title: string; company: string; views: number }>;
  recentActivity: Array<{ type: string; description: string; date: string }>;
}

const COLORS = ['#C41E3A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days");

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    
    loadAnalytics();
  }, [navigate, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getAnalytics(timeRange);
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#C41E3A] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للوحة التحكم
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">الإحصائيات والتقارير</h1>
              <p className="text-white/90">تحليل شامل لأداء الموقع</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === "7days" ? "default" : "ghost"}
                onClick={() => setTimeRange("7days")}
                className={timeRange === "7days" ? "bg-white text-red-600" : "text-white hover:bg-white/10"}
              >
                7 أيام
              </Button>
              <Button
                variant={timeRange === "30days" ? "default" : "ghost"}
                onClick={() => setTimeRange("30days")}
                className={timeRange === "30days" ? "bg-white text-red-600" : "text-white hover:bg-white/10"}
              >
                30 يوم
              </Button>
              <Button
                variant={timeRange === "90days" ? "default" : "ghost"}
                onClick={() => setTimeRange("90days")}
                className={timeRange === "90days" ? "bg-white text-red-600" : "text-white hover:bg-white/10"}
              >
                90 يوم
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">إجمالي الوظائف</p>
            <p className="text-3xl mb-1">{analytics.overview.totalJobs}</p>
            <p className="text-sm text-green-600">+{analytics.overview.jobsThisMonth} هذا الشهر</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">إجمالي المستخدمين</p>
            <p className="text-3xl mb-1">{analytics.overview.totalUsers}</p>
            <p className="text-sm text-green-600">+{analytics.overview.usersThisMonth} هذا الشهر</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">اشتراكات Premium</p>
            <p className="text-3xl mb-1">{analytics.overview.premiumUsers}</p>
            <p className="text-sm text-purple-600">
              {((analytics.overview.premiumUsers / analytics.overview.totalUsers) * 100).toFixed(1)}% من المستخدمين
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              نمو المستخدمين
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Job Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              نمو الوظائف
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.jobGrowth}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="jobs" stroke="#10B981" fillOpacity={1} fill="url(#colorJobs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Jobs by Type */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              الوظائف حسب النوع
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.jobsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.jobsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {analytics.jobsByType.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Jobs by Location */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              الوظائف حسب الموقع
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.jobsByLocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#C41E3A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Premium Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            نمو اشتراكات Premium
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.premiumGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="premium" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="اشتراكات Premium"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Jobs */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              الوظائف الأكثر مشاهدة
            </h2>
            <div className="space-y-4">
              {analytics.topJobs.length > 0 ? (
                analytics.topJobs.map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.company}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg text-blue-600">{job.views}</p>
                      <p className="text-xs text-gray-500">مشاهدة</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">لا توجد بيانات كافية</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              النشاط الأخير
            </h2>
            <div className="space-y-4">
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'job' ? 'bg-blue-500' :
                      activity.type === 'user' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">لا يوجد نشاط حديث</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

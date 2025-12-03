import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowRight,
  Search,
  Calendar
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { getJobs, deleteJob } from "../../utils/adminApi";

interface Job {
  id: string;
  title: string;
  date: string;
  company?: string;
  location?: string;
  type?: string;
  description?: string;
}

export function AdminJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    
    loadJobs();
  }, [navigate]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      if (response.success) {
        setJobs(response.jobs);
      } else {
        console.error("Failed to load jobs:", response.error);
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string, jobTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف الوظيفة: ${jobTitle}؟`)) {
      return;
    }

    try {
      const response = await deleteJob(jobId);
      if (response.success) {
        setJobs(jobs.filter(job => job.id !== jobId));
        alert("تم حذف الوظيفة بنجاح");
      } else {
        alert("فشل حذف الوظيفة");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("حدث خطأ أثناء حذف الوظيفة");
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600"
              >
                <ArrowRight className="w-5 h-5" />
                رجوع
              </button>
              <h1 className="text-2xl text-red-600">إدارة الوظائف</h1>
            </div>
            <Button
              onClick={() => navigate("/admin/jobs/new")}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة وظيفة جديدة
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="البحث عن وظيفة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">إجمالي الوظائف</p>
            <p className="text-3xl text-blue-600">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">الوظائف النشطة</p>
            <p className="text-3xl text-green-600">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">نتائج البحث</p>
            <p className="text-3xl text-purple-600">{filteredJobs.length}</p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">جاري تحميل الوظائف...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">لا توجد وظائف</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">المسمى الوظيفي</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">الشركة</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">الموقع</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{job.title}</p>
                        {job.type && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            {job.type}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{job.company || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{job.location || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          {job.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => navigate(`/admin/jobs/edit/${job.id}`)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Pencil className="w-4 h-4" />
                            تعديل
                          </Button>
                          <Button
                            onClick={() => handleDelete(job.id, job.title)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ArrowRight, Save } from "lucide-react";
import { getJob, createJob, updateJob } from "../../utils/adminApi";

export function AdminJobFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== "new";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (isEdit && id) {
      loadJob(id);
    }
  }, [navigate, isEdit, id]);

  const loadJob = async (jobId: string) => {
    try {
      const response = await getJob(jobId);
      if (response.success && response.job) {
        setFormData({
          title: response.job.title || "",
          company: response.job.company || "",
          location: response.job.location || "",
          type: response.job.type || "",
          description: response.job.description || "",
          date: response.job.date || new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      console.error("Error loading job:", err);
      alert("فشل تحميل بيانات الوظيفة");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = isEdit 
        ? await updateJob(id!, formData)
        : await createJob(formData);

      if (response.success) {
        alert(isEdit ? "تم تحديث الوظيفة بنجاح" : "تم إضافة الوظيفة بنجاح");
        navigate("/admin/jobs");
      } else {
        alert(response.message || "فشلت العملية");
      }
    } catch (err) {
      console.error("Error saving job:", err);
      alert("حدث خطأ أثناء حفظ الوظيفة");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/jobs")}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600"
            >
              <ArrowRight className="w-5 h-5" />
              رجوع
            </button>
            <h1 className="text-2xl text-red-600">
              {isEdit ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title">المسمى الوظيفي *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="مثال: مهندس برمجيات"
                required
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">اسم الشركة *</Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="مثال: شركة التكنولوجيا المتقدمة"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">الموقع *</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="مثال: مسقط، عُمان"
                required
              />
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label htmlFor="type">نوع الوظيفة</Label>
              <Input
                id="type"
                name="type"
                type="text"
                value={formData.type}
                onChange={handleChange}
                placeholder="مثال: دوام كامل، دوام جزئي، عن بعد"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">تاريخ النشر</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                dir="ltr"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">وصف الوظيفة *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="اكتب وصف تفصيلي للوظيفة، المهام المطلوبة، والمؤهلات..."
                rows={10}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2 flex-1"
              >
                <Save className="w-5 h-5" />
                {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الوظيفة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/jobs")}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

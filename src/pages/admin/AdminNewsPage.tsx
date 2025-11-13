import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Newspaper, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  ArrowRight,
  Image as ImageIcon,
  Save,
  X
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image_url: "",
    date: new Date().toISOString().split('T')[0]
  });

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
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("فشل تحميل الأخبار");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.summary) {
      toast.error("العنوان والملخص مطلوبان");
      return;
    }

    try {
      const url = editingId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/news/${editingId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/news`;

      // Get access token from localStorage (Admin session)
      const accessToken = localStorage.getItem('admin_access_token');

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || publicAnonKey}`,
        },
        body: JSON.stringify({
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          imageUrl: formData.image_url,
          date: formData.date
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingId ? "تم تحديث الخبر بنجاح" : "تم إضافة الخبر بنجاح");
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: "",
          summary: "",
          content: "",
          image_url: "",
          date: new Date().toISOString().split('T')[0]
        });
        fetchNews();
      } else {
        toast.error(result.error || "فشل حفظ الخبر");
      }
    } catch (error) {
      console.error("Error saving news:", error);
      toast.error("حدث خطأ أثناء حفظ الخبر");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("يرجى اختيار صورة فقط");
      return;
    }

    // Validate file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 3 ميجابايت");
      return;
    }

    try {
      setUploadingImage(true);

      // Get access token
      const accessToken = localStorage.getItem('admin_access_token');
      if (!accessToken) {
        toast.error("يرجى تسجيل الدخول كمسؤول أولاً");
        setUploadingImage(false);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      console.log("Uploading image to:", `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/upload-news-image`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/upload-news-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload result:", result);

      if (result.success) {
        setFormData(prev => ({ ...prev, image_url: result.imageUrl }));
        toast.success("تم رفع الصورة بنجاح");
      } else {
        toast.error(result.error || "فشل رفع الصورة");
        setImagePreview("");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`حدث خطأ أثناء رفع الصورة: ${error.message || error}`);
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      summary: article.summary,
      content: article.content,
      image_url: article.image_url || "",
      date: article.date.split('T')[0]
    });
    setImagePreview(article.image_url || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) {
      return;
    }

    try {
      // Get access token from localStorage (Admin session)
      const accessToken = localStorage.getItem('admin_access_token');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/news/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("تم حذف الخبر بنجاح");
        fetchNews();
      } else {
        toast.error(result.error || "فشل حذف الخبر");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("حدث خطأ أثناء حذف الخبر");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setImagePreview("");
    setFormData({
      title: "",
      summary: "",
      content: "",
      image_url: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="text-gray-600 hover:text-red-600">
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Newspaper className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-3xl text-gray-800">إدارة الأخبار</h1>
                <p className="text-gray-600">إضافة وتعديل أخبار سوق العمل</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Plus className="ml-2 w-5 h-5" />
              إضافة خبر جديد
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl mb-6 text-gray-800">
              {editingId ? "تعديل الخبر" : "إضافة خبر جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="عنوان الخبر"
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">التاريخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="summary">الملخص *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="ملخص مختصر للخبر"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">المحتوى الكامل</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="المحتوى التفصيلي للخبر"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="image">صورة الخبر (اختياري)</Label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={imagePreview} 
                        alt="معاينة الصورة" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, image_url: "" });
                        }}
                        className="absolute top-2 left-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer border-2 border-dashed border-gray-300">
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">
                          {uploadingImage ? "جارٍ الرفع..." : "رفع صورة"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Manual URL Input */}
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500">أو</span>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="أدخل رابط الصورة"
                      type="url"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">الحد الأقصى: 3 ميجابايت (JPG, PNG, GIF)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-red-600 text-white hover:bg-red-700 flex-1"
                >
                  <Save className="ml-2 w-5 h-5" />
                  {editingId ? "حفظ التعديلات" : "إضافة الخبر"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="ml-2 w-5 h-5" />
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* News List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl mb-6 text-gray-800">
            قائمة الأخبار ({news.length})
          </h2>

          {news.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد أخبار حالياً</p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-red-600 text-white hover:bg-red-700"
              >
                <Plus className="ml-2 w-5 h-5" />
                إضافة أول خبر
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((article) => (
                <div
                  key={article.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl mb-2 text-gray-800">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.date).toLocaleDateString("ar-EG")}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{article.summary}</p>
                      {article.image_url && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ImageIcon className="w-4 h-4" />
                          <span>يحتوي على صورة</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(article)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(article.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
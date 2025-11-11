import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Calendar,
  Edit,
  Trash2,
  LogOut,
  Crown,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Phone,
  Building,
  Upload,
  Sparkles,
  X,
  Download
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: "أنور الرواحي",
    email: "as8543245@gmail.com",
    phone: "",
    location: "مسقط",
    specialty: "تطوير البرمجيات",
    experience: "",
    skills: "",
    bio: ""
  });

  const [premiumData, setPremiumData] = useState({
    isActive: false,
    startDate: "",
    renewalDate: "",
    autoRenew: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        navigate("/login", { state: { message: "يرجى تسجيل الدخول للوصول إلى الملف الشخصي" } });
        return;
      }

      setUser(session.user);
      // تحميل بيانات المستخدم من قاعدة البيانات
      loadUserProfile(session.user.id);
    } catch (err) {
      console.error("Auth check error:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // تحميل بيانات المستخدم من جدول users (معلومات أساسية)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      // تحميل بيانات المستخدم من جدول user_profiles (معلومات تفصيلية)
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userData) {
        // دمج البيانات من الجدولين
        const skills = profileData?.skills 
          ? (Array.isArray(profileData.skills) 
              ? profileData.skills.join(', ') 
              : profileData.skills)
          : "";

        setProfileData({
          name: userData.name || "أنور الرواحي",
          email: userData.email || "as8543245@gmail.com",
          phone: profileData?.phone || "",
          location: profileData?.location || "مسقط",
          specialty: profileData?.specialty || "تطوير البرمجيات",
          experience: profileData?.experience || "",
          skills: skills,
          bio: profileData?.bio || ""
        });
      }

      // تحميل بيانات الاشتراك Premium
      const { data: premiumSub, error: premiumError } = await supabase
        .from("premium_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (premiumSub) {
        setPremiumData({
          isActive: premiumSub.is_active || false,
          startDate: new Date(premiumSub.start_date).toLocaleDateString('ar-SA'),
          renewalDate: new Date(premiumSub.end_date).toLocaleDateString('ar-SA'),
          autoRenew: true
        });
      }

      // Load CV files
      await loadCVFiles();
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadCVFiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/cv-files`,
        {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.files) {
        setUploadedFiles(data.files);
      }
    } catch (err) {
      console.error("Error loading CV files:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleUpdateProfile = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("يرجى تسجيل الدخول أولاً");
        setLoading(false);
        return;
      }

      // تحويل skills من string إلى array
      const skillsArray = profileData.skills 
        ? profileData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            name: profileData.name,
            phone: profileData.phone,
            location: profileData.location,
            specialty: profileData.specialty,
            experience: profileData.experience,
            skills: skillsArray,
            bio: profileData.bio
          }),
        }
      );

      const data = await response.json();

      console.log("Update response:", data);

      if (!response.ok || !data.success) {
        setError(data.error || "فشل تحديث البيانات");
        setLoading(false);
        return;
      }

      setSuccess("تم تحديث البيانات بنجاح!");
      setEditing(false);
      
      // Reload profile to get fresh data
      await loadUserProfile(user.id);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Update error:", err);
      setError("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.")) {
      return;
    }

    try {
      // حذف الحساب عبر السيرفر
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.ok) {
        await supabase.auth.signOut();
        localStorage.clear();
        navigate("/");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      setError("فشل حذف الحساب");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("يرجى تسجيل الدخول أولاً");
        setUploading(false);
        return;
      }

      for (const file of Array.from(files)) {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setError(`الملف ${file.name} أكبر من 5 ميجا`);
          continue;
        }

        // Check if limit reached
        if (uploadedFiles.length >= 5) {
          setError("لا يمكن رفع أكثر من 5 ملفات");
          break;
        }

        // Upload file
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/upload-cv`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "فشل رفع الملف");
          continue;
        }

        // Reload files list
        await loadCVFiles();
        setSuccess(`تم رفع ${file.name} بنجاح`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("حدث خطأ أثناء رفع الملفات");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveFile = async (filePath: string, index: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("يرجى تسجيل الدخول أولاً");
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/cv-files`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ filePath }),
        }
      );

      if (response.ok) {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
        setSuccess("تم حذف الملف بنجاح");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "فشل حذف الملف");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("حدث خطأ أثناء حذف الملف");
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.target = "_blank";
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-3">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-lg text-gray-800">{profileData.name}</h3>
                </div>
                <p className="text-sm text-gray-500">{profileData.email}</p>
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "info"
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>الملف الشخصي</span>
                </button>

                <button
                  onClick={() => setActiveTab("premium")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "premium"
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  <span>خدمات Premium</span>
                </button>

                <button
                  onClick={() => setActiveTab("cv")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "cv"
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>السيرة الذاتية</span>
                </button>

                <button
                  onClick={() => setEditing(!editing)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>تحديث البيانات</span>
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>حذف الحساب</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("premium")}
                    className={`flex-1 px-6 py-4 text-center transition-colors ${
                      activeTab === "premium"
                        ? "border-b-2 border-red-600 text-red-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    اشتراك Premium
                  </button>
                  <button
                    onClick={() => setActiveTab("cv")}
                    className={`flex-1 px-6 py-4 text-center transition-colors ${
                      activeTab === "cv"
                        ? "border-b-2 border-red-600 text-red-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    السيرة الذاتية
                  </button>
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`flex-1 px-6 py-4 text-center transition-colors ${
                      activeTab === "info"
                        ? "border-b-2 border-red-600 text-red-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    المعلومات الشخصية
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Premium Tab */}
                {activeTab === "premium" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Crown className="w-6 h-6 text-yellow-500" />
                      <h2 className="text-xl text-gray-800">حالة الاشتراك</h2>
                    </div>

                    {premiumData.isActive ? (
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg text-gray-800 flex items-center gap-2">
                                Premium نشط 
                                <span className="text-xl">🎉</span>
                              </h3>
                              <p className="text-sm text-gray-600">تستمتع بجميع المميزات المتقدمة</p>
                            </div>
                          </div>
                          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            Premium
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">تاريخ الاشتراك</span>
                            </div>
                            <p className="text-lg text-gray-800">{premiumData.startDate}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">تاريخ التجديد</span>
                            </div>
                            <p className="text-lg text-gray-800">{premiumData.renewalDate}</p>
                          </div>
                        </div>

                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-800">
                            سيتم تجديد اشتراكك تلقائياً في تاريخ التجديد
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg text-gray-800 mb-2">لم تشترك بعد</h3>
                        <p className="text-gray-600 mb-6">اشترك الآن للاستفادة من جميع المميزات</p>
                        <Link to="/premium">
                          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            <Crown className="w-4 h-4 ml-2" />
                            عرض الباقات
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* CV Tab */}
                {activeTab === "cv" && (
                  <div className="space-y-6">
                    {/* Cover Letter Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg text-gray-800 mb-2 flex items-center gap-2">
                            <span>توليد رسالة تعريف (Cover Letter)</span>
                            {!premiumData.isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                <Crown className="w-3 h-3" />
                                Premium
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            للوصول إلى جميع الأدوات المتقدمة Premium توجه إلى صفحة خدمات
                          </p>
                          {premiumData.isActive ? (
                            <Link to="/premium">
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Sparkles className="w-4 h-4 ml-2" />
                                توليد رسالة تعريف
                              </Button>
                            </Link>
                          ) : (
                            <Link to="/premium">
                              <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50">
                                <Crown className="w-4 h-4 ml-2" />
                                الترقية إلى Premium
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Upload CV Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg text-gray-800 mb-2">رع السيرة الذاتية</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            يعد أقصى 5 مطيابات لكل ملف (Word أو PDF) يمكنك رفع حتى 5 ملفات
                          </p>

                          {/* File Upload Button */}
                          <label className="inline-block cursor-pointer">
                            <input
                              type="file"
                              accept=".doc,.docx,.pdf"
                              multiple
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={uploadedFiles.length >= 5}
                            />
                            <span 
                              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                uploadedFiles.length >= 5 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-black hover:bg-gray-800 cursor-pointer'
                              } text-white`}
                            >
                              <Upload className="w-4 h-4" />
                              رفع سيرة ذاتية ({uploadedFiles.length}/5)
                            </span>
                          </label>

                          {/* Uploaded Files List */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-6 space-y-3">
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-800 truncate">{file.name}</p>
                                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDownloadFile(file.url, file.name)}
                                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                      title="تنزيل الملف"
                                    >
                                      <Download className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveFile(file.path, index)}
                                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                      title="حذف الملف"
                                    >
                                      <X className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Info Message */}
                          {uploadedFiles.length === 0 && (
                            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-blue-800">
                                لم يتم رفع أي ملفات سيرة ذاتية بعد
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Info Tab */}
                {activeTab === "info" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl text-gray-800">المعلومات الأساسية</h2>
                      {!editing && (
                        <Button
                          onClick={() => setEditing(true)}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-700 mb-2 block">الاسم</Label>
                        {editing ? (
                          <Input
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({ ...profileData, name: e.target.value })
                            }
                            className="text-right"
                          />
                        ) : (
                          <p className="text-gray-800">{profileData.name}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-700 mb-2 block">البريد الإلكتروني</Label>
                        <p className="text-gray-800">{profileData.email}</p>
                      </div>

                      <div>
                        <Label className="text-gray-700 mb-2 block">رقم الهاتف</Label>
                        {editing ? (
                          <Input
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({ ...profileData, phone: e.target.value })
                            }
                            className="text-right"
                            placeholder="غير محدد"
                          />
                        ) : (
                          <p className="text-gray-800">{profileData.phone || "غير محدد"}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-700 mb-2 block">الموقع</Label>
                        {editing ? (
                          <Input
                            value={profileData.location}
                            onChange={(e) =>
                              setProfileData({ ...profileData, location: e.target.value })
                            }
                            className="text-right"
                          />
                        ) : (
                          <p className="text-gray-800">{profileData.location}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-700 mb-2 block">التخصص</Label>
                        {editing ? (
                          <Input
                            value={profileData.specialty}
                            onChange={(e) =>
                              setProfileData({ ...profileData, specialty: e.target.value })
                            }
                            className="text-right"
                          />
                        ) : (
                          <p className="text-gray-800">{profileData.specialty}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-700 mb-2 block">الخبرة</Label>
                        {editing ? (
                          <Input
                            value={profileData.experience}
                            onChange={(e) =>
                              setProfileData({ ...profileData, experience: e.target.value })
                            }
                            className="text-right"
                            placeholder="غير محدد"
                          />
                        ) : (
                          <p className="text-gray-800">{profileData.experience || "غير محدد"}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-700 mb-2 block">المهارات</Label>
                      {editing ? (
                        <Textarea
                          value={profileData.skills}
                          onChange={(e) =>
                            setProfileData({ ...profileData, skills: e.target.value })
                          }
                          className="text-right"
                          placeholder="لا توجد مهارات محددة"
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-800">{profileData.skills || "لا توجد مهارات محددة"}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-700 mb-2 block">نبذة عني</Label>
                      {editing ? (
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({ ...profileData, bio: e.target.value })
                          }
                          className="text-right"
                          placeholder="غير محدد"
                          rows={4}
                        />
                      ) : (
                        <p className="text-gray-800">{profileData.bio || "غير محدد"}</p>
                      )}
                    </div>

                    {editing && (
                      <div className="flex gap-3 justify-end pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setEditing(false)}
                          disabled={loading}
                        >
                          إلغاء
                        </Button>
                        <Button
                          onClick={handleUpdateProfile}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={loading}
                        >
                          {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FileText, 
  Sparkles, 
  Crown, 
  ArrowRight,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function CVBuilderPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedCV, setGeneratedCV] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    summary: "",
    skills: "",
    experience: "",
    education: "",
    languages: "العربية، الإنجليزية",
    certifications: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        navigate("/login", { state: { message: "يرجى تسجيل الدخول للوصول إلى أدوات Premium" } });
        return;
      }

      setUser(session.user);
      await checkPremiumStatus(session.user.id);
    } catch (err) {
      console.error("Auth check error:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const checkPremiumStatus = async (userId: string) => {
    try {
      const { data: premiumSub, error } = await supabase
        .from("premium_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (premiumSub && premiumSub.status === 'active') {
        const endDate = new Date(premiumSub.end_date);
        const now = new Date();
        setIsPremium(endDate > now);
      } else {
        setIsPremium(false);
      }
    } catch (err) {
      console.error("Error checking premium status:", err);
      setIsPremium(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGenerateCV = async () => {
    setError("");
    setSuccess("");
    setGenerating(true);

    // Validation
    if (!formData.fullName || !formData.email || !formData.jobTitle) {
      setError("يرجى ملء الحقول المطلوبة (الاسم، البريد، المسمى الوظيفي)");
      setGenerating(false);
      return;
    }

    try {
      // Simulate AI generation (في الإنتاج، يجب الاتصال بـ API مثل OpenAI)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const cv = `
===========================================
السيرة الذاتية
===========================================

${formData.fullName}
${formData.jobTitle}
${formData.email} | ${formData.phone}
${formData.location}

-------------------------------------------
نبذة مختصرة
-------------------------------------------
${formData.summary || "محترف متحمس يسعى للتميز في مجال " + formData.jobTitle + " مع خبرة واسعة في تطوير الحلول المبتكرة والعمل ضمن فرق متعددة التخصصات."}

-------------------------------------------
المهارات
-------------------------------------------
${formData.skills || "مهارات تقنية متقدمة، مهارات التواصل، العمل الجماعي، حل المشكلات"}

-------------------------------------------
الخبرة العملية
-------------------------------------------
${formData.experience || "لم يتم إدخال خبرة عملية"}

-------------------------------------------
التعليم
-------------------------------------------
${formData.education || "لم يتم إدخال معلومات تعليمية"}

-------------------------------------------
اللغات
-------------------------------------------
${formData.languages}

${formData.certifications ? `
-------------------------------------------
الشهادات
-------------------------------------------
${formData.certifications}
` : ""}

-------------------------------------------
تم التوليد بواسطة منصة عُمان للوظائف Premium ✨
-------------------------------------------
      `;

      setGeneratedCV(cv.trim());
      setSuccess("تم توليد السيرة الذاتية بنجاح! 🎉");
      
      // Scroll to result
      setTimeout(() => {
        document.getElementById("generated-cv")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError("حدث خطأ أثناء توليد السيرة الذاتية");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCV = () => {
    const blob = new Blob([generatedCV], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CV_${formData.fullName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCV = () => {
    navigator.clipboard.writeText(generatedCV);
    setSuccess("تم نسخ السيرة الذاتية! ✓");
    setTimeout(() => setSuccess(""), 2000);
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

  // Non-Premium User View
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl text-gray-800 mb-4">
                هذه الخدمة متاحة لمشتركي Premium فقط
              </h1>
              
              <p className="text-gray-600 mb-8 text-lg">
                اشترك الآن للوصول إلى أداة توليد السيرة الذاتية بالذكاء الاصطناعي وجميع المميزات الأخرى
              </p>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  مميزات Premium
                </h3>
                <ul className="space-y-3 text-right">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">توليد سيرة ذاتية احترافية بالذكاء الاصطناعي</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">توليد رسالة تعريف (Cover Letter) مخصصة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">أولوية في ظهور الملف الشخصي</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">إشعارات فورية بالوظائف الجديدة</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/premium">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-6 text-lg">
                    <Crown className="w-5 h-5 ml-2" />
                    اشترك في Premium الآن
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="px-8 py-6 text-lg">
                    العودة للملف الشخصي
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Premium User View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl text-gray-800">توليد السيرة الذاتية</h1>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    بواسطة الذكاء الاصطناعي
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
                  <Crown className="w-4 h-4" />
                  Premium نشط
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm leading-relaxed">
                <strong>كيف تعمل؟</strong> املأ النموذج أدناه بمعلوماتك الشخصية والمهنية، وسيقوم الذكاء الاصطناعي بتوليد سيرة ذاتية احترافية ومنسقة جاهزة للاستخدام في دقائق!
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && !generatedCV && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl text-gray-800 mb-6">معلوماتك الشخصية</h2>

            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الاسم الكامل *
                  </Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="أحمد محمد الرواحي"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ahmed@example.com"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+968 9123 4567"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    الموقع
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="مسقط، عُمان"
                    className="text-right"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <Label className="text-gray-700 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  المسمى الوظيفي *
                </Label>
                <Input
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  placeholder="مطور برمجيات Full Stack"
                  className="text-right"
                />
              </div>

              {/* Summary */}
              <div>
                <Label className="text-gray-700 mb-2 block">نبذة مختصرة</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  placeholder="اكتب نبذة مختصرة عنك وعن أهدافك المهنية..."
                  className="text-right"
                  rows={3}
                />
              </div>

              {/* Skills */}
              <div>
                <Label className="text-gray-700 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  المهارات
                </Label>
                <Textarea
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="مثال: React, Node.js, Python, تصميم قواعد البيانات، إدارة المشاريع..."
                  className="text-right"
                  rows={3}
                />
              </div>

              {/* Experience */}
              <div>
                <Label className="text-gray-700 mb-2 block">الخبرة العملية</Label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="مثال:&#10;مطور Full Stack - شركة ABC (2020-2023)&#10;- تطوير تطبيقات ويب باستخدام React وNode.js&#10;- إدارة قواعد بيانات MongoDB"
                  className="text-right"
                  rows={5}
                />
              </div>

              {/* Education */}
              <div>
                <Label className="text-gray-700 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  التعليم
                </Label>
                <Textarea
                  value={formData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  placeholder="مثال: بكالوريوس علوم الحاسوب - جامعة السلطان قابوس (2016-2020)"
                  className="text-right"
                  rows={3}
                />
              </div>

              {/* Languages */}
              <div>
                <Label className="text-gray-700 mb-2 block">اللغات</Label>
                <Input
                  value={formData.languages}
                  onChange={(e) => handleInputChange("languages", e.target.value)}
                  placeholder="العربية، الإنجليزية"
                  className="text-right"
                />
              </div>

              {/* Certifications */}
              <div>
                <Label className="text-gray-700 mb-2 block">الشهادات (اختياري)</Label>
                <Textarea
                  value={formData.certifications}
                  onChange={(e) => handleInputChange("certifications", e.target.value)}
                  placeholder="مثال: AWS Certified Developer، Google Cloud Professional"
                  className="text-right"
                  rows={2}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleGenerateCV}
                disabled={generating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 ml-2" />
                    توليد السيرة الذاتية الآن
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated CV */}
          {generatedCV && (
            <div id="generated-cv" className="bg-white rounded-2xl shadow-xl p-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-800 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  السيرة الذاتية الجاهزة
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyCV}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    نسخ
                  </Button>
                  <Button
                    onClick={handleDownloadCV}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <pre className="whitespace-pre-wrap text-right text-gray-800 font-sans leading-relaxed">
                  {generatedCV}
                </pre>
              </div>

              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">
                  تم توليد السيرة الذاتية بنجاح! يمكنك الآن نسخها أو تحميلها واستخدامها في طلبات التوظيف.
                </p>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link to="/premium">
              <Button variant="outline" className="px-8">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة لصفحة Premium
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
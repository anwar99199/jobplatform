import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, 
  Sparkles, 
  Crown, 
  ArrowRight,
  User,
  Briefcase,
  Building,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function CoverLetterPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");

  const [formData, setFormData] = useState({
    applicantName: "",
    jobTitle: "",
    companyName: "",
    recipientName: "",
    skills: "",
    experience: "",
    motivation: ""
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

  const handleGenerateLetter = async () => {
    setError("");
    setSuccess("");
    setGenerating(true);

    // Validation
    if (!formData.applicantName || !formData.jobTitle || !formData.companyName) {
      setError("يرجى ملء الحقول المطلوبة (الاسم، الوظيفة، اسم الشركة)");
      setGenerating(false);
      return;
    }

    try {
      // Simulate AI generation (في الإنتاج، يجب الاتصال بـ API مثل OpenAI)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const today = new Date().toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const letter = `
${formData.applicantName}
${today}

${formData.recipientName ? `السيد/ة ${formData.recipientName}` : "إلى من يهمه الأمر"}
${formData.companyName}

السلام عليكم ورحمة الله وبركاته،

الموضوع: طلب التقديم على وظيفة ${formData.jobTitle}

يسعدني أن أتقدم بطلبي للحصول على وظيفة ${formData.jobTitle} في ${formData.companyName}. أنا ${formData.applicantName}، وأمتلك ${formData.experience || "خبرة واسعة"} في هذا المجال.

${formData.motivation || `أنا متحمس جداً للانضمام إلى فريق ${formData.companyName} المحترم، حيث أرى أن قيم الشركة وأهدافها تتماشى مع طموحاتي المهنية. أؤمن بأن خبرتي ومهاراتي ستساهم بشكل فعال في تحقيق أهداف الشركة ونموها المستمر.`}

من أبرز مهاراتي:
${formData.skills ? formData.skills.split(',').map(s => `• ${s.trim()}`).join('\n') : "• مهارات تقنية متقدمة\n• العمل الجماعي والقيادة\n• حل المشكلات بطرق مبتكرة"}

أنا على ثقة بأن خبرتي العملية ومهاراتي المتنوعة ستمكنني من تقديم إضافة قيمة لفريقكم الموقر. أتطلع بشغف لفرصة مناقشة مؤهلاتي معكم بشكل أكبر في مقابلة شخصية.

شاكراً لكم حسن اهتمامكم، وأتطلع للسماع منكم قريباً.

مع خالص التقدير والاحترام،
${formData.applicantName}

---
تم التوليد بواسطة منصة عُمان للوظائف Premium ✨
      `;

      setGeneratedLetter(letter.trim());
      setSuccess("تم توليد رسالة التعريف بنجاح! 🎉");
      
      // Scroll to result
      setTimeout(() => {
        document.getElementById("generated-letter")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError("حدث خطأ أثناء توليد رسالة التعريف");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CoverLetter_${formData.companyName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    setSuccess("تم نسخ رسالة التعريف! ✓");
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
                اشترك الآن للوصول إلى أداة توليد رسالة التعريف بالذكاء الاصطناعي وجميع المميزات الأخرى
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl text-gray-800">توليد رسالة التعريف</h1>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Cover Letter بواسطة الذكاء الاصطناعي
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

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-purple-800 text-sm leading-relaxed">
                <strong>كيف تعمل؟</strong> املأ النموذج أدناه بمعلومات الوظيفة والشركة التي تتقدم لها، وسيقوم الذكاء الاصطناعي بتوليد رسالة تعريف احترافية ومخصصة تزيد من فرصك في الحصول على المقابلة!
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

          {success && !generatedLetter && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl text-gray-800 mb-6">معلومات الطلب</h2>

            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    اسمك الكامل *
                  </Label>
                  <Input
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange("applicantName", e.target.value)}
                    placeholder="أحمد محمد الرواحي"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    الوظيفة المتقدم لها *
                  </Label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    placeholder="مطور برمجيات Full Stack"
                    className="text-right"
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    اسم الشركة *
                  </Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="شركة التقنية المتقدمة"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    اسم المسؤول (اختياري)
                  </Label>
                  <Input
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    placeholder="مدير التوظيف"
                    className="text-right"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-gray-700 mb-2 block">مهاراتك الرئيسية</Label>
                <Textarea
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="مثال: React, Node.js, Python, إدارة المشاريع، التواصل الفعال..."
                  className="text-right"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">افصل المهارات بفواصل</p>
              </div>

              {/* Experience */}
              <div>
                <Label className="text-gray-700 mb-2 block">خبرتك ذات الصلة</Label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="مثال: 5 سنوات خبرة في تطوير تطبيقات الويب باستخدام React وNode.js"
                  className="text-right"
                  rows={3}
                />
              </div>

              {/* Motivation */}
              <div>
                <Label className="text-gray-700 mb-2 block">لماذا تريد العمل في هذه الشركة؟</Label>
                <Textarea
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  placeholder="اكتب سبب رغبتك في الانضمام لهذه الشركة وما يميزك..."
                  className="text-right"
                  rows={4}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleGenerateLetter}
                disabled={generating}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 ml-2" />
                    توليد رسالة التعريف الآن
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Letter */}
          {generatedLetter && (
            <div id="generated-letter" className="bg-white rounded-2xl shadow-xl p-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-800 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  رسالة التعريف الجاهزة
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLetter}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    نسخ
                  </Button>
                  <Button
                    onClick={handleDownloadLetter}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <pre className="whitespace-pre-wrap text-right text-gray-800 font-sans leading-relaxed">
                  {generatedLetter}
                </pre>
              </div>

              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">
                  تم توليد رسالة التعريف بنجاح! يمكنك الآن نسخها أو تحميلها وإرفاقها مع طلب التوظيف.
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
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Linkedin,
  MessageCircle,
  Upload,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Crown,
  ArrowRight,
  ExternalLink,
  Share2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function DigitalCardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cardExists, setCardExists] = useState(false);
  const [cardId, setCardId] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    job_title: "",
    phone: "",
    email: "",
    whatsapp: "",
    linkedin: "",
    bio: "",
    profile_image_url: "",
    cv_url: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        navigate("/login", { state: { message: "يرجى تسجيل الدخول للوصول إلى البطاقة الرقمية" } });
        return;
      }

      setUser(session.user);
      await checkPremiumStatus(session.user.id);
      await loadCardData(session.user.id);
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

  const loadCardData = async (userId: string) => {
    try {
      const { data: card, error } = await supabase
        .from("digital_cards")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (card) {
        setCardExists(true);
        setCardId(card.id);
        setFormData({
          full_name: card.full_name || "",
          job_title: card.job_title || "",
          phone: card.phone || "",
          email: card.email || "",
          whatsapp: card.whatsapp || "",
          linkedin: card.linkedin || "",
          bio: card.bio || "",
          profile_image_url: card.profile_image_url || "",
          cv_url: card.cv_url || ""
        });
      } else {
        // تعبئة البيانات من ملف المستخدم
        const { data: userData } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", userId)
          .single();

        if (userData) {
          setFormData(prev => ({
            ...prev,
            full_name: userData.name || "",
            email: userData.email || ""
          }));
        }
      }
    } catch (err) {
      console.error("Error loading card:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB max for images)
    if (file.size > 2 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("يرجى اختيار صورة فقط");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile_image');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/upload-card-file`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "فشل رفع الصورة");
        return;
      }

      setFormData(prev => ({ ...prev, profile_image_url: data.url }));
      setSuccess("تم رفع الصورة بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Image upload error:", err);
      setError("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB max for CV)
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      setError("يرجى اختيار ملف PDF فقط");
      return;
    }

    setUploadingCV(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'cv');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/upload-card-file`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "فشل رفع السيرة الذاتية");
        return;
      }

      setFormData(prev => ({ ...prev, cv_url: data.url }));
      setSuccess("تم رفع السيرة الذاتية بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("CV upload error:", err);
      setError("حدث خطأ أثناء رفع السيرة الذاتية");
    } finally {
      setUploadingCV(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("يرجى تسجيل الدخول أولاً");
        setSaving(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/digital-card`,
        {
          method: cardExists ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "فشل حفظ البطاقة");
        setSaving(false);
        return;
      }

      setCardExists(true);
      setCardId(data.cardId);
      setSuccess(cardExists ? "تم تحديث البطاقة بنجاح!" : "تم إنشاء بطاقتك الرقمية بنجاح!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/card/${cardId}`;
    
    // Use fallback method directly to avoid clipboard API errors
    fallbackCopyTextToClipboard(link);
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    // Create temporary textarea
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Position off-screen
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    textArea.style.opacity = "0";
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    // Select the text
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      // iOS specific
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } else {
        // Show alert as last resort
        prompt("انسخ هذا الرابط:", text);
      }
    } catch (err) {
      document.body.removeChild(textArea);
      // Show prompt dialog for manual copy
      prompt("انسخ هذا الرابط:", text);
    }
  };

  const handleShareCard = async () => {
    const link = `${window.location.origin}/card/${cardId}`;
    
    // Check if we're on HTTPS or localhost
    const isSecureContext = window.isSecureContext;
    
    console.log('Is secure context (HTTPS):', isSecureContext);
    console.log('Share API supported:', !!navigator.share);
    
    // Build share text
    let shareText = `${formData.full_name}`;
    if (formData.job_title) {
      shareText += ` - ${formData.job_title}`;
    }
    shareText += `\n\nشاهد بطاقتي الرقمية:\n${link}`;
    
    // Only use Share API if it's supported AND we're in secure context
    if (navigator.share && isSecureContext) {
      const shareData = {
        title: `${formData.full_name} - البطاقة الرقمية`,
        text: shareText,
      };

      try {
        await navigator.share(shareData);
        console.log('Card shared successfully');
        return;
      } catch (err: any) {
        console.error('Share error:', err);
        // If user didn't cancel, try fallback
        if (err.name !== 'AbortError') {
          console.log('Share failed, trying WhatsApp fallback');
        } else {
          // User cancelled
          return;
        }
      }
    }
    
    // Fallback: Try WhatsApp Web (works on all devices)
    tryWhatsAppShare(shareText);
  };

  const tryWhatsAppShare = (text: string) => {
    // Encode the message for URL
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    
    // Try to open WhatsApp
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    
    // If popup was blocked or failed, fallback to copy
    setTimeout(() => {
      if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
        console.log('WhatsApp failed, using copy fallback');
        handleCopyLink();
      }
    }, 1000);
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

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl text-gray-800 mb-4">البطاقة الرقمية - ميزة حصية</h2>
              <p className="text-gray-600 mb-6">
                هذه الميزة متاحة فقط لمشتركي Premium. اشترك الآن للحصول على بطاقتك الرقمية الاحترافية!
              </p>
              <Link to="/premium">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Crown className="w-4 h-4 ml-2" />
                  الترقية إلى Premium
                </Button>
              </Link>
              <Link to="/profile" className="block mt-4">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 ml-2" />
                  العودة للملف الشخصي
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/premium" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى خدمات Premium
          </Link>
          <h1 className="text-3xl text-gray-800 mb-2">بطاقتي الرقمية</h1>
          <p className="text-gray-600">
            أنشئ بطاقة رقمية احترافية تعرض معلوماتك وتسهل التواصل معك
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl text-gray-800 mb-6">معلومات البطاقة</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div>
                <Label className="text-gray-700 mb-2 block">الصورة الشخصية</Label>
                <div className="flex items-center gap-4">
                  {formData.profile_image_url ? (
                    <img
                      src={formData.profile_image_url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700">
                      <ImageIcon className="w-4 h-4" />
                      {uploadingImage ? "جاري الرفع..." : "رفع صورة"}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">صورة بصيغة JPG أو PNG (أقل من 2 ميجابايت)</p>
              </div>

              {/* Full Name */}
              <div>
                <Label className="text-gray-700 mb-2 block">الاسم الكامل *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                  required
                  className="text-right"
                />
              </div>

              {/* Job Title */}
              <div>
                <Label className="text-gray-700 mb-2 block">المسمى الوظيفي</Label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="مثال: مطور تطبيقات ويب"
                  className="text-right"
                />
              </div>

              {/* Phone */}
              <div>
                <Label className="text-gray-700 mb-2 block">رقم الهاتف</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="مثال: +968 9123 4567"
                  className="text-right"
                  dir="ltr"
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-gray-700 mb-2 block">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="text-right"
                  dir="ltr"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <Label className="text-gray-700 mb-2 block">رقم الواتساب</Label>
                <Input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="مثال: 96891234567"
                  className="text-right"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">أدخل الرقم مع رمز الدولة بدون علامة +</p>
              </div>

              {/* LinkedIn */}
              <div>
                <Label className="text-gray-700 mb-2 block">حساب LinkedIn</Label>
                <Input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="text-right"
                  dir="ltr"
                />
              </div>

              {/* Bio */}
              <div>
                <Label className="text-gray-700 mb-2 block">نبذة شخصية</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="اكتب نبذة قصيرة عنك..."
                  rows={4}
                  className="text-right"
                />
              </div>

              {/* CV Upload */}
              <div>
                <Label className="text-gray-700 mb-2 block">السيرة الذاتية (PDF)</Label>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      className="hidden"
                      disabled={uploadingCV}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700">
                      <FileText className="w-4 h-4" />
                      {uploadingCV ? "جاري الرفع..." : "رفع السيرة الذاتية"}
                    </span>
                  </label>
                  {formData.cv_url && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      تم رفع السيرة الذاتية
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">ملف PDF (أقل من 5 ميجابايت)</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saving || !formData.full_name}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? "جاري الحفظ..." : cardExists ? "تحديث البطاقة" : "إنشاء البطاقة"}
              </Button>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl text-gray-800 mb-6">معاينة البطاقة</h2>
            
            {cardExists && (
              <div className="mb-6 space-y-3">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                >
                  {linkCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ رابط البطاقة
                    </>
                  )}
                </Button>
                <Link to={`/card/${cardId}`} target="_blank">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 ml-2" />
                    عرض البطاقة
                  </Button>
                </Link>
                <Button
                  onClick={handleShareCard}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة البطاقة
                </Button>
              </div>
            )}

            {/* Card Preview */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 text-white">
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                {formData.profile_image_url ? (
                  <img
                    src={formData.profile_image_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-yellow-500">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div className="text-center mb-6">
                <h3 className="text-2xl mb-2">
                  {formData.full_name || "الاسم الكامل"}
                </h3>
                {formData.job_title && (
                  <p className="text-yellow-500">{formData.job_title}</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 my-6"></div>

              {/* Contact Info */}
              <div className="space-y-4">
                {formData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-yellow-500" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-yellow-500" />
                    <span>واتساب</span>
                  </div>
                )}
                {formData.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm break-all">{formData.email}</span>
                  </div>
                )}
                {formData.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">LinkedIn</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {formData.bio && (
                <>
                  <div className="border-t border-gray-700 my-6"></div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {formData.bio}
                  </p>
                </>
              )}

              {/* CV Download */}
              {formData.cv_url && (
                <div className="mt-6">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    <FileText className="w-4 h-4 ml-2" />
                    تحميل السيرة الذاتية
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DigitalCardPage;
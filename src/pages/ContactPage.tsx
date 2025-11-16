import { useState } from "react";
import { Mail, Phone, MessageSquare, Send, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    requestType: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      requestType: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسمك الكامل");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("يرجى إدخال بريدك الإلكتروني");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return false;
    }

    if (!formData.requestType) {
      toast.error("يرجى اختيار نوع الطلب");
      return false;
    }

    if (!formData.message.trim()) {
      toast.error("يرجى كتابة رسالتك");
      return false;
    }

    if (formData.message.trim().length < 10) {
      toast.error("الرسالة يجب أن تكون 10 أحرف على الأقل");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Send to server API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          requestType: formData.requestType,
          message: formData.message.trim()
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Error from server:", result.error);
        toast.error(result.error || "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
        return;
      }

      // Success
      setSubmitted(true);
      toast.success("تم إرسال رسالتك بنجاح!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        requestType: "",
        message: ""
      });

      // Reset submitted state after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 bg-white/10 rounded-full mb-6">
            <MessageSquare className="w-12 h-12" />
          </div>
          <h1 className="text-4xl mb-4">تواصل معنا</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
            يسعدنا تواصلك معنا! إذا كان لديك أي استفسار حول الوظائف، الخدمات المميزة، أو الدعم الفني، فريقنا جاهز لمساعدتك طوال الوقت.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          {submitted ? (
            // Success Message
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-green-50 rounded-full mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-2xl text-gray-800 mb-4">تم إرسال رسالتك بنجاح!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                شكراً لتواصلك معنا. سيتم الرد على استفسارك في أقرب وقت ممكن.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-red-600 hover:bg-red-700"
              >
                إرسال رسالة أخرى
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl text-gray-800 mb-2">نموذج التواصل</h2>
                <p className="text-gray-600">
                  املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    الاسم الكامل <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    البريد الإلكتروني <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={loading}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    رقم الهاتف <span className="text-gray-500 text-sm">(اختياري)</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+968 XXXX XXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={loading}
                  />
                </div>

                {/* Request Type */}
                <div className="space-y-2">
                  <Label htmlFor="requestType" className="text-gray-700">
                    نوع الطلب <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.requestType}
                    onValueChange={handleSelectChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر نوع الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">استفسار عام</SelectItem>
                      <SelectItem value="technical">مشكلة تقنية</SelectItem>
                      <SelectItem value="refund">استرداد مبلغ / اشتراك</SelectItem>
                      <SelectItem value="ai-service">خدمة الذكاء الاصطناعي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700">
                    الرسالة <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="اكتب رسالتك أو استفسارك هنا..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full min-h-[150px] resize-y"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    عدد الأحرف: {formData.message.length} / 500 حرف على الأقل 10
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-5 w-5" />
                      إرسال
                    </>
                  )}
                </Button>
              </form>

              {/* Response Note */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm">
                  <strong>ملاحظة:</strong> سيتم التواصل معك عبر البريد الإلكتروني أو WhatsApp خلال أقرب وقت.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
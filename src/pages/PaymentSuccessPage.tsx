import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, Crown, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { supabase } from "../utils/supabase/client";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const transactionRef = searchParams.get("ref");
    
    if (!transactionRef) {
      toast.error("لم يتم العثور على معرف الدفع");
      navigate("/premium");
      return;
    }

    verifyPayment(transactionRef);
  }, [searchParams, navigate]);

  const verifyPayment = async (transactionRef: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/payment/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ transactionRef })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage(data.message || "تم تفعيل اشتراكك بنجاح!");
        toast.success("تم تفعيل اشتراكك بنجاح!");
        // حذف الباقة المحفوظة بعد النجاح
        localStorage.removeItem("selectedPlan");
      } else {
        setSuccess(false);
        setMessage(data.error || "فشل التحقق من الدفع");
        toast.error(data.error || "فشل التحقق من الدفع");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setSuccess(false);
      setMessage("حدث خطأ أثناء التحقق من الدفع");
      toast.error("حدث خطأ أثناء التحقق من الدفع");
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = async () => {
    try {
      // الحصول على الباقة المحفوظة من localStorage
      const selectedPlan = localStorage.getItem("selectedPlan");
      
      if (!selectedPlan) {
        toast.error("لم يتم العثور على معلومات الباقة");
        navigate("/premium");
        return;
      }

      // التحقق من تسجيل الدخول
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("يرجى تسجيل الدخول أولاً");
        navigate("/login");
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email || "";
      const userName = session.user.user_metadata?.name || "";

      // إنشاء جلسة دفع جديدة
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/payment/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            planType: selectedPlan,
            userId,
            userEmail,
            userName
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Payment session creation failed:", data);
        toast.error(data.error || "فشل إنشاء جلسة الدفع");
        return;
      }

      // التوجيه إلى صفحة الدفع
      if (data.checkoutUrl) {
        toast.success("جاري التوجيه إلى صفحة الدفع...");
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("لم يتم الحصول على رابط الدفع");
      }

    } catch (error) {
      console.error("Error retrying payment:", error);
      toast.error("حدث خطأ أثناء إعادة المحاولة");
    }
  };

  if (verifying) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Loader2 className="w-20 h-20 text-red-600 animate-spin" />
          </div>
          <h1 className="text-3xl mb-4 text-gray-800">جاري التحقق من الدفع...</h1>
          <p className="text-xl text-gray-600">
            يرجى الانتظار بينما نتحقق من عملية الدفع الخاصة بك
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl mb-4 text-gray-800">تم بنجاح! 🎉</h1>
          <p className="text-xl text-gray-600 mb-8">{message}</p>

          {/* Premium Badge */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-8 mb-8">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl mb-3 text-gray-800">أنت الآن عضو Premium!</h2>
            <p className="text-lg text-gray-700">
              استمتع بجميع الميزات الحصرية المتاحة لك الآن
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/premium")}
              className="bg-red-600 text-white hover:bg-red-700 py-6 px-8 text-lg"
            >
              استكشف الخدمات المتاحة
              <ArrowRight className="mr-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 py-6 px-8 text-lg"
            >
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">❌</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl mb-4 text-gray-800">فشلت عملية الدفع</h1>
        <p className="text-xl text-gray-600 mb-8">{message}</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            className="bg-red-600 text-white hover:bg-red-700 py-6 px-8 text-lg"
          >
            حاول مرة أخرى
            <ArrowRight className="mr-2 w-5 h-5" />
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50 py-6 px-8 text-lg"
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
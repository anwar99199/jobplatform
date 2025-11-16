import { CheckCircle, Crown, ArrowRight, Loader2, Sparkles, FileText, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const transactionRef = searchParams.get("transaction_ref") || searchParams.get("ref");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transactionRef) {
        toast.error("معرف المعاملة مفقود");
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/payment/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ transactionRef }),
          }
        );

        const result = await response.json();

        if (result.success) {
          setVerified(true);
          setSubscription(result.subscription);
          toast.success(result.message || "تم تفعيل اشتراكك بنجاح!");
        } else {
          toast.error(result.error || "فشل التحقق من الدفع");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("حدث خطأ أثناء التحقق من الدفع");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [transactionRef]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl mb-2 text-gray-800">جاري التحقق من الدفع...</h2>
          <p className="text-gray-600">الرجاء الانتظار بينما نقوم بتأكيد اشتراكك</p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl mb-4 text-gray-800">فشل التحقق من الدفع</h1>
          <p className="text-gray-600 mb-8">
            لم نتمكن من التحقق من عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
          </p>
          <div className="flex gap-4">
            <Link to="/premium" className="flex-1">
              <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                العودة للباقات
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                الصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-12 text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-8 animate-bounce">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>

        {/* Crown Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6">
          <Crown className="w-10 h-10 text-white" />
        </div>

        {/* Success Message */}
        <h1 className="text-4xl mb-4 text-gray-800">مبروك! 🎉</h1>
        <p className="text-xl text-gray-700 mb-2">تم تفعيل اشتراكك Premium بنجاح</p>
        <p className="text-gray-600 mb-8">
          يمكنك الآن الوصول إلى جميع الميزات الحصرية
        </p>

        {/* Subscription Details */}
        {subscription && (
          <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-6 mb-8 text-right">
            <h3 className="text-xl mb-4 text-gray-800">تفاصيل الاشتراك:</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">نوع الباقة:</span>{" "}
                {subscription.planType === "yearly" ? "سنوي" : "نصف سنوي"}
              </p>
              <p>
                <span className="font-medium">تاريخ البداية:</span>{" "}
                {new Date(subscription.startDate || subscription.start_date).toLocaleDateString("ar-EG")}
              </p>
              <p>
                <span className="font-medium">تاريخ الانتهاء:</span>{" "}
                {new Date(subscription.endDate || subscription.end_date).toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>
        )}

        {/* Premium Features */}
        <div className="mb-8">
          <h3 className="text-xl mb-6 text-gray-800">الميزات المتاحة لك الآن:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
            {[
              "توليد Cover Letter بالذكاء الاصطناعي",
              "توليد CV بنظام ATS",
              "بطاقة رقمية احترافية",
              "تحليل التوافق مع الوظائف",
              "إشعارات فورية",
              "دعم فني مخصص"
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/premium/cover-letter">
            <Button className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 px-8 py-6">
              <Sparkles className="ml-2 w-5 h-5" />
              ابدأ باستخدام Cover Letter AI
            </Button>
          </Link>
          <Link to="/premium/cv-builder">
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 px-8 py-6">
              <FileText className="ml-2 w-5 h-5" />
              أنشئ CV احترافي
            </Button>
          </Link>
          <Link to="/premium/job-match">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-8 py-6">
              <TrendingUp className="ml-2 w-5 h-5" />
              تحليل التوافق مع الوظائف
            </Button>
          </Link>
        </div>

        {/* Return Home */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link to="/">
            <Button variant="outline" className="text-gray-600 hover:text-red-600">
              <ArrowRight className="ml-2 w-4 h-4" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
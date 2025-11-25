import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, AlertCircle, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner@2.0.3";

export function PaymentSandboxPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  
  // بيانات البطاقة القابلة للتعديل
  const [cardNumber, setCardNumber] = useState("4111111111111111");
  const [cardExpiry, setCardExpiry] = useState("12/25");
  const [cardCvv, setCardCvv] = useState("123");
  const [cardHolder, setCardHolder] = useState("TEST CARDHOLDER");

  const transactionRef = searchParams.get("ref");
  const amount = searchParams.get("amount");
  const plan = searchParams.get("plan");

  const planName = plan === "yearly" ? "سنوي" : "نصف سنوي";

  // دالة تنسيق رقم البطاقة
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  // دالة تنسيق تاريخ الانتهاء
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // دالة إتمام الدفع
  const handlePayment = async () => {
    // التحقق من البيانات
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    
    if (cleanedCardNumber.length !== 16) {
      toast.error("رقم البطاقة يجب أن يكون 16 رقم");
      return;
    }
    
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      toast.error("تاريخ الانتهاء غير صحيح");
      return;
    }
    
    if (cardCvv.length !== 3) {
      toast.error("رمز CVV يجب أن يكون 3 أرقام");
      return;
    }

    if (!cardHolder.trim()) {
      toast.error("يرجى إدخال اسم حامل البطاقة");
      return;
    }

    setProcessing(true);

    try {
      // في وضع Sandbox، نحاكي نجاح الدفع مباشرة
      // في الإنتاج الحقيقي، سيتم إرسال البيانات إلى Amwal Pay
      
      // محاكاة وقت المعالجة
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // التوجيه لصفحة نجاح الدفع
      toast.success("تم إتمام الدفع بنجاح!");
      navigate(`/payment/success?ref=${transactionRef}`);
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("حدث خطأ أثناء معالجة الدفع");
      setProcessing(false);
    }
  };

  if (!transactionRef) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl mb-4 text-gray-800">معلومات غير مكتملة</h1>
          <Button onClick={() => navigate("/premium")} className="bg-red-600 hover:bg-red-700">
            العودة للباقات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Sandbox Notice */}
        <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl text-blue-900">وضع الاختبار - Amwal Pay Sandbox</h3>
          </div>
          <p className="text-blue-800 mb-2">
            استخدم بيانات البطاقة الوهمية التالية المقدمة من Amwal Pay للاختبار:
          </p>
          <div className="bg-blue-100 rounded-lg p-4 font-mono text-sm text-blue-900">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-blue-600">رقم البطاقة:</span>
                <span>4111 1111 1111 1111</span>
              </div>
              <div>
                <span className="block text-blue-600">تاريخ الانتهاء:</span>
                <span>أي تاريخ مستقبلي</span>
              </div>
              <div>
                <span className="block text-blue-600">CVV:</span>
                <span>أي 3 أرقام</span>
              </div>
              <div>
                <span className="block text-blue-600">الاسم:</span>
                <span>أي اسم</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <CreditCard className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl mb-2 text-gray-800">إتمام الدفع</h1>
            <p className="text-gray-600">صفحة دفع آمنة - Amwal Pay Sandbox</p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl mb-4 text-gray-800">تفاصيل الدفع</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">الباقة:</span>
                <span className="text-gray-900">{planName}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">المبلغ:</span>
                <span className="text-2xl text-red-600">{amount} ريال عماني</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">رقم المعاملة:</span>
                <span className="text-sm text-gray-700 font-mono">{transactionRef}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6 mb-8">
            {/* Card Number */}
            <div>
              <label className="block mb-2 text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                رقم البطاقة
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label className="block mb-2 text-gray-700">تاريخ الانتهاء</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  maxLength={5}
                />
              </div>
              
              {/* CVV */}
              <div>
                <label className="block mb-2 text-gray-700">CVV</label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  maxLength={3}
                />
              </div>
            </div>

            {/* Card Holder Name */}
            <div>
              <label className="block mb-2 text-gray-700">اسم حامل البطاقة</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="CARDHOLDER NAME"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Pay Now Button */}
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 text-xl"
          >
            {processing ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري معالجة الدفع...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Lock className="w-5 h-5" />
                ادفع الآن {amount} ر.ع
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>معاملة آمنة ومشفرة - Powered by Amwal Pay</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <h3 className="text-lg mb-2 text-green-900">✅ نظام الدفع جاهز!</h3>
          <p className="text-green-800 mb-3">
            النظام الحالي يعمل في وضع Sandbox للاختبار. عند الجاهزية للإنتاج:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-green-800 mr-4">
            <li>تأكد من صحة بيانات Amwal Pay في Environment Variables</li>
            <li>غيّر <code className="bg-green-100 px-2 py-1 rounded">AMWAL_SANDBOX_MODE=false</code></li>
            <li>سيتم التكامل التلقائي م�� Amwal Pay Production</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
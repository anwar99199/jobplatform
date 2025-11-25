import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export function PaymentSandboxPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const transactionRef = searchParams.get("ref");
  const amount = searchParams.get("amount");
  const plan = searchParams.get("plan");

  const planName = plan === "yearly" ? "سنوي" : "نصف سنوي";

  const handlePayment = (success: boolean) => {
    setProcessing(true);
    
    // محاكاة معالجة الدفع
    setTimeout(() => {
      if (success) {
        // توجيه لصفحة نجاح الدفع
        navigate(`/payment/success?ref=${transactionRef}`);
      } else {
        // توجيه لصفحة Premium مع رسالة فشل
        navigate(`/premium?status=failed`);
      }
    }, 1500);
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
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl text-yellow-900">وضع الاختبار (Sandbox Mode)</h3>
          </div>
          <p className="text-yellow-800">
            هذه صفحة محاكاة للدفع. لن يتم خصم أي مبالغ حقيقية. 
            عند الحصول على API الحقيقي من Amwal Pay، سيتم التوجيه للصفحة الحقيقية.
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <CreditCard className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl mb-2 text-gray-800">إتمام الدفع</h1>
            <p className="text-gray-600">صفحة دفع تجريبية - Sandbox</p>
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

          {/* Mock Payment Form */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm mb-2 text-gray-700">رقم البطاقة (تجريبي)</label>
              <input
                type="text"
                value="4111 1111 1111 1111"
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">تاريخ الانتهاء</label>
                <input
                  type="text"
                  value="12/25"
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">CVV</label>
                <input
                  type="text"
                  value="123"
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handlePayment(true)}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
            >
              {processing ? (
                "جاري المعالجة..."
              ) : (
                <>
                  <CheckCircle className="ml-2 w-5 h-5" />
                  محاكاة دفع ناجح
                </>
              )}
            </Button>

            <Button
              onClick={() => handlePayment(false)}
              disabled={processing}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 py-6 text-lg"
            >
              <XCircle className="ml-2 w-5 h-5" />
              محاكاة دفع فاشل
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            💡 اختر الزر المناسب لتجربة سيناريو النجاح أو الفشل
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg mb-2 text-blue-900">📝 ملاحظة للمطور:</h3>
          <p className="text-blue-800 mb-3">
            هذا النظام مؤقت للتطوير والاختبار. للتفعيل الحقيقي:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 mr-4">
            <li>احصل على API الصحيح من Amwal Pay</li>
            <li>عدّل Environment Variable: <code className="bg-blue-100 px-2 py-1 rounded">AMWAL_SANDBOX_MODE=false</code></li>
            <li>تأكد من صحة روابط API في السيرفر</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/**
 * ATS CV Converter Page
 * صفحة تحويل السيرة الذاتية إلى نسخة متوافقة مع ATS
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2, CheckCircle, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { UploadCV } from '../components/UploadCV';
import { ConvertedCV } from '../components/ConvertedCV';
import { convertToATS } from '../utils/ats-converter-api';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export function ATSConverterPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // CV States
  const [originalText, setOriginalText] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [convertedText, setConvertedText] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [step, setStep] = useState<'upload' | 'converting' | 'result'>('upload');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      setUserId(session.user.id);
      setAccessToken(session.access_token);

      // التحقق من اشتراك Premium
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      setIsPremium(!!subscription);
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const handleTextExtracted = (text: string, fileName: string) => {
    setOriginalText(text);
    setOriginalFileName(fileName);
    setStep('upload');
    toast.success('تم استخراج النص بنجاح');
  };

  const handleConvert = async () => {
    if (!originalText || !accessToken || !userId) {
      toast.error('يرجى رفع السيرة الذاتية أولاً');
      return;
    }

    setConverting(true);
    setStep('converting');

    try {
      const response = await convertToATS(originalText, originalFileName, accessToken);

      if (!response.success || !response.convertedText) {
        throw new Error(response.error || 'فشل تحويل السيرة الذاتية');
      }

      setConvertedText(response.convertedText);
      setStep('result');
      toast.success('تم تحويل السيرة الذاتية بنجاح');
    } catch (error: any) {
      console.error('Error converting CV:', error);
      toast.error(error.message || 'حدث خطأ أثناء تحويل السيرة الذاتية');
      setStep('upload');
    } finally {
      setConverting(false);
    }
  };

  const handleReset = () => {
    setOriginalText('');
    setOriginalFileName('');
    setConvertedText('');
    setStep('upload');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Not Premium - Show upgrade prompt
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة للرئيسية
          </Button>

          {/* Upgrade Prompt */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border-2 border-yellow-400 dark:border-yellow-600 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-6">
              <Crown className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              خدمة Premium حصرية
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              محول السيرة الذاتية إلى نسخة ATS متاح فقط للمشتركين في الباقة المميزة
            </p>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                ماذا ستحصل عليه:
              </h3>
              <ul className="space-y-3 text-right">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    تحويل السيرة الذاتية إلى نسخة متوافقة مع ATS بالذكاء الاصطناعي
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    توليد Cover Letter احترافي مخصص لكل وظيفة
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    بطاقة رقمية احترافية قابلة للمشاركة
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    تحليل نسبة التوافق مع الوظائف
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    إشعارات فورية للوظائف الجديدة
                  </span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/premium')}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-6 px-12 text-xl font-bold shadow-xl"
            >
              <Crown className="w-6 h-6 ml-2" />
              الترقية إلى Premium
            </Button>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              ابدأ من 1 ريال شهرياً فقط
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Page - Premium User
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة للرئيسية
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              محول السيرة الذاتية إلى نسخة ATS
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              حوّل سيرتك الذاتية إلى نسخة متوافقة مع نظام ATS باستخدام الذكاء الاصطناعي
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                step === 'upload' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">رفع السيرة</p>
            </div>
            
            <div className={`flex-1 h-1 ${step !== 'upload' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                step === 'converting' ? 'bg-yellow-500 text-white animate-pulse' : 
                step === 'result' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">التحويل</p>
            </div>
            
            <div className={`flex-1 h-1 ${step === 'result' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                step === 'result' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">التحميل</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <UploadCV 
              onTextExtracted={handleTextExtracted}
              disabled={converting}
            />
            
            {originalText && (
              <Button
                onClick={handleConvert}
                disabled={converting}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-6 text-lg font-bold shadow-xl"
              >
                <Sparkles className="w-6 h-6 ml-2" />
                تحويل إلى نسخة ATS بالذكاء الاصطناعي
              </Button>
            )}
          </div>
        )}

        {step === 'converting' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border-2 border-yellow-400">
              <Loader2 className="w-16 h-16 animate-spin text-yellow-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                جاري التحويل...
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                الذكاء الاصطناعي يعمل على تحويل سيرتك الذاتية إلى نسخة متوافقة مع ATS
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-500">⏳ استخراج المحتوى...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">🤖 تحليل البنية...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">✨ إعادة التنسيق...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">🎯 تحسين الكلمات المفتاحية...</p>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6">
            <ConvertedCV
              originalText={originalText}
              convertedText={convertedText}
              fileName={originalFileName}
            />
            
            <div className="text-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-2 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              >
                تحويل سيرة ذاتية أخرى
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

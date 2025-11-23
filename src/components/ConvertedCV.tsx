/**
 * Converted CV Component
 * مكون عرض السيرة الذاتية المحولة
 */

import { Download, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { downloadAsPDF, downloadAsDOCX } from '../utils/downloadFile';

interface ConvertedCVProps {
  originalText: string;
  convertedText: string;
  fileName: string;
}

export function ConvertedCV({ originalText, convertedText, fileName }: ConvertedCVProps) {
  const [copying, setCopying] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingDOCX, setDownloadingDOCX] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertedText);
      setCopying(true);
      toast.success('تم نسخ النص بنجاح');
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error('Error copying text:', error);
      toast.error('فشل نسخ النص');
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const newFileName = fileName.replace(/\.(pdf|docx)$/i, '_ATS.pdf');
      await downloadAsPDF(convertedText, newFileName);
      toast.success('تم تحميل الملف بنجاح');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'فشل تحميل ملف PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadDOCX = async () => {
    setDownloadingDOCX(true);
    try {
      const newFileName = fileName.replace(/\.(pdf|docx)$/i, '_ATS.docx');
      await downloadAsDOCX(convertedText, newFileName);
      toast.success('تم تحميل الملف بنجاح');
    } catch (error: any) {
      console.error('Error downloading DOCX:', error);
      toast.error(error.message || 'فشل تحميل ملف Word');
    } finally {
      setDownloadingDOCX(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Original vs Converted */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Original CV */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              السيرة الذاتية الأصلية
            </h3>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              أصلية
            </span>
          </div>
          <div className="max-h-[500px] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
              {originalText}
            </pre>
          </div>
        </div>

        {/* Converted CV */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-lg p-6 border-2 border-yellow-400 dark:border-yellow-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              النسخة المحولة (ATS)
            </h3>
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full text-sm font-bold shadow-md">
              ✨ محسّنة
            </span>
          </div>
          <div className="max-h-[500px] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg p-4 border border-yellow-300 dark:border-yellow-700">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
              {convertedText}
            </pre>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          تحميل النسخة المحولة
        </h3>
        
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Copy Button */}
          <Button
            onClick={handleCopy}
            variant="outline"
            className="py-6 text-base border-2 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
          >
            {copying ? (
              <>
                <Check className="w-5 h-5 ml-2 text-green-600" />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 ml-2" />
                نسخ النص
              </>
            )}
          </Button>

          {/* Download PDF */}
          <Button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="py-6 text-base bg-red-600 hover:bg-red-700 text-white"
          >
            {downloadingPDF ? (
              <>
                جاري التحميل...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 ml-2" />
                تحميل PDF
              </>
            )}
          </Button>

          {/* Download DOCX */}
          <Button
            onClick={handleDownloadDOCX}
            disabled={downloadingDOCX}
            className="py-6 text-base bg-blue-600 hover:bg-blue-700 text-white"
          >
            {downloadingDOCX ? (
              <>
                جاري التحميل...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 ml-2" />
                تحميل Word
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-900 dark:text-green-300 text-center">
            ✅ تم تحويل سيرتك الذاتية بنجاح إلى نسخة متوافقة مع نظام ATS
          </p>
        </div>
      </div>

      {/* ATS Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">
          💡 نصائح للحصول على أفضل نتائج مع ATS:
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>استخدم الكلمات المفتاحية الموجودة في إعلان الوظيفة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>تجنب الصور والجداول والأعمدة المعقدة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>استخدم خطوط بسيطة مثل Arial أو Calibri</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>اذكر المهارات التقنية بشكل واضح ومباشر</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>رتّب الأقسام بالترتيب التالي: الملخص → المهارات → الخبرات → التعليم</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

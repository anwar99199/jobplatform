/**
 * Upload CV Component
 * مكون رفع السيرة الذاتية
 */

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { extractTextFromFile } from '../utils/extractText';

interface UploadCVProps {
  onTextExtracted: (text: string, fileName: string) => void;
  disabled?: boolean;
}

export function UploadCV({ onTextExtracted, disabled = false }: UploadCVProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('يرجى اختيار ملف أولاً');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // استخراج النص من الملف
      const extractedText = await extractTextFromFile(selectedFile);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('لم يتم العثور على نص في الملف');
      }

      // إرسال النص للمكون الأب
      onTextExtracted(extractedText, selectedFile.name);
      
      // إعادة تعيين الحقول
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      setError(error.message || 'حدث خطأ أثناء قراءة الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          رفع السيرة الذاتية
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          قم برفع سيرتك الذاتية بصيغة PDF أو DOCX
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
          ⚠️ يُنصح باستخدام DOCX للحصول على أفضل النتائج
        </p>
      </div>

      {/* File Input Hidden */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Area */}
      <div
        onClick={handleClickUpload}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          selectedFile
            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div className="text-right">
              <p className="font-medium text-gray-800 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        ) : (
          <div>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              اضغط اختيار ملف أو اسحبه هنا
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              PDF أو DOCX (حتى 10 MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploading || disabled}
        className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-6 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
            جاري استخراج النص...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 ml-2" />
            رفع وتحليل السيرة الذاتية
          </>
        )}
      </Button>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-300 text-center">
          💡 سيتم استخراج النص من السيرة الذاتية وتحويلها إلى نسخة متوافقة مع نظام ATS
        </p>
      </div>
      
      {/* Important Notes */}
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2 text-center">
          📌 ملاحظات مهمة:
        </p>
        <ul className="text-xs text-amber-800 dark:text-amber-400 space-y-1 text-right">
          <li>✅ <strong>ملفات DOCX</strong> تعمل بشكل ممتاز (موصى به)</li>
          <li>⚠️ <strong>ملفات PDF</strong> قد تعمل بشكل محدود</li>
          <li>❌ ملفات PDF الممسوحة ضوئياً (صور) غير مدعومة</li>
          <li>💡 للحصول على أفضل النتائج: احفظ سيرتك كـ <strong>.docx</strong></li>
        </ul>
      </div>
    </div>
  );
}
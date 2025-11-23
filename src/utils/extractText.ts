/**
 * Extract Text from PDF and DOCX Files
 * استخراج النص من ملفات PDF و DOCX
 * 
 * Note: Using server-side extraction for better reliability
 */

import { projectId, publicAnonKey } from './supabase/info';

/**
 * استخراج النص من ملف PDF أو DOCX عبر السيرفر
 * هذه الطريقة أكثر موثوقية من استخدام المكتبات في المتصفح
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // التحقق من نوع الملف
  if (
    fileType !== 'application/pdf' && 
    !fileName.endsWith('.pdf') &&
    fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
    !fileName.endsWith('.docx')
  ) {
    if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      throw new Error('ملفات .doc غير مدعومة. يرجى استخدام .docx بدلاً من ذلك');
    }
    throw new Error('نوع الملف غير مدعوم. يرجى استخدام PDF أو DOCX');
  }

  try {
    console.log('📤 Sending file to server for extraction:', file.name, file.type, file.size);
    
    // إنشاء FormData
    const formData = new FormData();
    formData.append('file', file);

    // إرسال الملف إلى السيرفر للاستخراج
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/ats/extract-text`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData,
      }
    );

    console.log('📥 Server response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📥 Server response data:', data);

    if (!response.ok) {
      const errorMessage = data.error || 'فشل استخراج النص من الملف';
      console.error('❌ Server error:', errorMessage, data.details);
      throw new Error(errorMessage);
    }
    
    if (!data.success || !data.text) {
      const errorMessage = data.error || 'فشل استخراج النص من الملف';
      console.error('❌ Extraction failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ Text extracted successfully. Length:', data.text.length);
    return data.text;
  } catch (error: any) {
    console.error('❌ Error extracting text:', error);
    
    // إذا كان الخطأ من السيرفر، نستخدم رسالته
    if (error.message && error.message !== 'حدث خطأ أثناء قراءة الملف') {
      throw error;
    }
    
    throw new Error('حدث خطأ أثناء قراءة الملف. يرجى التأكد من أن الملف غير محمي وبصيغة صحيحة');
  }
}

// Backward compatibility exports
export const extractTextFromPDF = extractTextFromFile;
export const extractTextFromDOCX = extractTextFromFile;

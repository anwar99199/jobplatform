/**
 * PDF & DOCX Text Extraction Helper for Deno Edge Runtime
 * مساعد استخراج النص من PDF و DOCX
 */

import { extractSimplePDFText } from './pdf-simple-extractor.tsx';

/**
 * Extract text from PDF
 * Uses simple extraction method that works in Deno Edge Runtime
 */
export async function extractPDFText(buffer: Uint8Array): Promise<string> {
  try {
    console.log('🔍 Starting PDF text extraction...');
    console.log('📊 Buffer size:', buffer.length, 'bytes');
    
    // Use simple extraction method
    const extractedText = await extractSimplePDFText(buffer);
    
    if (!extractedText || extractedText.trim().length < 50) {
      console.warn('⚠️  PDF extraction returned minimal or no text');
      console.warn('This PDF might be:');
      console.warn('- A scanned image (not text-based)');
      console.warn('- Using complex formatting/encoding');
      console.warn('- Encrypted or protected');
      
      throw new Error('لم نتمكن من استخراج نص كافٍ من ملف PDF. يُرجى استخدام ملف DOCX للحصول على أفضل النتائج.');
    }
    
    console.log('✅ PDF text extracted successfully');
    console.log('📝 Text length:', extractedText.length);
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Error in extractPDFText:', error);
    
    // Re-throw with user-friendly message
    if (error.message && error.message.includes('يُرجى استخدام')) {
      throw error;
    }
    
    throw new Error('فشل استخراج النص من PDF. يُنصح باستخدام ملف DOCX (.docx) للحصول على أفضل النتائج. ملفات PDF الممسوحة ضوئياً غير مدعومة.');
  }
}

/**
 * Extract text from DOCX using mammoth
 */
export async function extractDOCXText(buffer: Uint8Array): Promise<string> {
  try {
    console.log('🔍 Attempting to import mammoth for DOCX extraction...');
    
    // Try to import mammoth
    let mammoth;
    try {
      mammoth = await import('npm:mammoth');
      console.log('✅ mammoth imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import mammoth:', importError);
      throw new Error('فشل تحميل مكتبة معالجة ملفات Word');
    }
    
    console.log('📊 Buffer size:', buffer.length, 'bytes');
    
    // mammoth expects a buffer-like object
    // Try to use the Uint8Array directly first
    console.log('🔄 Parsing DOCX...');
    
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      console.log('✅ DOCX parsed successfully');
      console.log('📝 Text length:', result.value?.length || 0);
      
      if (result.messages && result.messages.length > 0) {
        console.log('ℹ️  Mammoth messages:', result.messages);
      }
      
      if (!result.value || result.value.trim().length === 0) {
        console.warn('⚠️  DOCX parsed but no text found');
        throw new Error('لم يتم العثور على نص في ملف Word');
      }
      
      return result.value.trim();
      
    } catch (parseError) {
      console.error('❌ DOCX parsing error:', parseError);
      throw new Error('فشل قراءة ملف Word. يُرجى التأكد من أن الملف بصيغة .docx وليس محمياً بكلمة مرور');
    }
    
  } catch (error) {
    console.error('❌ Error in extractDOCXText:', error);
    console.error('Error message:', error.message);
    
    // Re-throw with user-friendly message
    if (error.message && (error.message.includes('فشل') || error.message.includes('لم يتم'))) {
      throw error;
    }
    
    throw new Error('حدث خطأ أثناء معالجة ملف Word: ' + error.message);
  }
}

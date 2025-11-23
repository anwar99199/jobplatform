/**
 * Download File Utilities
 * أدوات تحميل الملفات
 */

/**
 * تحميل النص كملف PDF
 */
export async function downloadAsPDF(text: string, fileName: string = 'ATS-CV.pdf'): Promise<void> {
  try {
    // Load jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // إعداد الخط العربي (إذا كان النص يحتوي على عربي)
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    
    // تقسيم النص إلى أسطر
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    
    // تقسيم النص إلى فقرات
    const paragraphs = text.split('\n');
    let yPosition = margin;
    
    doc.setFontSize(11);
    
    paragraphs.forEach((paragraph) => {
      if (!paragraph.trim()) {
        yPosition += 5;
        return;
      }
      
      // تقسيم الفقرة إلى أسطر بناءً على العرض
      const lines = doc.splitTextToSize(paragraph, maxWidth);
      
      lines.forEach((line: string) => {
        // إضافة صفحة جديدة إذا لزم الأمر
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });
      
      yPosition += 2; // مسافة بين الفقرات
    });
    
    // حفظ الملف
    doc.save(fileName);
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw new Error('فشل إنشاء ملف PDF');
  }
}

/**
 * تحميل النص كملف Word (DOCX)
 */
export async function downloadAsDOCX(text: string, fileName: string = 'ATS-CV.docx'): Promise<void> {
  try {
    // Load docx library dynamically
    const docx = await import('docx');
    const { Document, Packer, Paragraph, TextRun } = docx;
    
    // تقسيم النص إلى فقرات
    const paragraphs = text.split('\n').map((line) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 22, // 11pt
          }),
        ],
        spacing: {
          after: 100,
        },
      });
    });
    
    // إنشاء المستند
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });
    
    // تحويل إلى Blob
    const blob = await Packer.toBlob(doc);
    
    // تحميل الملف
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating DOCX:', error);
    throw new Error('فشل إنشاء ملف Word');
  }
}

/**
 * تحميل النص كملف نصي
 */
export function downloadAsText(text: string, fileName: string = 'ATS-CV.txt'): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

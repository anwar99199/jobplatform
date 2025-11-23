/**
 * Simple PDF Text Extractor for Deno
 * استخراج بسيط للنص من PDF
 * 
 * This is a lightweight extractor that works in Deno Edge Runtime
 * without complex dependencies. Best for simple text-based PDFs.
 */

/**
 * Extract text from PDF buffer using simple string parsing
 * Works for basic PDFs with text (not scanned images)
 */
export async function extractSimplePDFText(buffer: Uint8Array): Promise<string> {
  try {
    console.log('🔍 Simple PDF text extraction starting...');
    console.log('📊 Buffer size:', buffer.length, 'bytes');
    
    // Convert buffer to Latin-1 string (PDF uses Latin-1 encoding)
    let pdfText = '';
    for (let i = 0; i < buffer.length; i++) {
      pdfText += String.fromCharCode(buffer[i]);
    }
    
    console.log('✅ Buffer converted to string');
    
    // Extract all text content
    const extractedTexts: string[] = [];
    
    // Method 1: Extract from stream objects
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let streamMatch;
    
    while ((streamMatch = streamRegex.exec(pdfText)) !== null) {
      const streamContent = streamMatch[1];
      
      // Try to extract readable text from stream
      const readableText = streamContent.replace(/[^\x20-\x7E\u0600-\u06FF\s]/g, ' ');
      if (readableText.trim().length > 10) {
        extractedTexts.push(readableText.trim());
      }
    }
    
    // Method 2: Look for text between parentheses (PDF text operators)
    const textRegex = /\(([^)]+)\)/g;
    let textMatch;
    
    while ((textMatch = textRegex.exec(pdfText)) !== null) {
      const text = textMatch[1];
      // Filter out non-readable content
      if (text.length > 2 && /[a-zA-Z\u0600-\u06FF]/.test(text)) {
        extractedTexts.push(text);
      }
    }
    
    // Method 3: Look for /Contents and text operators
    const btEtRegex = /BT\s+([\s\S]*?)\s+ET/g;
    let btMatch;
    
    while ((btMatch = btEtRegex.exec(pdfText)) !== null) {
      const textBlock = btMatch[1];
      
      // Extract text from Tj operator
      const tjRegex = /\(([^)]+)\)\s*Tj/g;
      let tjMatch;
      
      while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
        if (tjMatch[1] && tjMatch[1].length > 1) {
          extractedTexts.push(tjMatch[1]);
        }
      }
      
      // Extract text from TJ operator (array)
      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let tjArrayMatch;
      
      while ((tjArrayMatch = tjArrayRegex.exec(textBlock)) !== null) {
        const arrayContent = tjArrayMatch[1];
        const arrayTextRegex = /\(([^)]+)\)/g;
        let arrayTextMatch;
        
        while ((arrayTextMatch = arrayTextRegex.exec(arrayContent)) !== null) {
          if (arrayTextMatch[1] && arrayTextMatch[1].length > 1) {
            extractedTexts.push(arrayTextMatch[1]);
          }
        }
      }
    }
    
    console.log('📝 Extracted', extractedTexts.length, 'text fragments');
    
    // Join and clean the text
    let finalText = extractedTexts
      .join(' ')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\n')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    console.log('✅ Final text length:', finalText.length);
    
    if (finalText.length > 0) {
      console.log('📄 First 200 chars:', finalText.substring(0, 200));
    }
    
    return finalText;
    
  } catch (error) {
    console.error('❌ Error in extractSimplePDFText:', error);
    throw error;
  }
}

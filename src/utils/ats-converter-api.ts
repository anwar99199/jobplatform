/**
 * ATS CV Converter API
 * التواصل مع السيرفر لتحويل السيرة الذاتية إلى نسخة متوافقة مع ATS
 */

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b`;

export interface ConvertCVRequest {
  cvText: string;
  originalFileName: string;
  userId: string;
}

export interface ConvertCVResponse {
  success: boolean;
  convertedText?: string;
  error?: string;
}

/**
 * تحويل السيرة الذاتية إلى نسخة ATS باستخدام الذكاء الاصطناعي
 */
export async function convertToATS(
  cvText: string,
  originalFileName: string,
  accessToken: string
): Promise<ConvertCVResponse> {
  try {
    const response = await fetch(`${API_BASE}/ats/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        cvText,
        originalFileName,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error converting CV to ATS:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تحويل السيرة الذاتية',
    };
  }
}

/**
 * رفع ملف السيرة الذاتية إلى Supabase Storage
 */
export async function uploadCVFile(
  file: File,
  userId: string,
  accessToken: string,
  type: 'original' | 'converted'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', type);

    const response = await fetch(`${API_BASE}/ats/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading CV file:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع الملف',
    };
  }
}

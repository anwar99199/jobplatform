import { projectId, publicAnonKey } from './supabase/info';

interface GenerateCoverLetterParams {
  userId: string;
  userProfile: {
    name: string;
    email: string;
    specialization?: string;
    specialty?: string;
    experience?: string;
    education?: string;
    skills?: string[];
    bio?: string;
  };
  jobTitle: string;
  jobDescription?: string;
  companyName: string;
  language?: 'ar' | 'en';
  additionalInfo?: string;
}

interface GenerateCoverLetterResponse {
  content: string;
  success: boolean;
}

interface DownloadCoverLetterParams {
  content: string;
  jobTitle: string;
  company: string;
  userName: string;
  format: 'pdf' | 'docx';
  language?: 'ar' | 'en';
}

export async function generateCoverLetter(params: GenerateCoverLetterParams): Promise<GenerateCoverLetterResponse> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/ai/generate-cover-letter`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(params)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.coverLetter || data.content,
      success: true
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}

export async function downloadCoverLetter(params: DownloadCoverLetterParams): Promise<void> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/ai/download-cover-letter`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(params)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    if (params.format === 'pdf') {
      a.download = `Cover_Letter_${params.company}_${params.jobTitle}.html`;
    } else {
      a.download = `Cover_Letter_${params.company}_${params.jobTitle}.docx`;
    }
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading cover letter:', error);
    throw error;
  }
}

export async function getSavedCoverLetters(userId: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/ai/get-cover-letters/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.letters || [];
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    return [];
  }
}

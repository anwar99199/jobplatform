import { supabase } from './supabase/client';
import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b`;

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = toCamelCase(obj[key]);
  }
  return newObj;
};

// Get all jobs from Supabase
export async function getJobs() {
  try {
    console.log('📡 Fetching jobs from Supabase...');
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error fetching jobs:', error);
      console.error('Error details:', {
        message: error.message,
        hint: error.hint,
        code: error.code
      });
      return { success: false, jobs: [], error: error.message };
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} jobs`);
    return { success: true, jobs: toCamelCase(data) };
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error: Cannot reach Supabase. Please check:');
      console.error('   1. Internet connection');
      console.error('   2. Supabase project is running');
      console.error('   3. CORS settings');
      console.error('   4. Firewall/Network restrictions');
    }
    
    return { success: false, jobs: [], error: String(error) };
  }
}

// Get single job from Supabase
export async function getJob(id: string) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching job:', error);
      return { success: false, job: null };
    }
    
    return { success: true, job: toCamelCase(data) };
  } catch (error) {
    console.error('Error fetching job:', error);
    return { success: false, job: null };
  }
}

// Fetch API with authorization
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`API Error (${endpoint}):`, data);
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

export async function signUp(email: string, password: string, name: string) {
  return fetchAPI('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}
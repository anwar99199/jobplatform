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
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return { success: false, jobs: [] };
    }
    
    return { success: true, jobs: toCamelCase(data) };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { success: false, jobs: [] };
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
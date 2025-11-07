import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b`;

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

export async function getJobs() {
  return fetchAPI('/jobs');
}

export async function getJob(id: string) {
  return fetchAPI(`/jobs/${id}`);
}

export async function createJob(jobData: {
  title: string;
  company: string;
  location?: string;
  type?: string;
  description?: string;
}) {
  return fetchAPI('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
}

export async function deleteJob(id: string) {
  return fetchAPI(`/jobs/${id}`, {
    method: 'DELETE',
  });
}

export async function signUp(email: string, password: string, name: string) {
  return fetchAPI('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

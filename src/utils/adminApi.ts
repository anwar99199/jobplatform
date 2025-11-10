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

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = toSnakeCase(obj[key]);
  }
  return newObj;
};

// Get admin token from localStorage
const getAdminToken = () => {
  return localStorage.getItem('adminToken') || '';
};

// Get headers for admin requests
const getAdminHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    'X-Admin-Token': token, // ← استخدام custom header بدلاً من Authorization
    'Authorization': `Bearer ${publicAnonKey}` // ← للـ Supabase فقط
  };
};

// Check if this is the first admin
export const checkFirstAdmin = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/check-first`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Check first admin error:', error);
    return { isFirstAdmin: false };
  }
};

// Admin Register (first admin only)
export const adminRegister = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Admin register error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Admin Login
export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Get Jobs (from Supabase directly)
export const getJobs = async () => {
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
    console.error('Get jobs error:', error);
    return { success: false, jobs: [] };
  }
};

// Get Single Job (from Supabase directly)
export const getJob = async (id: string) => {
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
    console.error('Get job error:', error);
    return { success: false, job: null };
  }
};

// Create Job (through Server, not direct client)
export const createJob = async (jobData: any) => {
  try {
    const response = await fetch(`${API_URL}/admin/jobs`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || 'مسقط',
        type: jobData.type || 'دوام كامل',
        description: jobData.description || '',
        applicationUrl: jobData.applicationUrl || '',
        date: jobData.date || new Date().toISOString().split('T')[0]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error creating job:', data);
      return { success: false, message: data.message || 'فشل في إنشاء الوظيفة' };
    }
    
    return data;
  } catch (error) {
    console.error('Create job error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Update Job (through Server, not direct client)
export const updateJob = async (id: string, jobData: any) => {
  try {
    const response = await fetch(`${API_URL}/admin/jobs/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || 'مسقط',
        type: jobData.type || 'دوام كامل',
        description: jobData.description || '',
        applicationUrl: jobData.applicationUrl || '',
        date: jobData.date || new Date().toISOString().split('T')[0]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error updating job:', data);
      return { success: false, message: data.message || 'فشل في تحديث الوظيفة' };
    }
    
    return data;
  } catch (error) {
    console.error('Update job error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Delete Job (through Server, not direct client)
export const deleteJob = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/jobs/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error deleting job:', data);
      return { success: false, message: data.message || 'فشل في حذف الوظيفة' };
    }
    
    return data;
  } catch (error) {
    console.error('Delete job error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Get Admin Stats
export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getAdminHeaders()
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get admin stats error:', error);
    return { 
      success: false, 
      stats: {
        totalJobs: 0,
        totalUsers: 0,
        activePremiumSubs: 0,
        todaysJobs: 0
      }
    };
  }
};

// Get All Users
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAdminHeaders()
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get users error:', error);
    return { success: false, users: [] };
  }
};

// Delete User
export const deleteUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Get Analytics
export const getAnalytics = async (timeRange: "7days" | "30days" | "90days" = "30days") => {
  try {
    const response = await fetch(`${API_URL}/admin/analytics?timeRange=${timeRange}`, {
      headers: getAdminHeaders()
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get analytics error:', error);
    return { 
      success: false,
      analytics: {
        overview: {
          totalJobs: 0,
          totalUsers: 0,
          premiumUsers: 0,
          jobsThisMonth: 0,
          usersThisMonth: 0,
          premiumRevenue: 0
        },
        jobsByType: [],
        jobsByLocation: [],
        userGrowth: [],
        jobGrowth: [],
        premiumGrowth: [],
        topJobs: [],
        recentActivity: []
      }
    };
  }
};
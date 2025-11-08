import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b`;

// Get admin token from localStorage
const getAdminToken = () => {
  return localStorage.getItem('adminToken') || publicAnonKey;
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

// Get Jobs (reuse from api.ts but with admin token)
export const getJobs = async () => {
  try {
    const response = await fetch(`${API_URL}/jobs`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get jobs error:', error);
    return { success: false, jobs: [] };
  }
};

// Get Single Job
export const getJob = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get job error:', error);
    return { success: false };
  }
};

// Create Job
export const createJob = async (jobData: any) => {
  try {
    const response = await fetch(`${API_URL}/admin/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(jobData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create job error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Update Job
export const updateJob = async (id: string, jobData: any) => {
  try {
    const response = await fetch(`${API_URL}/admin/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(jobData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update job error:', error);
    return { success: false, message: 'فشل الاتصال بالسيرفر' };
  }
};

// Delete Job
export const deleteJob = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/jobs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });

    const data = await response.json();
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
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
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
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
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
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
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
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
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
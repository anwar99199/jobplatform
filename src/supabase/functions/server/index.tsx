import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors());
app.use("*", logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Simple admin auth middleware (optional - for security)
const isAdmin = async (c: any, next: any) => {
  const adminToken = c.req.header("X-Admin-Token");
  
  // For now, allow all admin requests (you can add real verification later)
  // In production, you should verify the token against stored admin tokens
  console.log("Admin request with token:", adminToken ? "exists" : "missing");
  
  await next();
};

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase());
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
    const snakeKey = key.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = toSnakeCase(obj[key]);
  }
  return newObj;
};

// Get all jobs (from Supabase table)
app.get("/make-server-8a20c00b/jobs", async (c) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error fetching jobs from Supabase:", error);
      return c.json({ success: false, error: String(error) }, 500);
    }
    
    return c.json({ success: true, jobs: toCamelCase(data) });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single job by ID
app.get("/make-server-8a20c00b/jobs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching job from Supabase:", error);
      return c.json({ success: false, error: String(error) }, 500);
    }
    
    return c.json({ success: true, job: toCamelCase(data) });
  } catch (error) {
    console.error("Error fetching job:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new job
app.post("/make-server-8a20c00b/jobs", async (c) => {
  try {
    const body = await c.req.json();
    const { title, company, location, type, description, applicationUrl } = body;
    
    if (!title || !company) {
      return c.json({ success: false, error: "Title and company are required" }, 400);
    }
    
    const id = Date.now().toString();
    const job = {
      id,
      title,
      company,
      location: location || "مسقط",
      type: type || "دوام كامل",
      description: description || "",
      applicationUrl: applicationUrl || "",
      date: new Date().toISOString().split("T")[0]
    };
    
    const { data, error } = await supabase
      .from('jobs')
      .insert(toSnakeCase(job))
      .select('*')
      .single();
    
    if (error) {
      console.error("Error creating job in Supabase:", error);
      return c.json({ success: false, error: String(error) }, 500);
    }
    
    return c.json({ success: true, job: toCamelCase(data) });
  } catch (error) {
    console.error("Error creating job:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete job
app.delete("/make-server-8a20c00b/jobs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting job from Supabase:", error);
      return c.json({ success: false, error: String(error) }, 500);
    }
    
    return c.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update job
app.put("/make-server-8a20c00b/admin/jobs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, company, location, type, description, date, applicationUrl } = body;
    
    console.log("Updating job:", id, { title, company });
    
    if (!title || !company) {
      return c.json({ success: false, message: "العنوان واسم الشركة مطلوبان" }, 400);
    }
    
    const jobData = {
      title,
      company,
      location: location || "مسقط",
      type: type || "دوام كامل",
      description: description || "",
      application_url: applicationUrl || "",
      date: date || new Date().toISOString().split("T")[0]
    };
    
    console.log("Updating in Supabase:", jobData);
    
    const { data, error } = await supabase
      .from('jobs')
      .update(jobData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error updating job in Supabase:", error);
      return c.json({ success: false, message: "فشل في تحديث الوظيفة", error: error.message }, 500);
    }
    
    console.log("Job updated successfully:", data);
    
    return c.json({ success: true, job: toCamelCase(data) });
  } catch (error) {
    console.error("Error updating job:", error);
    return c.json({ success: false, message: "فشل في تحديث الوظيفة", error: String(error) }, 500);
  }
});

// Admin login endpoint
app.post("/make-server-8a20c00b/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ success: false, message: "البريد وكلمة المرور مطلوبان" }, 400);
    }
    
    // الحسابات الثابتة المسموح بها
    const ALLOWED_ADMINS = [
      { email: "as8543245@gmail.com", password: "A1999anw#" },
      { email: "anwaralrawahi459@gmail.com", password: "6101999" }
    ];
    
    // التحقق من أن البريد من الحسابات المسموح بها
    const allowedAdmin = ALLOWED_ADMINS.find(admin => admin.email === email);
    
    if (!allowedAdmin) {
      return c.json({ 
        success: false, 
        message: "هذا البريد غير مسموح به. فقط المدراء المعتمدون يمكنهم الدخول" 
      }, 403);
    }
    
    // التحقق من كلمة المرور
    if (password !== allowedAdmin.password) {
      return c.json({ success: false, message: "كلمة المرور غير صحيحة" }, 401);
    }
    
    // Get admin from Supabase table
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !admin) {
      console.error("Error fetching admin from Supabase:", error);
      return c.json({ success: false, message: "حساب المدير غير موجود" }, 404);
    }
    
    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email);
    
    // Generate a simple token (in production, use JWT)
    const token = `admin_${Date.now()}_${Math.random().toString(36)}`;
    
    return c.json({
      success: true,
      token,
      user: {
        email: admin.email,
        name: admin.name,
        role: "admin"
      }
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    return c.json({ success: false, message: "حدث خطأ أثناء تسجيل الدخول" }, 500);
  }
});

// Check if this is the first admin
app.get("/make-server-8a20c00b/admin/check-first", async (c) => {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Error checking admins:", error);
      return c.json({ isFirstAdmin: true });
    }
    
    return c.json({ isFirstAdmin: !admins || admins.length === 0 });
  } catch (error) {
    console.error("Error checking first admin:", error);
    return c.json({ isFirstAdmin: true }, 500);
  }
});

// Admin register (first admin only)
app.post("/make-server-8a20c00b/admin/register", async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    
    if (!name || !email || !password) {
      return c.json({ success: false, message: "جميع الحقول مطلوبة" }, 400);
    }
    
    // Check if admin already exists
    const { data: existingAdmins } = await supabase
      .from('admins')
      .select('id')
      .limit(1);
    
    if (existingAdmins && existingAdmins.length > 0) {
      return c.json({ success: false, message: "يوجد مدير بالفعل" }, 400);
    }
    
    // Create admin user
    const adminId = `admin_${Date.now()}`;
    const { data: admin, error } = await supabase
      .from('admins')
      .insert([{
        id: adminId,
        name,
        email,
        password, // In production, hash this with bcrypt
        created_at: new Date().toISOString()
      }])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error creating admin:", error);
      return c.json({ success: false, message: "حدث خطأ أثناء إنشاء الحساب" }, 500);
    }
    
    // Generate token
    const token = `admin_${Date.now()}_${Math.random().toString(36)}`;
    
    return c.json({
      success: true,
      token,
      user: {
        email: admin.email,
        name: admin.name,
        role: "admin"
      }
    });
  } catch (error) {
    console.error("Error during admin registration:", error);
    return c.json({ success: false, message: "حدث خطأ أثناء إنشاء الحساب" }, 500);
  }
});

// Admin create job
app.post("/make-server-8a20c00b/admin/jobs", async (c) => {
  try {
    const body = await c.req.json();
    const { title, company, location, type, description, date, applicationUrl } = body;
    
    console.log("Creating job with data:", { title, company, location, type });
    
    if (!title || !company) {
      return c.json({ success: false, message: "العنوان واسم الشركة مطلوبان" }, 400);
    }
    
    const jobData = {
      title,
      company,
      location: location || "مسقط",
      type: type || "دوام كامل",
      description: description || "",
      application_url: applicationUrl || "",
      date: date || new Date().toISOString().split("T")[0]
    };
    
    console.log("Inserting into Supabase:", jobData);
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error creating job in Supabase:", error);
      return c.json({ success: false, message: "فشل في إنشاء الوظيفة", error: error.message }, 500);
    }
    
    console.log("Job created successfully:", data);
    
    return c.json({ success: true, job: toCamelCase(data) });
  } catch (error) {
    console.error("Error creating job:", error);
    return c.json({ success: false, message: "فشل في إنشاء الوظيفة", error: String(error) }, 500);
  }
});

// Admin delete job
app.delete("/make-server-8a20c00b/admin/jobs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting job from Supabase:", error);
      return c.json({ success: false, message: "فشل في حذف الوظيفة" }, 500);
    }
    
    return c.json({ success: true, message: "تم حذف الوظيفة بنجاح" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return c.json({ success: false, message: "فشل في حذف الوظيفة" }, 500);
  }
});

// Get Admin Stats
app.get("/make-server-8a20c00b/admin/stats", async (c) => {
  try {
    // Get data from Supabase tables
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*');
    
    const { data: usersData } = await supabase
      .from('users')
      .select('*');
    
    const { data: premiumSubs } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('status', 'active');
    
    const jobs = jobsData || [];
    const users = usersData || [];
    
    // Active premium subscriptions
    const activePremium = (premiumSubs || []).filter((sub: any) => {
      if (!sub.end_date) return false;
      return new Date(sub.end_date) > new Date();
    });
    
    // Today's jobs
    const today = new Date().toISOString().split('T')[0];
    const todaysJobs = jobs.filter((job: any) => job.date === today);
    
    return c.json({
      success: true,
      stats: {
        totalJobs: jobs.length,
        totalUsers: users.length,
        activePremiumSubs: activePremium.length,
        todaysJobs: todaysJobs.length
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return c.json({
      success: false,
      stats: {
        totalJobs: 0,
        totalUsers: 0,
        activePremiumSubs: 0,
        todaysJobs: 0
      }
    }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-8a20c00b/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log("Signup request received:", { email, name });
    
    if (!email || !password || !name) {
      return c.json({ success: false, error: "Email, password, and name are required" }, 400);
    }
    
    // Create user in Supabase Auth directly (no need to check users table first)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.error("Error during sign up in Supabase Auth:", error);
      console.error("Error details:", JSON.stringify(error));
      
      // رسائل خطأ واضحة بالعربية
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
      
      // التحقق من نوع الخطأ باستخدام error.code
      if (error.code === "email_exists" || 
          error.message?.includes("already registered") || 
          error.message?.includes("already exists")) {
        errorMessage = "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر";
      } else if (error.message?.includes("invalid email") || error.code === "invalid_email") {
        errorMessage = "البريد الإلكتروني غير صالح";
      } else if (error.message?.includes("password") || error.code === "weak_password") {
        errorMessage = "كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)";
      }
      
      return c.json({ success: false, error: errorMessage, code: error.code }, 400);
    }
    
    console.log("User created successfully in Supabase Auth:", data.user.id);
    
    // Store user profile in users table
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email: email,
        name: name,
        role: 'user',
        created_at: new Date().toISOString()
      }]);
    
    if (insertError) {
      console.error("Error storing user profile in Supabase:", insertError);
      // Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);
      return c.json({ success: false, error: "حدث خطأ أثناء إنشاء الحساب" }, 500);
    }
    
    console.log("User profile stored in Supabase users table");
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error("Error during sign up:", error);
    console.error("Error stack:", error.stack);
    return c.json({ success: false, error: "حدث خطأ في الخادم", details: String(error) }, 500);
  }
});

// Get user profile
app.get("/make-server-8a20c00b/user/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      console.error("Error fetching user profile from Supabase:", error);
      return c.json({ success: false, error: "Profile not found" }, 404);
    }
    
    return c.json({ success: true, profile: toCamelCase(profile) });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-8a20c00b/admin/users", async (c) => {
  try {
    // Get all users from Supabase
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error("Error fetching users from Supabase:", usersError);
      return c.json({ success: false, error: String(usersError) }, 500);
    }
    
    // Get all premium subscriptions
    const { data: premiumSubs, error: premiumError } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('status', 'active');
    
    if (premiumError) {
      console.error("Error fetching premium subscriptions from Supabase:", premiumError);
    }
    
    // Create a map of premium subscriptions by user ID
    const premiumMap = new Map();
    (premiumSubs || []).forEach((sub: any) => {
      if (sub.user_id && sub.end_date) {
        const endDate = new Date(sub.end_date);
        const isActive = endDate > new Date();
        if (isActive) {
          premiumMap.set(sub.user_id, sub.end_date);
        }
      }
    });
    
    // Merge user profiles with premium info
    const usersWithPremium = (users || []).map((user: any) => ({
      ...toCamelCase(user),
      isPremium: premiumMap.has(user.id),
      premiumEndDate: premiumMap.get(user.id) || null
    }));
    
    return c.json({ success: true, users: usersWithPremium });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete user (admin only)
app.delete("/make-server-8a20c00b/admin/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    // Delete premium subscriptions first (if any)
    await supabase
      .from('premium_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    // Delete user profile from users table
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (deleteError) {
      console.error("Error deleting user from Supabase:", deleteError);
      return c.json({ success: false, message: "فشل في حذف المستخدم" }, 500);
    }
    
    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error("Error deleting user from auth:", authError);
      // Continue anyway since we deleted from users table
    }
    
    return c.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ success: false, message: "فشل في حذف المستخدم" }, 500);
  }
});

// Get Analytics (admin only)
app.get("/make-server-8a20c00b/admin/analytics", async (c) => {
  try {
    const timeRange = c.req.query("timeRange") || "30days";
    const days = timeRange === "7days" ? 7 : timeRange === "90days" ? 90 : 30;
    
    // Get all data from Supabase tables
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*');
    
    const { data: usersData } = await supabase
      .from('users')
      .select('*');
    
    const { data: premiumSubsData } = await supabase
      .from('premium_subscriptions')
      .select('*');
    
    const jobs = jobsData || [];
    const users = usersData || [];
    const premiumSubs = premiumSubsData || [];
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Overview Stats
    const totalJobs = jobs.length;
    const totalUsers = users.length;
    
    // Active premium subscriptions
    const activePremium = premiumSubs.filter((sub: any) => {
      if (!sub.end_date || sub.status !== 'active') return false;
      return new Date(sub.end_date) > new Date();
    });
    const premiumUsers = activePremium.length;
    
    // Jobs this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const jobsThisMonth = jobs.filter((job: any) => {
      if (!job.date) return false;
      return new Date(job.date) >= oneMonthAgo;
    }).length;
    
    // Users this month
    const usersThisMonth = users.filter((user: any) => {
      if (!user.created_at) return false;
      return new Date(user.created_at) >= oneMonthAgo;
    }).length;
    
    // Jobs by Type
    const typeMap = new Map();
    jobs.forEach((job: any) => {
      const type = job.type || "غير محدد";
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    const jobsByType = Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    // Jobs by Location
    const locationMap = new Map();
    jobs.forEach((job: any) => {
      const location = job.location || "غير محدد";
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });
    const jobsByLocation = Array.from(locationMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 locations
    
    // User Growth (daily for selected period)
    const userGrowth = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const usersUntilDate = users.filter((user: any) => {
        if (!user.created_at) return false;
        return new Date(user.created_at).getTime() <= date.getTime();
      }).length;
      
      userGrowth.push({
        date: dateStr,
        users: usersUntilDate
      });
    }
    
    // Job Growth (daily for selected period)
    const jobGrowth = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const jobsUntilDate = jobs.filter((job: any) => {
        if (!job.date) return false;
        return new Date(job.date).getTime() <= date.getTime();
      }).length;
      
      jobGrowth.push({
        date: dateStr,
        jobs: jobsUntilDate
      });
    }
    
    // Premium Growth (daily for selected period)
    const premiumGrowth = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const premiumCount = premiumSubs.filter((sub: any) => {
        if (!sub.start_date || !sub.end_date) return false;
        const start = new Date(sub.start_date);
        const end = new Date(sub.end_date);
        return start <= date && date <= end;
      }).length;
      
      premiumGrowth.push({
        date: dateStr,
        premium: premiumCount
      });
    }
    
    // Top Jobs (mock data - in real app would track views)
    const topJobs = jobs.slice(0, 5).map((job: any) => ({
      title: job.title,
      company: job.company,
      views: Math.floor(Math.random() * 500) + 50 // Mock views
    }));
    
    // Recent Activity
    const recentActivity = [];
    
    // Recent jobs
    const recentJobs = jobs
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    recentJobs.forEach((job: any) => {
      recentActivity.push({
        type: "job",
        description: `تم إضافة وظيفة جديدة: ${job.title}`,
        date: new Date(job.date).toLocaleDateString('ar-EG')
      });
    });
    
    // Recent users
    const recentUsers = users
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
    recentUsers.forEach((user: any) => {
      recentActivity.push({
        type: "user",
        description: `مستخدم جديد: ${user.name}`,
        date: new Date(user.created_at).toLocaleDateString('ar-EG')
      });
    });
    
    // Recent premium
    const recentPremium = activePremium
      .sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, 2);
    recentPremium.forEach((sub: any) => {
      const user = users.find((u: any) => u.id === sub.user_id);
      if (user) {
        recentActivity.push({
          type: "premium",
          description: `اشتراك Premium جديد: ${user.name}`,
          date: new Date(sub.start_date).toLocaleDateString('ar-EG')
        });
      }
    });
    
    // Sort by most recent
    recentActivity.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });
    
    return c.json({
      success: true,
      analytics: {
        overview: {
          totalJobs,
          totalUsers,
          premiumUsers,
          jobsThisMonth,
          usersThisMonth,
          premiumRevenue: premiumUsers * 25 // Mock revenue calculation
        },
        jobsByType,
        jobsByLocation,
        userGrowth,
        jobGrowth,
        premiumGrowth,
        topJobs,
        recentActivity: recentActivity.slice(0, 8)
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json({ 
      success: false, 
      error: String(error),
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
    }, 500);
  }
});

Deno.serve(app.fetch);
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

// Get all jobs
app.get("/make-server-8a20c00b/jobs", async (c) => {
  try {
    const jobs = await kv.getByPrefix("job:");
    
    // If no jobs exist, seed with initial data
    if (jobs.length === 0) {
      const initialJobs = [
        {
          id: "1",
          title: "استراتيجي إبرام مستشار - فرص عمل عن بعد",
          date: "2025-11-05",
          company: "شركة الاستشارات الدولية",
          location: "عن بعد",
          type: "دوام كامل",
          description: "نبحث عن استراتيجي إبرام مستشار للعمل عن بعد مع فريقنا الدولي."
        },
        {
          id: "2",
          title: "ملخصة توظيف - 25 شاغر في عدد من الوظائف لدى مجموعة من الشركات في عدة مجالات",
          date: "2025-11-05",
          company: "مجموعة شركات متنوعة",
          location: "مسقط",
          type: "دوام كامل",
          description: "فرص متنوعة في مختلف المجالات والتخصصات."
        },
        {
          id: "3",
          title: "وزارة الإعلام - شواغر في عدة إدارات",
          date: "2025-11-05",
          company: "وزارة الإعلام",
          location: "مسقط",
          type: "حكومي",
          description: "وظائف حكومية في وزارة الإعلام العمانية."
        },
        {
          id: "4",
          title: "شركة أودج - برنامج التدريب للخريجين 2025",
          date: "2025-11-05",
          company: "شركة أودج",
          location: "مسقط",
          type: "تدريب",
          description: "برنامج تدريبي للخريجين في التخصصات العلمية والهندسية والإدارية."
        }
      ];

      for (const job of initialJobs) {
        await kv.set(`job:${job.id}`, job);
      }
      
      return c.json({ success: true, jobs: initialJobs });
    }
    
    return c.json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single job by ID
app.get("/make-server-8a20c00b/jobs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const job = await kv.get(`job:${id}`);
    
    if (!job) {
      return c.json({ success: false, error: "Job not found" }, 404);
    }
    
    return c.json({ success: true, job });
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
    
    await kv.set(`job:${id}`, job);
    
    return c.json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete job
app.delete("/make-server-8a20c00b/jobs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`job:${id}`);
    
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
    
    if (!title || !company) {
      return c.json({ success: false, error: "Title and company are required" }, 400);
    }
    
    const job = {
      id,
      title,
      company,
      location: location || "مسقط",
      type: type || "دوام كامل",
      description: description || "",
      applicationUrl: applicationUrl || "",
      date: date || new Date().toISOString().split("T")[0]
    };
    
    await kv.set(`job:${id}`, job);
    
    return c.json({ success: true, job });
  } catch (error) {
    console.error("Error updating job:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin login endpoint
app.post("/make-server-8a20c00b/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ success: false, message: "البريد وكلمة المرور مطلوبان" }, 400);
    }
    
    // Get admin from KV store
    const admin = await kv.get("admin:user");
    
    if (!admin) {
      return c.json({ success: false, message: "لم يتم تسجيل مدير بعد" }, 404);
    }
    
    // Simple password check (in production, use bcrypt)
    if (email === admin.email && password === admin.password) {
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
    } else {
      return c.json({ success: false, message: "بيانات تسجيل الدخول غير صحيحة" }, 401);
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    return c.json({ success: false, message: "حدث خطأ أثناء تسجيل الدخول" }, 500);
  }
});

// Check if this is the first admin
app.get("/make-server-8a20c00b/admin/check-first", async (c) => {
  try {
    const admin = await kv.get("admin:user");
    return c.json({ isFirstAdmin: !admin });
  } catch (error) {
    console.error("Error checking first admin:", error);
    return c.json({ isFirstAdmin: false }, 500);
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
    const existingAdmin = await kv.get("admin:user");
    if (existingAdmin) {
      return c.json({ success: false, message: "يوجد مدير بالفعل" }, 400);
    }
    
    // Create admin user
    const admin = {
      name,
      email,
      password, // In production, hash this with bcrypt
      role: "admin",
      createdAt: new Date().toISOString()
    };
    
    await kv.set("admin:user", admin);
    
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
    
    if (!title || !company) {
      return c.json({ success: false, message: "العنوان واسم الشركة مطلوبان" }, 400);
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
      date: date || new Date().toISOString().split("T")[0]
    };
    
    await kv.set(`job:${id}`, job);
    
    return c.json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    return c.json({ success: false, message: "فشل في إنشاء الوظيفة" }, 500);
  }
});

// Admin delete job
app.delete("/make-server-8a20c00b/admin/jobs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`job:${id}`);
    
    return c.json({ success: true, message: "تم حذف الوظيفة بنجاح" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return c.json({ success: false, message: "فشل في حذف الوظيفة" }, 500);
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
    
    // Create user in Supabase Auth
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
    
    // Store additional user profile in KV store
    const userProfile = {
      id: data.user.id,
      email: email,
      name: name,
      createdAt: new Date().toISOString(),
      role: "user"
    };
    
    await kv.set(`user_profile:${data.user.id}`, userProfile);
    console.log("User profile stored in KV store");
    
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
    const profile = await kv.get(`user_profile:${userId}`);
    
    if (!profile) {
      return c.json({ success: false, error: "Profile not found" }, 404);
    }
    
    return c.json({ success: true, profile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-8a20c00b/admin/users", async (c) => {
  try {
    const profiles = await kv.getByPrefix("user_profile:");
    const premiumSubs = await kv.getByPrefix("premium_subscription:");
    
    // Create a map of premium subscriptions by user ID
    const premiumMap = new Map();
    premiumSubs.forEach((sub: any) => {
      if (sub.userId && sub.endDate) {
        const endDate = new Date(sub.endDate);
        const isActive = endDate > new Date();
        if (isActive) {
          premiumMap.set(sub.userId, sub.endDate);
        }
      }
    });
    
    // Merge user profiles with premium info
    const usersWithPremium = profiles.map((profile: any) => ({
      ...profile,
      isPremium: premiumMap.has(profile.id),
      premiumEndDate: premiumMap.get(profile.id) || null
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
    
    // Delete user profile from KV store
    await kv.del(`user_profile:${userId}`);
    
    // Delete premium subscription if exists
    await kv.del(`premium_subscription:${userId}`);
    
    // Delete user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error("Error deleting user from auth:", error);
      // Continue anyway since we deleted from KV store
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
    
    // Get all data
    const jobs = await kv.getByPrefix("job:");
    const users = await kv.getByPrefix("user_profile:");
    const premiumSubs = await kv.getByPrefix("premium_subscription:");
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Overview Stats
    const totalJobs = jobs.length;
    const totalUsers = users.length;
    
    // Active premium subscriptions
    const activePremium = premiumSubs.filter((sub: any) => {
      if (!sub.endDate) return false;
      return new Date(sub.endDate) > new Date();
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
      if (!user.createdAt) return false;
      return new Date(user.createdAt) >= oneMonthAgo;
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
        if (!user.createdAt) return false;
        return new Date(user.createdAt).getTime() <= date.getTime();
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
        if (!sub.startDate || !sub.endDate) return false;
        const start = new Date(sub.startDate);
        const end = new Date(sub.endDate);
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
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    recentUsers.forEach((user: any) => {
      recentActivity.push({
        type: "user",
        description: `مستخدم جديد: ${user.name}`,
        date: new Date(user.createdAt).toLocaleDateString('ar-EG')
      });
    });
    
    // Recent premium
    const recentPremium = activePremium
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 2);
    recentPremium.forEach((sub: any) => {
      const user = users.find((u: any) => u.id === sub.userId);
      if (user) {
        recentActivity.push({
          type: "premium",
          description: `اشتراك Premium جديد: ${user.name}`,
          date: new Date(sub.startDate).toLocaleDateString('ar-EG')
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
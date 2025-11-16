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

// Create CV files bucket on startup
const initStorage = async () => {
  try {
    const bucketName = "make-8a20c00b-cv-files";
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
      console.log(`Bucket ${bucketName} created successfully`);
    }

    // Create digital card files buckets
    const profileImagesBucket = "make-8a20c00b-profile-images";
    const cardCVsBucket = "make-8a20c00b-digital-cvs";
    
    // Profile images bucket (public)
    const profileBucketExists = buckets?.some(bucket => bucket.name === profileImagesBucket);
    if (!profileBucketExists) {
      await supabase.storage.createBucket(profileImagesBucket, {
        public: true,
        fileSizeLimit: 2097152 // 2MB
      });
      console.log(`Bucket ${profileImagesBucket} created successfully`);
    }

    // Digital card CVs bucket (private with signed URLs)
    const cvBucketExists = buckets?.some(bucket => bucket.name === cardCVsBucket);
    if (!cvBucketExists) {
      await supabase.storage.createBucket(cardCVsBucket, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
      console.log(`Bucket ${cardCVsBucket} created successfully`);
    }

    // Create news images bucket (public)
    const newsImagesBucket = "make-8a20c00b-news-images";
    const newsBucketExists = buckets?.some(bucket => bucket.name === newsImagesBucket);
    if (!newsBucketExists) {
      await supabase.storage.createBucket(newsImagesBucket, {
        public: true,
        fileSizeLimit: 3145728 // 3MB
      });
      console.log(`Bucket ${newsImagesBucket} created successfully`);
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

// Initialize storage
initStorage();

// Simple admin auth middleware (optional - for security)
const isAdmin = async (c: any, next: any) => {
  const adminToken = c.req.header("X-Admin-Token");
  
  // For now, allow all admin requests (you can add real verification later)
  // In production, you should verify the token against stored admin tokens
  console.log("Admin request with token:", adminToken ? "exists" : "missing");
  
  await next();
};

// Helper to sanitize filename for storage
const sanitizeFilename = (filename: string): string => {
  // Get file extension
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
  
  // Replace spaces and special chars with underscores, remove Arabic characters
  let sanitized = name
    .replace(/\s+/g, '_')                    // Replace spaces with underscores
    .replace(/[\u0600-\u06FF]/g, '')         // Remove Arabic characters
    .replace(/[^a-zA-Z0-9_-]/g, '_')         // Keep only alphanumeric, underscore, dash
    .replace(/_+/g, '_')                     // Replace multiple underscores with single
    .replace(/^_|_$/g, '');                  // Remove leading/trailing underscores
  
  // If name becomes empty after sanitization, use a default name
  if (!sanitized) {
    sanitized = 'cv_file';
  }
  
  return sanitized + extension;
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
    const { title, company, location, type, description, requirements, applicationUrl } = body;
    
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
      requirements: requirements || "",
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
    const { title, company, location, type, description, requirements, date, applicationUrl } = body;
    
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
      requirements: requirements || "",
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
    
    // Sign in with Supabase Auth لإنشاء session والحصول على access_token
    const authSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // محاولة تسجيل دخول للمستخدم في Supabase Auth
    const { data: signInData, error: signInError } = await authSupabase.auth.signInWithPassword({
      email,
      password
    });

    let accessToken = '';
    let userName = '';

    if (signInError) {
      console.log("Sign in failed, checking if user exists...", signInError.message);
      
      // جلب معلومات المستخدم من Auth
      const { data: { users }, error: listError } = await authSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      const existingUser = users?.find(u => u.email === email);
      
      if (existingUser) {
        // المستخدم موجود، نحدث كلمة المرور
        console.log("User exists, updating password...");
        const { data: updateData, error: updateError } = await authSupabase.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: password,
            email_confirm: true,
            user_metadata: { 
              role: 'admin', 
              name: allowedAdmin.email === 'as8543245@gmail.com' ? 'المدير العام' : 'أنور الرواحي'
            }
          }
        );
        
        if (updateError) {
          console.error("Error updating user password:", updateError);
          accessToken = `admin_${Date.now()}_${Math.random().toString(36)}`;
        } else {
          // محاولة تسجيل دخول مرة أخرى بعد تحديث كلمة المرور
          const { data: retrySignIn, error: retryError } = await authSupabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (retryError || !retrySignIn.session) {
            console.error("Error signing in after password update:", retryError);
            accessToken = `admin_${Date.now()}_${Math.random().toString(36)}`;
          } else {
            accessToken = retrySignIn.session.access_token;
            console.log("Successfully signed in after password update");
          }
        }
      } else {
        // المستخدم غير موجود، نقوم بإنشائه
        console.log("User doesn't exist, creating...");
        const { data: createData, error: createError } = await authSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { 
            role: 'admin', 
            name: allowedAdmin.email === 'as8543245@gmail.com' ? 'المدير العام' : 'أنور الرواحي'
          }
        });
        
        if (createError) {
          console.error("Error creating Auth user:", createError);
          accessToken = `admin_${Date.now()}_${Math.random().toString(36)}`;
        } else {
          // تسجيل دخول بعد الإنشاء
          const { data: newSignInData, error: newSignInError } = await authSupabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (newSignInError || !newSignInData.session) {
            console.error("Error signing in after creation:", newSignInError);
            accessToken = `admin_${Date.now()}_${Math.random().toString(36)}`;
          } else {
            accessToken = newSignInData.session.access_token;
            console.log("Successfully signed in after user creation");
          }
        }
      }
    } else if (signInData.session) {
      accessToken = signInData.session.access_token;
      console.log("Successfully signed in with existing credentials");
    } else {
      // إذا لم يوجد session، نستخدم token بديل
      console.log("No session returned, using fallback token");
      accessToken = `admin_${Date.now()}_${Math.random().toString(36)}`;
    }
    
    // Get admin from Supabase table
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !admin) {
      console.error("Error fetching admin from Supabase:", error);
      userName = allowedAdmin.email === 'as8543245@gmail.com' ? 'المدير العام' : 'أنور الرواحي';
    } else {
      userName = admin.name;
      
      // Update last login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email);
    }
    
    return c.json({
      success: true,
      token: accessToken, // استخدام access_token من Supabase Auth أو token بديل
      user: {
        email: email,
        name: userName,
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
    const { title, company, location, type, description, requirements, date, applicationUrl } = body;
    
    console.log("Creating job with data:", { title, company, location, type });
    
    if (!title || !company) {
      return c.json({ success: false, message: "اعنوان واسم الشركة مطلوبان" }, 400);
    }
    
    const jobData = {
      title,
      company,
      location: location || "مسقط",
      type: type || "دوام كامل",
      description: description || "",
      requirements: requirements || "",
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
    
    // Store user profile in users table (basic info only)
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
    
    // Create empty user_profiles entry
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: data.user.id,
        created_at: new Date().toISOString()
      }]);
    
    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Continue anyway - profile can be created later
    }
    
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
    
    // Get basic user info from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.error("Error fetching user from Supabase:", userError);
      return c.json({ success: false, error: "Profile not found" }, 404);
    }
    
    // Get detailed profile from user_profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          created_at: new Date().toISOString()
        }])
        .select('*')
        .single();
      
      // Merge basic info with empty profile
      const fullProfile = {
        ...toCamelCase(user),
        ...toCamelCase(newProfile)
      };
      
      return c.json({ success: true, profile: fullProfile });
    }
    
    // Merge basic user info with detailed profile
    const fullProfile = {
      ...toCamelCase(user),
      ...toCamelCase(userProfile)
    };
    
    return c.json({ success: true, profile: fullProfile });
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

// Update user profile
app.put("/make-server-8a20c00b/update-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { userId, name, phone, location, specialty, experience, skills, bio } = await c.req.json();
    
    // Verify the user is updating their own profile
    if (userId !== user.id) {
      return c.json({ success: false, error: "Unauthorized" }, 403);
    }

    // Update basic info (name) in users table
    if (name) {
      const { error: userError } = await supabase
        .from('users')
        .update({ name })
        .eq('id', userId);

      if (userError) {
        console.error("Error updating user name:", userError);
      }
    }

    // Ensure skills is an array
    let skillsArray = [];
    if (skills) {
      if (Array.isArray(skills)) {
        skillsArray = skills;
      } else if (typeof skills === 'string') {
        skillsArray = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    // Check if user_profiles record exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let profile;
    let profileError;

    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          phone,
          location,
          specialty,
          experience,
          skills: skillsArray,
          bio,
          created_at: new Date().toISOString()
        }])
        .select('*')
        .single();
      
      profile = newProfile;
      profileError = insertError;
    } else {
      // Profile exists, update it
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          phone,
          location,
          specialty,
          experience,
          skills: skillsArray,
          bio,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single();
      
      profile = updatedProfile;
      profileError = updateError;
    }

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return c.json({ success: false, error: "فشل تحديث البيانات" }, 500);
    }

    // Get complete profile
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const fullProfile = {
      ...toCamelCase(userData),
      ...toCamelCase(profile)
    };

    return c.json({ success: true, profile: fullProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete user account (self-deletion)
app.delete("/make-server-8a20c00b/delete-account", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const bucketName = "make-8a20c00b-cv-files";
    
    // Delete CV files from storage
    const { data: files } = await supabase.storage
      .from(bucketName)
      .list(user.id);
    
    if (files && files.length > 0) {
      const filePaths = files.map(file => `${user.id}/${file.name}`);
      await supabase.storage
        .from(bucketName)
        .remove(filePaths);
    }

    // Delete CV files records from database
    await supabase
      .from('cv_files')
      .delete()
      .eq('user_id', user.id);

    // Delete user profile from user_profiles table
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', user.id);

    // Delete premium subscriptions (if any)
    await supabase
      .from('premium_subscriptions')
      .delete()
      .eq('user_id', user.id);
    
    // Delete user from users table
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);
    
    if (deleteError) {
      console.error("Error deleting user profile:", deleteError);
      return c.json({ success: false, error: "فشل في حذف الحساب" }, 500);
    }
    
    // Delete user from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (authDeleteError) {
      console.error("Error deleting user from auth:", authDeleteError);
      // Continue anyway since we deleted from users table
    }
    
    return c.json({ success: true, message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload CV file
app.post("/make-server-8a20c00b/upload-cv", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ success: false, error: "الملف أكبر من 5 ميجا" }, 400);
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: "نوع الملف غير مدعوم. يرجى رفع PDF أو Word" }, 400);
    }

    // Check if user already has 5 files
    const { data: existingFiles, error: countError } = await supabase
      .from('cv_files')
      .select('id')
      .eq('user_id', user.id);
    
    if (existingFiles && existingFiles.length >= 5) {
      return c.json({ success: false, error: "لا يمكن رفع أكثر من 5 ملفات" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${sanitizeFilename(file.name)}`;
    const filePath = `${user.id}/${filename}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const bucketName = "make-8a20c00b-cv-files";
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return c.json({ success: false, error: "فشل رفع الملف" }, 500);
    }

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('cv_files')
      .insert([{
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type
      }])
      .select('*')
      .single();

    if (dbError) {
      console.error("Error saving file metadata:", dbError);
      // Delete uploaded file if database insert fails
      await supabase.storage.from(bucketName).remove([filePath]);
      return c.json({ success: false, error: "فشل حفظ بيانات الملف" }, 500);
    }

    return c.json({ 
      success: true, 
      file: toCamelCase(fileRecord)
    });
  } catch (error) {
    console.error("Error uploading CV:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user's CV files
app.get("/make-server-8a20c00b/cv-files", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const bucketName = "make-8a20c00b-cv-files";
    
    // Get files from database
    const { data: fileRecords, error: dbError } = await supabase
      .from('cv_files')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (dbError) {
      console.log("CV files table not available or error fetching files:", dbError.message);
      // Return empty array instead of error - CV feature is optional
      return c.json({ success: true, files: [] });
    }

    // Generate signed URLs for each file (valid for 1 hour)
    const filesWithUrls = await Promise.all(
      (fileRecords || []).map(async (fileRecord: any) => {
        const { data: urlData } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileRecord.file_path, 3600); // 1 hour

        return {
          id: fileRecord.id,
          name: fileRecord.file_name,
          path: fileRecord.file_path,
          size: fileRecord.file_size,
          type: fileRecord.file_type,
          uploadedAt: fileRecord.uploaded_at,
          url: urlData?.signedUrl || ''
        };
      })
    );

    return c.json({ success: true, files: filesWithUrls });
  } catch (error) {
    console.error("Error fetching CV files:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete CV file
app.delete("/make-server-8a20c00b/cv-files", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { filePath } = await c.req.json();
    
    if (!filePath) {
      return c.json({ success: false, error: "File path is required" }, 400);
    }

    // Verify the file belongs to the user
    if (!filePath.startsWith(`${user.id}/`)) {
      return c.json({ success: false, error: "Unauthorized" }, 403);
    }

    // Delete from database first
    const { error: dbError } = await supabase
      .from('cv_files')
      .delete()
      .eq('file_path', filePath)
      .eq('user_id', user.id);

    if (dbError) {
      console.error("Error deleting file from database:", dbError);
      return c.json({ success: false, error: "فشل حذف الملف من قاعدة البيانات" }, 500);
    }

    // Delete from storage
    const bucketName = "make-8a20c00b-cv-files";
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
      // File might already be deleted, but we already removed from DB
    }

    return c.json({ success: true, message: "تم حذف الملف بنجاح" });
  } catch (error) {
    console.error("Error deleting CV file:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// DIGITAL CARD ROUTES
// ============================================

// Upload file for digital card (profile image or CV)
app.post("/make-server-8a20c00b/upload-card-file", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'profile_image' or 'cv'
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    if (!type || (type !== 'profile_image' && type !== 'cv')) {
      return c.json({ success: false, error: "Invalid file type" }, 400);
    }

    // Validate file based on type
    if (type === 'profile_image') {
      // Check file size (2MB max for images)
      if (file.size > 2 * 1024 * 1024) {
        return c.json({ success: false, error: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" }, 400);
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        return c.json({ success: false, error: "يرجى اختيار صورة فقط" }, 400);
      }
    } else if (type === 'cv') {
      // Check file size (5MB max for CV)
      if (file.size > 5 * 1024 * 1024) {
        return c.json({ success: false, error: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" }, 400);
      }

      // Check file type
      if (file.type !== 'application/pdf') {
        return c.json({ success: false, error: "يرجى اختيار ملف PDF فقط" }, 400);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${sanitizeFilename(file.name)}`;
    
    // Select bucket based on type
    const bucketName = type === 'profile_image' 
      ? 'make-8a20c00b-profile-images' 
      : 'make-8a20c00b-digital-cvs';
    
    const filePath = `${user.id}/${filename}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return c.json({ success: false, error: "فشل رفع الملف" }, 500);
    }

    // Get public URL for the file
    let fileUrl;
    
    if (type === 'profile_image') {
      // Public bucket - get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    } else {
      // Private bucket - create signed URL (valid for 1 year)
      const { data: urlData, error: urlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 31536000); // 1 year in seconds
      
      if (urlError) {
        console.error("Error creating signed URL:", urlError);
        return c.json({ success: false, error: "فشل إنشاء رابط الملف" }, 500);
      }
      
      fileUrl = urlData.signedUrl;
    }

    return c.json({ 
      success: true, 
      url: fileUrl,
      path: filePath
    });
  } catch (error) {
    console.error("Error uploading card file:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create digital card
app.post("/make-server-8a20c00b/digital-card", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { 
      full_name, 
      job_title, 
      phone, 
      email, 
      whatsapp, 
      linkedin, 
      bio,
      profile_image_url,
      cv_url
    } = body;

    if (!full_name) {
      return c.json({ success: false, error: "الاسم الكامل مطلوب" }, 400);
    }

    // Check if user already has a card
    const { data: existingCard } = await supabase
      .from('digital_cards')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingCard) {
      return c.json({ success: false, error: "لديك بطاقة رقمية بالفعل. استخدم التحديث بدلاً من الإنشاء" }, 400);
    }

    const cardData = {
      user_id: user.id,
      full_name,
      job_title: job_title || null,
      phone: phone || null,
      email: email || null,
      whatsapp: whatsapp || null,
      linkedin: linkedin || null,
      bio: bio || null,
      profile_image_url: profile_image_url || null,
      cv_url: cv_url || null,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data: card, error } = await supabase
      .from('digital_cards')
      .insert([cardData])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating digital card:", error);
      return c.json({ success: false, error: "فشل إنشاء البطاقة الرقمية" }, 500);
    }

    return c.json({ 
      success: true, 
      cardId: card.id,
      card: toCamelCase(card)
    });
  } catch (error) {
    console.error("Error creating digital card:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update digital card
app.put("/make-server-8a20c00b/digital-card", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { 
      full_name, 
      job_title, 
      phone, 
      email, 
      whatsapp, 
      linkedin, 
      bio,
      profile_image_url,
      cv_url
    } = body;

    if (!full_name) {
      return c.json({ success: false, error: "الاسم الكامل مطلوب" }, 400);
    }

    const cardData = {
      full_name,
      job_title: job_title || null,
      phone: phone || null,
      email: email || null,
      whatsapp: whatsapp || null,
      linkedin: linkedin || null,
      bio: bio || null,
      profile_image_url: profile_image_url || null,
      cv_url: cv_url || null,
      updated_at: new Date().toISOString()
    };

    const { data: card, error } = await supabase
      .from('digital_cards')
      .update(cardData)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating digital card:", error);
      return c.json({ success: false, error: "فشل تحديث البطاقة الرقمية" }, 500);
    }

    return c.json({ 
      success: true, 
      cardId: card.id,
      card: toCamelCase(card)
    });
  } catch (error) {
    console.error("Error updating digital card:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// AMWAL PAY PAYMENT INTEGRATION
// ============================================

// Create payment session with Amwal Pay
app.post("/make-server-8a20c00b/payment/create-session", async (c) => {
  try {
    const { planType, userId, userEmail, userName } = await c.req.json();
    
    // Validate input
    if (!planType || !userId) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    // Get Amwal Pay API key from environment
    const amwalMerchantId = Deno.env.get("AMWAL_MERCHANT_ID");
    const amwalApiKey = Deno.env.get("AMWAL_API_KEY");
    
    if (!amwalMerchantId || !amwalApiKey) {
      console.log("AMWAL credentials not configured - payment system not available");
      return c.json({ 
        success: false, 
        error: "نظام الدفع غير مكتمل الإعداد. يرجى إضافة مفاتيح Amwal Pay في إعدادات المشروع." 
      }, 400);
    }

    // Determine plan details
    const planDetails = planType === "yearly" 
      ? { amount: 10.00, duration: 12, name: "سنوي" } // 10 OMR
      : { amount: 6.00, duration: 6, name: "نصف سنوي" }; // 6 OMR

    // Generate unique transaction reference
    const transactionRef = `OMANJOBS_${userId}_${Date.now()}`;

    // Create payment request with Amwal Pay
    const amwalResponse = await fetch("https://api.amwal.tech/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${amwalApiKey}`,
        "X-Merchant-ID": amwalMerchantId
      },
      body: JSON.stringify({
        amount: planDetails.amount,
        currency: "OMR",
        description: `اشتراك Premium - ${planDetails.name}`,
        merchant_reference: transactionRef,
        customer_email: userEmail || "",
        customer_name: userName || "",
        callback_url: `${c.req.header("origin") || "https://your-site.com"}/payment/success`,
        cancel_url: `${c.req.header("origin") || "https://your-site.com"}/premium`,
        metadata: {
          user_id: userId,
          plan_type: planType,
          duration_months: planDetails.duration.toString()
        }
      })
    });

    const result = await amwalResponse.json();

    if (!amwalResponse.ok || result.status !== "success") {
      console.error("Amwal Pay API error:", result);
      return c.json({ 
        success: false, 
        error: "فشل إنشاء جلسة الدفع",
        details: result 
      }, 500);
    }

    // Store transaction reference in database for verification
    await supabase
      .from('payment_sessions')
      .insert([{
        transaction_ref: transactionRef,
        user_id: userId,
        plan_type: planType,
        amount: planDetails.amount,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

    // Return payment URL
    return c.json({
      success: true,
      transactionRef: transactionRef,
      checkoutUrl: result.data.payment_url,
      transactionData: result.data
    });

  } catch (error) {
    console.error("Error creating payment session:", error);
    return c.json({ 
      success: false, 
      error: "حدث خطأ أثناء إنشاء جلسة الدفع",
      details: String(error) 
    }, 500);
  }
});

// Verify payment and activate subscription with Amwal Pay
app.post("/make-server-8a20c00b/payment/verify", async (c) => {
  try {
    const { transactionRef } = await c.req.json();

    if (!transactionRef) {
      return c.json({ success: false, error: "Missing transaction reference" }, 400);
    }

    const amwalMerchantId = Deno.env.get("AMWAL_MERCHANT_ID");
    const amwalApiKey = Deno.env.get("AMWAL_API_KEY");
    
    if (!amwalMerchantId || !amwalApiKey) {
      console.log("AMWAL credentials not configured - payment verification not available");
      return c.json({ 
        success: false, 
        error: "نظام الدفع غير مكتمل الإعداد. يرجى إضافة مفاتيح Amwal Pay." 
      }, 400);
    }

    // Get transaction details from Amwal Pay
    const amwalResponse = await fetch(
      `https://api.amwal.tech/v1/transactions/${transactionRef}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${amwalApiKey}`,
          "X-Merchant-ID": amwalMerchantId
        }
      }
    );

    const result = await amwalResponse.json();

    if (!amwalResponse.ok || result.status !== "success") {
      console.error("Error verifying payment:", result);
      return c.json({ 
        success: false, 
        error: "فشل التحقق من الدفع" 
      }, 500);
    }

    const transaction = result.data;

    // Check if payment was successful
    if (transaction.payment_status !== "completed" && transaction.payment_status !== "success") {
      return c.json({
        success: false,
        error: "ا��دفع غير مكتمل",
        paymentStatus: transaction.payment_status
      }, 400);
    }

    // Get payment session from database
    const { data: paymentSession, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (sessionError || !paymentSession) {
      console.error("Payment session not found:", sessionError);
      return c.json({ 
        success: false, 
        error: "جلسة الدفع غير موجودة" 
      }, 400);
    }

    const userId = paymentSession.user_id;
    const planType = paymentSession.plan_type;
    const durationMonths = planType === "yearly" ? 12 : 6;

    if (!userId) {
      return c.json({ 
        success: false, 
        error: "معلومات المستخدم مفقودة" 
      }, 400);
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Check if user already has an active subscription
    const { data: existingSub, error: checkError } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      // Update existing subscription (extend it)
      const currentEndDate = new Date(existingSub.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

      const { error: updateError } = await supabase
        .from('premium_subscriptions')
        .update({
          end_date: newEndDate.toISOString(),
          plan_type: planType,
          payment_session_id: transactionRef,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub.id);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return c.json({ 
          success: false, 
          error: "فشل تحديث الاشتراك" 
        }, 500);
      }

      return c.json({
        success: true,
        message: "تم تمديد اشتراكك بنجاح",
        subscription: {
          ...existingSub,
          endDate: newEndDate.toISOString()
        }
      });
    } else {
      // Create new subscription
      const { data: newSub, error: insertError } = await supabase
        .from('premium_subscriptions')
        .insert([{
          user_id: userId,
          plan_type: planType,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          payment_session_id: transactionRef,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating subscription:", insertError);
        return c.json({ 
          success: false, 
          error: "فشل إنشاء الاشتراك" 
        }, 500);
      }

      return c.json({
        success: true,
        message: "تم تفعيل اشتراكك بنجاح",
        subscription: toCamelCase(newSub)
      });
    }

  } catch (error) {
    console.error("Error verifying payment:", error);
    return c.json({ 
      success: false, 
      error: "حدث خطأ أثناء التحقق من الدفع",
      details: String(error) 
    }, 500);
  }
});

// ============================================
// NEWS MANAGEMENT
// ============================================

// Get all news articles (Public - no auth required)
app.get("/make-server-8a20c00b/news", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching news from Supabase:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ 
      success: true, 
      news: data || []
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single news article (Public)
app.get("/make-server-8a20c00b/news/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return c.json({ success: false, error: "الخبر غير موجود" }, 404);
    }

    return c.json({ 
      success: true, 
      news: data
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload news image (Admin only)
app.post("/make-server-8a20c00b/admin/upload-news-image", async (c) => {
  try {
    // Get access token from Authorization header
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized - No token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      console.error("Auth error in upload news image:", authError);
      return c.json({ success: false, error: "Unauthorized - Invalid token" }, 401);
    }

    // Verify user is admin
    const adminEmails = ['as8543245@gmail.com', 'anwaralrawahi459@gmail.com'];
    if (!adminEmails.includes(user.email || '')) {
      console.log(`Non-admin user attempted upload: ${user.email}`);
      return c.json({ success: false, error: "Unauthorized - Admin access required" }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, error: "لم يتم تحديد صورة" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ success: false, error: "يرجى اختيار صورة فقط" }, 400);
    }

    // Check file size (3MB max for news images)
    if (file.size > 3 * 1024 * 1024) {
      return c.json({ success: false, error: "حجم الصورة يجب أن يكون أقل من 3 ميجابايت" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `news_${timestamp}.${extension}`;
    
    const bucketName = 'make-8a20c00b-news-images';
    const filePath = filename;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading news image:", uploadError);
      return c.json({ success: false, error: "فشل رفع الصورة" }, 500);
    }

    // Get public URL for the image
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return c.json({ 
      success: true, 
      imageUrl: urlData.publicUrl,
      message: "تم رفع الصورة بنجاح"
    });

  } catch (error) {
    console.error("Error in upload news image route:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create news article (Admin only)
app.post("/make-server-8a20c00b/admin/news", async (c) => {
  try {
    const { title, summary, content, imageUrl, date } = await c.req.json();

    if (!title || !summary) {
      return c.json({ success: false, error: "العنوان والملخص مطلوبان" }, 400);
    }

    // Get access token from Authorization header
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );

    const newsData = {
      title,
      summary,
      content: content || summary,
      image_url: imageUrl || null,
      date: date || new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('news')
      .insert([newsData])
      .select()
      .single();

    if (error) {
      console.error("Error creating news in Supabase:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ 
      success: true, 
      news: data
    });
  } catch (error) {
    console.error("Error creating news:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update news article (Admin only)
app.put("/make-server-8a20c00b/admin/news/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { title, summary, content, imageUrl, date } = await c.req.json();

    // Get access token from Authorization header
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );

    const newsData = {
      title,
      summary,
      content,
      image_url: imageUrl || null,
      date,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('news')
      .update(newsData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating news in Supabase:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    if (!data) {
      return c.json({ success: false, error: "الخبر غير موجود" }, 404);
    }

    return c.json({ 
      success: true, 
      news: data
    });
  } catch (error) {
    console.error("Error updating news:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete news article (Admin only)
app.delete("/make-server-8a20c00b/admin/news/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get access token from Authorization header
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    );

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting news from Supabase:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, message: "تم حذف الخبر بنجاح" });
  } catch (error) {
    console.error("Error deleting news:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CONTACT FORM ROUTES
// ============================================

// Submit contact message (public - no auth required)
app.post("/make-server-8a20c00b/contact", async (c) => {
  try {
    const { name, email, phone, requestType, message } = await c.req.json();

    // Validate required fields
    if (!name || !email || !requestType || !message) {
      return c.json({ 
        success: false, 
        error: "جميع الحقول المطلوبة يجب أن تكون مملوءة" 
      }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ 
        success: false, 
        error: "البريد الإلكتروني غير صحيح" 
      }, 400);
    }

    // Validate request type
    const validTypes = ['general', 'technical', 'refund', 'ai-service'];
    if (!validTypes.includes(requestType)) {
      return c.json({ 
        success: false, 
        error: "نوع الطلب غير صحيح" 
      }, 400);
    }

    // Validate message length
    if (message.trim().length < 10) {
      return c.json({ 
        success: false, 
        error: "الرسالة يجب أن تكون 10 أحرف على الأقل" 
      }, 400);
    }

    // Insert into database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : null,
          request_type: requestType,
          message: message.trim(),
          status: 'new',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting contact message:", error);
      return c.json({ 
        success: false, 
        error: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى." 
      }, 500);
    }

    console.log("Contact message saved successfully:", data?.id);

    return c.json({ 
      success: true, 
      message: "تم إرسال رسالتك بنجاح!",
      id: data?.id
    });

  } catch (error) {
    console.error("Error in contact form submission:", error);
    return c.json({ 
      success: false, 
      error: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." 
    }, 500);
  }
});

// Get all contact messages (Admin only)
app.get("/make-server-8a20c00b/admin/contact-messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return c.json({ success: false, error: "Unauthorized - Admin access required" }, 403);
    }

    // Get all messages
    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, messages: messages || [] });

  } catch (error) {
    console.error("Error in get contact messages:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update contact message status (Admin only)
app.put("/make-server-8a20c00b/admin/contact-messages/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const messageId = c.req.param('id');
    const { status } = await c.req.json();

    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return c.json({ success: false, error: "Unauthorized - Admin access required" }, 403);
    }

    // Validate status
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, error: "Invalid status" }, 400);
    }

    // Update message status
    const { error } = await supabase
      .from('contact_messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      console.error("Error updating message status:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, message: "تم تحديث حالة الرسالة بنجاح" });

  } catch (error) {
    console.error("Error in update contact message:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
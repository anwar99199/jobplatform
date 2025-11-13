// خوارزمية حساب نسبة التوافق بين المستخدم والوظيفة

interface UserProfile {
  skills?: string | string[];
  experience?: string;
  specialty?: string;
  location?: string;
  education?: string;
}

interface Job {
  title: string;
  requirements?: string;
  description?: string;
  location?: string;
  company?: string;
  type?: string;
}

/**
 * حساب نسبة التوافق بين بيانات المستخدم ومتطلبات الوظيفة
 * @param userProfile - بيانات البروفايل للمستخدم
 * @param job - بيانات الوظيفة
 * @returns نسبة مئوية من 0 إلى 100
 */
export function calculateJobMatch(userProfile: UserProfile, job: Job): number {
  let totalScore = 0;
  let maxScore = 0;

  // 1. تحليل المهارات (الوزن: 40%)
  const skillsScore = calculateSkillsMatch(userProfile.skills, job.requirements, job.description);
  totalScore += skillsScore * 0.4;
  maxScore += 100 * 0.4;

  // 2. تحليل الخبرة (الوزن: 25%)
  const experienceScore = calculateExperienceMatch(userProfile.experience, job.requirements);
  totalScore += experienceScore * 0.25;
  maxScore += 100 * 0.25;

  // 3. تحليل التخصص (الوزن: 20%)
  const specialtyScore = calculateSpecialtyMatch(userProfile.specialty, job.title, job.description);
  totalScore += specialtyScore * 0.2;
  maxScore += 100 * 0.2;

  // 4. تحليل الموقع الجغرافي (الوزن: 10%)
  const locationScore = calculateLocationMatch(userProfile.location, job.location);
  totalScore += locationScore * 0.1;
  maxScore += 100 * 0.1;

  // 5. تحليل المؤهلات (الوزن: 5%)
  const educationScore = calculateEducationMatch(userProfile.education, job.requirements);
  totalScore += educationScore * 0.05;
  maxScore += 100 * 0.05;

  // حساب النسبة المئوية النهائية
  const matchPercentage = Math.round((totalScore / maxScore) * 100);
  
  // التأكد من أن النسبة بين 0 و 100
  return Math.max(0, Math.min(100, matchPercentage));
}

/**
 * حساب توافق المهارات
 */
function calculateSkillsMatch(
  userSkills: string | string[] | undefined,
  requirements?: string,
  description?: string
): number {
  if (!userSkills) return 30; // نسبة افتراضية منخفضة إذا لم تكن هناك مهارات

  // تحويل المهارات إلى array
  let skillsArray: string[] = [];
  if (typeof userSkills === 'string') {
    skillsArray = userSkills.split(',').map(s => s.trim().toLowerCase());
  } else if (Array.isArray(userSkills)) {
    skillsArray = userSkills.map(s => s.toLowerCase());
  }

  if (skillsArray.length === 0) return 30;

  // استخراج الكلمات المفتاحية من متطلبات الوظيفة
  const jobText = `${requirements || ''} ${description || ''}`.toLowerCase();
  
  // قائمة المهارات التقنية الشائعة
  const technicalSkills = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes',
    'git', 'agile', 'scrum', 'api', 'rest', 'graphql',
    'html', 'css', 'typescript', 'php', 'laravel', 'django',
    'flutter', 'swift', 'kotlin', 'android', 'ios',
    'تطوير', 'برمجة', 'تصميم', 'إدارة', 'تسويق', 'مبيعات',
    'محاسبة', 'هندسة', 'طب', 'تدريس', 'تعليم'
  ];

  let matchedCount = 0;
  let totalSkills = skillsArray.length;

  // مقارنة مهارات المستخدم مع متطلبات الوظيفة
  skillsArray.forEach(skill => {
    // مطابقة مباشرة
    if (jobText.includes(skill)) {
      matchedCount += 1;
      return;
    }

    // مطابقة جزئية للمهارات التقنية
    technicalSkills.forEach(techSkill => {
      if (skill.includes(techSkill) && jobText.includes(techSkill)) {
        matchedCount += 0.5;
      }
    });
  });

  // حساب النسبة المئوية
  const matchRatio = totalSkills > 0 ? matchedCount / totalSkills : 0;
  
  // إضافة نقاط إضافية إذا كان لدى المستخدم مهارات كثيرة
  let score = matchRatio * 100;
  if (totalSkills >= 5) score += 10;
  if (totalSkills >= 10) score += 5;

  return Math.min(100, score);
}

/**
 * حساب توافق الخبرة
 */
function calculateExperienceMatch(
  userExperience?: string,
  requirements?: string
): number {
  if (!userExperience) return 40; // نسبة افتراضية متوسطة

  const experienceText = userExperience.toLowerCase();
  const requirementsText = (requirements || '').toLowerCase();

  // استخراج سنوات الخبرة من نص المستخدم
  const userYearsMatch = experienceText.match(/(\d+)\s*(سنة|سنوات|عام|أعوام|year|years)/);
  const userYears = userYearsMatch ? parseInt(userYearsMatch[1]) : 0;

  // استخراج سنوات الخبرة المطلوبة
  const reqYearsMatch = requirementsText.match(/(\d+)\s*(سنة|سنوات|عام|أعوام|year|years)/);
  const requiredYears = reqYearsMatch ? parseInt(reqYearsMatch[1]) : 0;

  let score = 50; // نسبة أساسية

  // مقارنة سنوات الخبرة
  if (requiredYears > 0 && userYears > 0) {
    if (userYears >= requiredYears) {
      score = 100;
    } else {
      // نسبة متناسبة مع الفارق
      score = (userYears / requiredYears) * 100;
    }
  } else if (userYears > 0) {
    // لديه خبرة حتى لو لم تكن محددة في المتطلبات
    if (userYears >= 3) score = 80;
    else if (userYears >= 1) score = 60;
    else score = 40;
  }

  // مكافأة إضافية للخبرة الطويلة
  if (userYears >= 5) score = Math.min(100, score + 10);
  if (userYears >= 10) score = Math.min(100, score + 5);

  return score;
}

/**
 * حساب توافق التخصص
 */
function calculateSpecialtyMatch(
  userSpecialty?: string,
  jobTitle?: string,
  jobDescription?: string
): number {
  if (!userSpecialty) return 50; // نسبة افتراضية متوسطة

  const specialtyLower = userSpecialty.toLowerCase();
  const titleLower = (jobTitle || '').toLowerCase();
  const descLower = (jobDescription || '').toLowerCase();

  // قاموس التخصصات المتشابهة
  const specialtyGroups: { [key: string]: string[] } = {
    'تطوير': ['برمجة', 'مطور', 'developer', 'programmer', 'software', 'engineer'],
    'تصميم': ['مصمم', 'designer', 'ui', 'ux', 'graphic'],
    'تسويق': ['marketing', 'إعلان', 'دعاية', 'تسويق رقمي'],
    'محاسبة': ['محاسب', 'accountant', 'مالية', 'finance'],
    'إدارة': ['مدير', 'manager', 'إدارة مشاريع', 'قيادة'],
    'مبيعات': ['sales', 'بيع', 'تجارة'],
    'هندسة': ['engineer', 'مهندس', 'هندسة'],
    'تدريس': ['معلم', 'teacher', 'تعليم', 'education']
  };

  // مطابقة مباشرة
  if (titleLower.includes(specialtyLower) || descLower.includes(specialtyLower)) {
    return 100;
  }

  // مطابقة باستخدام المجموعات
  for (const [group, keywords] of Object.entries(specialtyGroups)) {
    if (specialtyLower.includes(group)) {
      for (const keyword of keywords) {
        if (titleLower.includes(keyword) || descLower.includes(keyword)) {
          return 85;
        }
      }
    }
  }

  // مطابقة جزئية - البحث عن كلمات مشتركة
  const specialtyWords = specialtyLower.split(' ');
  let matchCount = 0;
  
  specialtyWords.forEach(word => {
    if (word.length > 3) { // تجاهل الكلمات القصيرة
      if (titleLower.includes(word) || descLower.includes(word)) {
        matchCount++;
      }
    }
  });

  if (matchCount > 0) {
    return Math.min(75, 50 + (matchCount * 15));
  }

  return 50; // نسبة افتراضية إذا لم يتم العثور على مطابقة
}

/**
 * حساب توافق الموقع الجغرافي
 */
function calculateLocationMatch(
  userLocation?: string,
  jobLocation?: string
): number {
  if (!userLocation || !jobLocation) return 70; // نسبة افتراضية جيدة إذا لم يكن الموقع محدد

  const userLoc = userLocation.toLowerCase();
  const jobLoc = jobLocation.toLowerCase();

  // مطابقة كاملة
  if (userLoc === jobLoc) return 100;

  // مطابقة جزئية (نفس المحافظة أو المنطقة)
  if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) return 90;

  // مواقع قريبة في عمان
  const omanCities: { [key: string]: string[] } = {
    'مسقط': ['السيب', 'بوشر', 'مطرح', 'العذيبة', 'الخوض', 'القرم'],
    'صلالة': ['ظفار'],
    'صحار': ['الباطنة', 'شمال الباطنة'],
    'نزوى': ['الداخلية'],
    'صور': ['الشرقية']
  };

  for (const [mainCity, nearCities] of Object.entries(omanCities)) {
    if (userLoc.includes(mainCity)) {
      for (const nearCity of nearCities) {
        if (jobLoc.includes(nearCity)) return 80;
      }
    }
  }

  // الوظائف عن بعد
  if (jobLoc.includes('عن بعد') || jobLoc.includes('remote') || 
      jobLoc.includes('أي مكان') || jobLoc.includes('anywhere')) {
    return 100;
  }

  // مواقع مختلفة
  return 50;
}

/**
 * حساب توافق المؤهلات الدراسية
 */
function calculateEducationMatch(
  userEducation?: string,
  requirements?: string
): number {
  if (!userEducation && !requirements) return 70; // افتراضياً جيد إذا لم يكن مطلوب
  if (!userEducation) return 50; // متوسط إذا كان مطلوب ولم يقدم

  const eduLower = userEducation.toLowerCase();
  const reqLower = (requirements || '').toLowerCase();

  // المؤهلات العلمية
  const degrees = {
    'دكتوراه': 5,
    'ماجستير': 4,
    'بكالوريوس': 3,
    'دبلوم': 2,
    'ثانوية': 1
  };

  let userLevel = 2; // افتراضي دبلوم
  let requiredLevel = 2;

  // تحديد مستوى المستخدم
  for (const [degree, level] of Object.entries(degrees)) {
    if (eduLower.includes(degree)) {
      userLevel = Math.max(userLevel, level);
    }
  }

  // تحديد المستوى المطلوب
  for (const [degree, level] of Object.entries(degrees)) {
    if (reqLower.includes(degree)) {
      requiredLevel = Math.max(requiredLevel, level);
    }
  }

  // المقارنة
  if (userLevel >= requiredLevel) {
    return 100;
  } else if (userLevel === requiredLevel - 1) {
    return 70; // قريب من المطلوب
  } else {
    return 50; // أقل من المطلوب
  }
}

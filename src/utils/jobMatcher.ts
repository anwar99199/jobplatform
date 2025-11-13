// خوارزمية حساب نسبة التوافق مع الوظيفة

interface UserProfile {
  name?: string;
  skills?: string;
  experience?: string;
  education?: string;
  specialty?: string;
  location?: string;
  phone?: string;
  bio?: string;
}

interface Job {
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  type?: string;
  company?: string;
}

/**
 * حساب نسبة التوافق بين المستخدم والوظيفة
 * @param userProfile - بيانات المستخدم من البروفايل
 * @param job - بيانات الوظيفة
 * @returns نسبة التوافق من 0 إلى 100
 */
export function calculateJobMatch(userProfile: UserProfile, job: Job): number {
  if (!userProfile || !job) return 0;

  let totalScore = 0;
  let maxScore = 0;

  // 1. تحليل المهارات (الوزن: 35%)
  const skillsWeight = 35;
  if (userProfile.skills && (job.requirements || job.description)) {
    const userSkills = extractKeywords(userProfile.skills);
    const jobRequirements = extractKeywords(
      `${job.requirements || ''} ${job.description || ''}`
    );
    
    const skillsMatch = calculateKeywordMatch(userSkills, jobRequirements);
    totalScore += skillsMatch * skillsWeight;
  }
  maxScore += skillsWeight;

  // 2. تحليل الخبرة (الوزن: 25%)
  const experienceWeight = 25;
  if (userProfile.experience) {
    const yearsOfExperience = extractYearsOfExperience(userProfile.experience);
    const requiredYears = extractYearsOfExperience(job.requirements || '');
    
    let experienceScore = 0;
    if (requiredYears === 0 || yearsOfExperience >= requiredYears) {
      experienceScore = 1;
    } else if (yearsOfExperience >= requiredYears * 0.7) {
      experienceScore = 0.8;
    } else if (yearsOfExperience >= requiredYears * 0.5) {
      experienceScore = 0.6;
    } else {
      experienceScore = 0.4;
    }
    
    totalScore += experienceScore * experienceWeight;
  }
  maxScore += experienceWeight;

  // 3. تحليل التخصص (الوزن: 20%)
  const specialtyWeight = 20;
  if (userProfile.specialty && (job.title || job.requirements)) {
    const specialtyKeywords = extractKeywords(userProfile.specialty);
    const jobKeywords = extractKeywords(
      `${job.title} ${job.requirements || ''}`
    );
    
    const specialtyMatch = calculateKeywordMatch(specialtyKeywords, jobKeywords);
    totalScore += specialtyMatch * specialtyWeight;
  }
  maxScore += specialtyWeight;

  // 4. تحليل الموقع (الوزن: 10%)
  const locationWeight = 10;
  if (userProfile.location && job.location) {
    const locationMatch = userProfile.location.toLowerCase().includes(job.location.toLowerCase()) ||
                          job.location.toLowerCase().includes(userProfile.location.toLowerCase());
    
    totalScore += (locationMatch ? 1 : 0.5) * locationWeight;
  }
  maxScore += locationWeight;

  // 5. تحليل المؤهل الدراسي (الوزن: 10%)
  const educationWeight = 10;
  if (userProfile.education && job.requirements) {
    const educationKeywords = extractKeywords(userProfile.education);
    const requirementsKeywords = extractKeywords(job.requirements);
    
    const educationMatch = calculateKeywordMatch(educationKeywords, requirementsKeywords);
    totalScore += educationMatch * educationWeight;
  }
  maxScore += educationWeight;

  // حساب النسبة النهائية
  const finalPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  // التأكد من أن النسبة بين 0 و 100
  return Math.min(Math.max(finalPercentage, 0), 100);
}

/**
 * استخراج الكلمات المفتاحية من النص
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // تحويل النص لأحرف صغيرة وتقسيمه
  const words = text.toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s]/gi, ' ') // إزالة الرموز الخاصة
    .split(/\s+/)
    .filter(word => word.length > 2); // فقط الكلمات أطول من حرفين

  // إزالة الكلمات الشائعة غير المفيدة
  const stopWords = [
    'من', 'في', 'إلى', 'على', 'أن', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي',
    'and', 'the', 'is', 'to', 'in', 'for', 'of', 'with', 'on', 'at'
  ];
  
  return words.filter(word => !stopWords.includes(word));
}

/**
 * حساب نسبة التطابق بين مجموعتين من الكلمات المفتاحية
 */
function calculateKeywordMatch(userKeywords: string[], jobKeywords: string[]): number {
  if (userKeywords.length === 0 || jobKeywords.length === 0) return 0;
  
  let matchCount = 0;
  
  // حساب عدد الكلمات المتطابقة أو المشابهة
  for (const userKeyword of userKeywords) {
    for (const jobKeyword of jobKeywords) {
      // مطابقة كاملة
      if (userKeyword === jobKeyword) {
        matchCount += 1;
        break;
      }
      // مطابقة جزئية (كلمة تحتوي على الأخرى)
      else if (
        userKeyword.length > 3 && jobKeyword.length > 3 &&
        (userKeyword.includes(jobKeyword) || jobKeyword.includes(userKeyword))
      ) {
        matchCount += 0.7;
        break;
      }
      // تشابه في البداية
      else if (
        userKeyword.length > 3 && jobKeyword.length > 3 &&
        userKeyword.substring(0, 3) === jobKeyword.substring(0, 3)
      ) {
        matchCount += 0.5;
        break;
      }
    }
  }
  
  // حساب النسبة بناءً على المتوسط بين مجموعتي الكلمات
  const matchPercentage = matchCount / Math.min(userKeywords.length, jobKeywords.length);
  
  return Math.min(matchPercentage, 1);
}

/**
 * استخراج عدد سنوات الخبرة من النص
 */
function extractYearsOfExperience(text: string): number {
  if (!text) return 0;
  
  // البحث عن أنماط مثل: "5 سنوات" أو "5 years" أو "خبرة 5 سنوات"
  const arabicPattern = /(\d+)\s*(سنة|سنوات)/;
  const englishPattern = /(\d+)\s*(year|years)/i;
  
  const arabicMatch = text.match(arabicPattern);
  const englishMatch = text.match(englishPattern);
  
  if (arabicMatch) {
    return parseInt(arabicMatch[1]);
  } else if (englishMatch) {
    return parseInt(englishMatch[1]);
  }
  
  // محاولة إيجاد أي رقم في النص
  const numberMatch = text.match(/\d+/);
  if (numberMatch) {
    const num = parseInt(numberMatch[0]);
    // التأكد من أن الرقم معقول لسنوات الخبرة (بين 0 و 50)
    if (num >= 0 && num <= 50) {
      return num;
    }
  }
  
  return 0;
}

/**
 * الحصول على لون النسبة حسب القيمة
 */
export function getMatchColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-orange-500';
  return 'text-red-600';
}

/**
 * الحصول على لون الخلفية حسب النسبة
 */
export function getMatchBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-50';
  if (percentage >= 60) return 'bg-orange-50';
  return 'bg-red-50';
}

/**
 * الحصول على وصف النسبة
 */
export function getMatchLabel(percentage: number): string {
  if (percentage >= 80) return 'توافق ممتاز';
  if (percentage >= 60) return 'توافق جيد';
  if (percentage >= 40) return 'توافق متوسط';
  return 'توافق منخفض';
}

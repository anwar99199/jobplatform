/**
 * خوارزمية حساب نسبة التوافق مع الوظائف
 * تقوم بتحليل البروفايل ومقارنته مع متطلبات الوظيفة
 */

export interface UserProfile {
  skills?: string[];
  experience?: string;
  education?: string;
  location?: string;
  jobTitle?: string;
  bio?: string;
  languages?: string[];
  certifications?: string[];
}

export interface Job {
  id: string;
  title: string;
  company?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string;
  skills?: string[];
  experienceLevel?: string;
}

export interface MatchResult {
  percentage: number;
  breakdown: {
    skills: number;
    experience: number;
    location: number;
    education: number;
    overall: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

/**
 * حساب نسبة التوافق الرئيسية
 */
export function calculateJobMatch(profile: UserProfile, job: Job): MatchResult {
  // حساب نسبة التوافق في المهارات
  const skillsMatch = calculateSkillsMatch(profile, job);
  
  // حساب نسبة التوافق في الخبرة
  const experienceMatch = calculateExperienceMatch(profile, job);
  
  // حساب نسبة التوافق في الموقع
  const locationMatch = calculateLocationMatch(profile, job);
  
  // حساب نسبة التوافق في التعليم
  const educationMatch = calculateEducationMatch(profile, job);
  
  // حساب النسبة الإجمالية (مع أوزان مختلفة)
  const weights = {
    skills: 0.40,      // المهارات لها أعلى وزن (40%)
    experience: 0.30,  // الخبرة (30%)
    location: 0.15,    // الموقع (15%)
    education: 0.15    // التعليم (15%)
  };
  
  const overallPercentage = Math.round(
    skillsMatch.percentage * weights.skills +
    experienceMatch.percentage * weights.experience +
    locationMatch.percentage * weights.location +
    educationMatch.percentage * weights.education
  );
  
  // جمع التوصيات
  const recommendations = generateRecommendations(
    skillsMatch,
    experienceMatch,
    locationMatch,
    educationMatch,
    profile,
    job
  );
  
  return {
    percentage: overallPercentage,
    breakdown: {
      skills: Math.round(skillsMatch.percentage),
      experience: Math.round(experienceMatch.percentage),
      location: Math.round(locationMatch.percentage),
      education: Math.round(educationMatch.percentage),
      overall: overallPercentage
    },
    matchedSkills: skillsMatch.matched,
    missingSkills: skillsMatch.missing,
    recommendations
  };
}

/**
 * حساب نسبة التوافق في المهارات
 */
function calculateSkillsMatch(profile: UserProfile, job: Job): {
  percentage: number;
  matched: string[];
  missing: string[];
} {
  const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
  
  // استخراج المهارات من وصف الوظيفة
  const jobSkillsFromList = (job.skills || []).map(s => s.toLowerCase().trim());
  const jobSkillsFromDesc = extractSkillsFromText(
    `${job.description || ''} ${job.requirements || ''}`
  );
  
  const allJobSkills = [...new Set([...jobSkillsFromList, ...jobSkillsFromDesc])];
  
  if (allJobSkills.length === 0) {
    return { percentage: 50, matched: [], missing: [] }; // نسبة محايدة إذا لم تكن هناك مهارات محددة
  }
  
  const matched: string[] = [];
  const missing: string[] = [];
  
  allJobSkills.forEach(jobSkill => {
    const isMatched = userSkills.some(userSkill => 
      userSkill.includes(jobSkill) || 
      jobSkill.includes(userSkill) ||
      areSimilarSkills(userSkill, jobSkill)
    );
    
    if (isMatched) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  });
  
  const percentage = (matched.length / allJobSkills.length) * 100;
  
  return { percentage, matched, missing };
}

/**
 * حساب نسبة التوافق في الخبرة
 */
function calculateExperienceMatch(profile: UserProfile, job: Job): { percentage: number } {
  const userExp = profile.experience || '';
  const jobExp = job.experienceLevel || job.requirements || '';
  
  if (!userExp || !jobExp) {
    return { percentage: 50 }; // نسبة محايدة
  }
  
  // استخراج سنوات الخبرة
  const userYears = extractYearsOfExperience(userExp);
  const requiredYears = extractYearsOfExperience(jobExp);
  
  if (requiredYears === 0) {
    return { percentage: 70 }; // الوظيفة للمبتدئين
  }
  
  if (userYears >= requiredYears) {
    return { percentage: 100 }; // الخبرة كافية أو أكثر
  }
  
  // حساب نسبة تناسبية
  const ratio = userYears / requiredYears;
  return { percentage: Math.min(ratio * 100, 100) };
}

/**
 * حساب نسبة التوافق في الموقع
 */
function calculateLocationMatch(profile: UserProfile, job: Job): { percentage: number } {
  const userLocation = (profile.location || '').toLowerCase().trim();
  const jobLocation = (job.location || '').toLowerCase().trim();
  
  if (!userLocation || !jobLocation) {
    return { percentage: 50 }; // نسبة محايدة
  }
  
  // تطابق تام
  if (userLocation === jobLocation) {
    return { percentage: 100 };
  }
  
  // تطابق جزئي (نفس المدينة الرئيسية)
  if (userLocation.includes(jobLocation) || jobLocation.includes(userLocation)) {
    return { percentage: 80 };
  }
  
  // العمل عن بعد
  if (jobLocation.includes('عن بعد') || jobLocation.includes('remote')) {
    return { percentage: 100 };
  }
  
  return { percentage: 30 }; // موقع مختلف
}

/**
 * حساب نسبة التوافق في التعليم
 */
function calculateEducationMatch(profile: UserProfile, job: Job): { percentage: number } {
  const userEducation = (profile.education || '').toLowerCase();
  const jobRequirements = (job.requirements || '').toLowerCase();
  
  if (!jobRequirements) {
    return { percentage: 70 }; // نسبة محايدة إيجابية
  }
  
  // البحث عن متطلبات تعليمية في الوظيفة
  const educationKeywords = [
    'بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم', 'ثانوية',
    'bachelor', 'master', 'phd', 'diploma', 'degree'
  ];
  
  const hasEducationRequirement = educationKeywords.some(keyword => 
    jobRequirements.includes(keyword)
  );
  
  if (!hasEducationRequirement) {
    return { percentage: 70 };
  }
  
  // مستويات التعليم
  const educationLevels: { [key: string]: number } = {
    'دكتوراه': 5,
    'phd': 5,
    'ماجستير': 4,
    'master': 4,
    'بكالوريوس': 3,
    'bachelor': 3,
    'دبلوم': 2,
    'diploma': 2,
    'ثانوية': 1,
    'high school': 1
  };
  
  let userLevel = 0;
  let requiredLevel = 0;
  
  Object.keys(educationLevels).forEach(keyword => {
    if (userEducation.includes(keyword)) {
      userLevel = Math.max(userLevel, educationLevels[keyword]);
    }
    if (jobRequirements.includes(keyword)) {
      requiredLevel = Math.max(requiredLevel, educationLevels[keyword]);
    }
  });
  
  if (requiredLevel === 0) {
    return { percentage: 70 };
  }
  
  if (userLevel >= requiredLevel) {
    return { percentage: 100 };
  }
  
  const ratio = userLevel / requiredLevel;
  return { percentage: Math.max(ratio * 100, 40) };
}

/**
 * استخراج المهارات من النص
 */
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'sql', 'mongodb', 'aws', 'azure', 'docker',
    'excel', 'word', 'powerpoint', 'photoshop', 'illustrator',
    'تسويق', 'مبيعات', 'محاس��ة', 'إدارة', 'تصميم', 'برمجة',
    'تحليل', 'كتابة', 'ترجمة', 'تدريس', 'استشارات'
  ];
  
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      found.push(skill);
    }
  });
  
  return found;
}

/**
 * استخراج سنوات الخبرة من النص
 */
function extractYearsOfExperience(text: string): number {
  const patterns = [
    /(\d+)\s*سنة/,
    /(\d+)\s*سنوات/,
    /(\d+)\s*year/i,
    /(\d+)\s*years/i,
    /(\d+)\+/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  // البحث عن كلمات دلالية
  if (text.includes('مبتدئ') || text.includes('fresh') || text.includes('graduate')) {
    return 0;
  }
  if (text.includes('متوسط') || text.includes('mid-level')) {
    return 3;
  }
  if (text.includes('خبير') || text.includes('senior')) {
    return 5;
  }
  
  return 0;
}

/**
 * التحقق من تشابه المهارات
 */
function areSimilarSkills(skill1: string, skill2: string): boolean {
  const similarityMap: { [key: string]: string[] } = {
    'javascript': ['js', 'ecmascript', 'es6'],
    'typescript': ['ts'],
    'react': ['reactjs', 'react.js'],
    'angular': ['angularjs'],
    'vue': ['vuejs', 'vue.js'],
    'node': ['nodejs', 'node.js'],
    'mongodb': ['mongo'],
    'postgresql': ['postgres'],
    'تسويق': ['تسويق رقمي', 'تسويق إلكتروني'],
    'برمجة': ['تطوير', 'كودينج', 'coding'],
  };
  
  for (const [base, variants] of Object.entries(similarityMap)) {
    if ((skill1 === base && variants.includes(skill2)) ||
        (skill2 === base && variants.includes(skill1))) {
      return true;
    }
  }
  
  return false;
}

/**
 * توليد التوصيات
 */
function generateRecommendations(
  skillsMatch: any,
  experienceMatch: any,
  locationMatch: any,
  educationMatch: any,
  profile: UserProfile,
  job: Job
): string[] {
  const recommendations: string[] = [];
  
  // توصيات المهارات
  if (skillsMatch.percentage < 60 && skillsMatch.missing.length > 0) {
    const topMissing = skillsMatch.missing.slice(0, 3).join('، ');
    recommendations.push(`حاول تعلم هذه المهارات المطلوبة: ${topMissing}`);
  } else if (skillsMatch.percentage < 80) {
    recommendations.push('قم بتحديث مهاراتك لتتوافق بشكل أفضل مع متطلبات الوظيفة');
  }
  
  // توصيات الخبرة
  if (experienceMatch.percentage < 70) {
    recommendations.push('فكر في اكتساب المزيد من الخبرة العملية في هذا المجال');
  }
  
  // توصيات الموقع
  if (locationMatch.percentage < 50) {
    recommendations.push('ابحث عن فرص عمل عن بُعد أو فكر في الانتقال إلى المدينة المطلوبة');
  }
  
  // توصيات التعليم
  if (educationMatch.percentage < 60) {
    recommendations.push('فكر في الحصول على شهادة أو دورة تدريبية إضافية');
  }
  
  // توصيات عامة
  if (skillsMatch.matched.length > 0) {
    recommendations.push('أبرز هذه المهارات في سيرتك الذاتية: ' + skillsMatch.matched.slice(0, 3).join('، '));
  }
  
  return recommendations;
}

/**
 * حساب نسبة التوافق لوظائف متعددة
 */
export function calculateMultipleJobMatches(
  profile: UserProfile,
  jobs: Job[]
): { [jobId: string]: number } {
  const results: { [jobId: string]: number } = {};
  
  jobs.forEach(job => {
    const match = calculateJobMatch(profile, job);
    results[job.id] = match.percentage;
  });
  
  return results;
}

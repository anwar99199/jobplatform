import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  Target, 
  CheckCircle2, 
  Lightbulb,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../utils/supabase/client";
import { getJobs } from "../utils/api";
import { calculateJobMatch, type UserProfile, type Job, type MatchResult } from "../utils/jobMatchCalculator";
import { toast } from "sonner@2.0.3";

export function JobMatchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobMatches, setJobMatches] = useState<{ job: Job; match: MatchResult }[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("يرجى تسجيل الدخول للوصول إلى هذه الميزة");
        navigate("/login");
        return;
      }

      // Check if user has premium subscription
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        toast.error("هذه الميزة متاحة للمشتركين Premium فقط");
        navigate("/premium");
        return;
      }

      setIsPremium(true);

      // Load user profile
      await loadUserProfile(session.user.id);

      // Load jobs
      await loadJobs();

    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        const profile: UserProfile = {
          skills: data.skills || [],
          experience: data.experience || '',
          education: data.education || '',
          location: data.location || '',
          jobTitle: data.job_title || '',
          bio: data.bio || '',
          languages: data.languages || [],
          certifications: data.certifications || []
        };
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadJobs = async () => {
    try {
      const result = await getJobs();
      if (result.success && result.jobs) {
        setJobs(result.jobs);
      } else {
        console.error("Failed to load jobs:", result.error);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile && jobs.length > 0) {
      calculateMatches();
    }
  }, [userProfile, jobs]);

  const calculateMatches = () => {
    if (!userProfile) return;

    const matches = jobs.map(job => ({
      job,
      match: calculateJobMatch(userProfile, job)
    }));

    // Sort by match percentage (highest first)
    matches.sort((a, b) => b.match.percentage - a.match.percentage);

    setJobMatches(matches);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-50";
    if (percentage >= 60) return "bg-yellow-50";
    return "bg-orange-50";
  };

  const getMatchBorderColor = (percentage: number) => {
    if (percentage >= 80) return "border-green-200";
    if (percentage >= 60) return "border-yellow-200";
    return "border-orange-200";
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 80) return "توافق ممتاز";
    if (percentage >= 60) return "توافق جيد";
    if (percentage >= 40) return "توافق متوسط";
    return "توافق ضعيف";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحليل التوافق...</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-6"
            onClick={() => navigate("/premium")}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى خدمات Premium
          </Button>

          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
              <TrendingUp className="w-12 h-12" />
            </div>
            <h1 className="text-4xl mb-4">نسبة التوافق مع الوظائف</h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              اعرف مدى توافقك مع كل وظيفة قبل التقديم بتحليل ذكي دقيق
            </p>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl text-gray-800 mb-2">كيف يعمل؟</h2>
            <p className="text-gray-600">
              نقوم بتحليل مهاراتك وخبراتك ومقارنتها بمتطلبات الوظيفة لتعطيك نسبة التوافق المئوية.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-800 mb-2">تحليل دقيق للتوافق</h3>
                  <p className="text-gray-600 text-sm">
                    مقارنة شاملة بين ملفك ومتطلبات الوظيفة
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-800 mb-2">مقارنة المهارات المطلوبة</h3>
                  <p className="text-gray-600 text-sm">
                    معرفة المهارات الموجودة والمفقودة
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-800 mb-2">نسبة مئوية واضحة</h3>
                  <p className="text-gray-600 text-sm">
                    عرض بسيط لمدى توافقك مع الوظيفة
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-800 mb-2">توصيات للتحسين</h3>
                  <p className="text-gray-600 text-sm">
                    اقتراحات لزيادة فرص القبول
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">
              <strong>استخدم الأداة الآن</strong> - قم بالتمرير للأسفل لرؤية نسبة توافقك مع جميع الوظائف المتاحة
            </p>
          </div>
        </div>

        {/* Profile Status */}
        {!userProfile?.skills || userProfile.skills.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg text-yellow-900 mb-2">أكمل بروفايلك للحصول على نتائج دقيقة</h3>
              <p className="text-yellow-800 mb-4">
                لتحسين دقة حساب نسبة التوافق، يرجى إكمال معلومات بروفايلك وإضافة مهاراتك وخبراتك.
              </p>
              <Button
                onClick={() => navigate("/profile")}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                إكمال البروفايل
              </Button>
            </div>
          </div>
        ) : null}

        {/* Job Matches List */}
        <div className="space-y-4">
          <h2 className="text-2xl text-gray-800 mb-6">
            الوظائف المتوافقة ({jobMatches.length})
          </h2>

          {jobMatches.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">لا توجد وظائف متاحة حالياً</p>
              <p className="text-gray-500 text-sm">تحقق مرة أخرى لاحقاً</p>
            </div>
          ) : (
            jobMatches.map(({ job, match }) => (
              <div
                key={job.id}
                className={`bg-white rounded-lg shadow-sm border-2 ${getMatchBorderColor(match.percentage)} overflow-hidden transition-all hover:shadow-md`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl text-gray-800 mb-2">{job.title}</h3>
                      {job.company && (
                        <p className="text-gray-600 mb-1">{job.company}</p>
                      )}
                      {job.location && (
                        <p className="text-gray-500 text-sm">{job.location}</p>
                      )}
                    </div>

                    <div className={`${getMatchBgColor(match.percentage)} px-6 py-3 rounded-lg border-2 ${getMatchBorderColor(match.percentage)} text-center flex-shrink-0`}>
                      <div className={`text-3xl ${getMatchColor(match.percentage)}`}>
                        {match.percentage}%
                      </div>
                      <div className={`text-sm ${getMatchColor(match.percentage)} mt-1`}>
                        {getMatchLabel(match.percentage)}
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                      <div className="text-lg text-gray-800">{match.breakdown.skills}%</div>
                      <div className="text-xs text-gray-600 mt-1">المهارات</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                      <div className="text-lg text-gray-800">{match.breakdown.experience}%</div>
                      <div className="text-xs text-gray-600 mt-1">الخبرة</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                      <div className="text-lg text-gray-800">{match.breakdown.location}%</div>
                      <div className="text-xs text-gray-600 mt-1">الموقع</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                      <div className="text-lg text-gray-800">{match.breakdown.education}%</div>
                      <div className="text-xs text-gray-600 mt-1">التعليم</div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    className="w-full flex items-center justify-between text-red-600 hover:text-red-700 transition-colors py-2 border-t border-gray-200"
                  >
                    <span className="text-sm">
                      {expandedJobId === job.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل والتوصيات'}
                    </span>
                    {expandedJobId === job.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {expandedJobId === job.id && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                      {/* Matched Skills */}
                      {match.matchedSkills.length > 0 && (
                        <div>
                          <h4 className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            المهارات المتوافقة
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {match.matchedSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {match.missingSkills.length > 0 && (
                        <div>
                          <h4 className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            المهارات المطلوبة المفقودة
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {match.missingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {match.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            توصيات للتحسين
                          </h4>
                          <ul className="space-y-2">
                            {match.recommendations.map((rec, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200"
                              >
                                <span className="text-blue-600 flex-shrink-0">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => navigate(`/job/${job.id}`)}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          عرض تفاصيل الوظيفة
                        </Button>
                        {job.applicationUrl && (
                          <Button
                            onClick={() => window.open(job.applicationUrl, '_blank')}
                            variant="outline"
                            className="flex-1"
                          >
                            التقديم الآن
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

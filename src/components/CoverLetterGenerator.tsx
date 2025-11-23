import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Sparkles, Check, AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { generateCoverLetter, downloadCoverLetter } from '../utils/cover-letter-api';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  specialization?: string;
  experience?: string;
  education?: string;
  skills?: string;
  bio?: string;
  phone?: string;
}

interface CoverLetterGeneratorProps {
  currentUser: UserProfile;
  jobs: Job[];
}

interface GeneratedCoverLetter {
  id: string;
  content: string;
  jobTitle: string;
  company: string;
  generatedAt: string;
  language?: 'ar' | 'en';
}

export function CoverLetterGenerator({ currentUser, jobs }: CoverLetterGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedCoverLetter | null>(null);
  const [savedLetters, setSavedLetters] = useState<GeneratedCoverLetter[]>([]);

  // Load saved cover letters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`cover_letters_${currentUser.id}`);
    if (saved) {
      try {
        setSavedLetters(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved letters:', e);
      }
    }
  }, [currentUser.id]);

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  const handleGenerate = async () => {
    if (!selectedJob) {
      toast.error('يرجى اختيار وظيفة');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Prepare job description
      const jobDescription = `${selectedJob.description}\n\nالمتطلبات:\n${selectedJob.requirements.join('\n')}`;
      
      // Convert skills string to array if needed
      const skillsArray = currentUser.skills 
        ? currentUser.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const result = await generateCoverLetter({
        userId: currentUser.id,
        userProfile: {
          name: currentUser.name,
          email: currentUser.email,
          specialization: currentUser.specialization || currentUser.specialty || '',
          experience: currentUser.experience || 'خريج جديد',
          education: currentUser.education || 'درجة البكالوريوس',
          skills: skillsArray,
          bio: currentUser.bio || ''
        },
        jobTitle: selectedJob.title,
        jobDescription: jobDescription,
        companyName: selectedJob.company,
        language: selectedLanguage,
        additionalInfo: additionalInfo
      });

      const newLetter: GeneratedCoverLetter = {
        id: `CL-${Date.now()}`,
        content: result.content,
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        generatedAt: new Date().toISOString(),
        language: selectedLanguage
      };

      setGeneratedLetter(newLetter);
      
      // Save to localStorage
      const updatedLetters = [newLetter, ...savedLetters];
      if (updatedLetters.length > 10) {
        updatedLetters.pop();
      }
      setSavedLetters(updatedLetters);
      localStorage.setItem(`cover_letters_${currentUser.id}`, JSON.stringify(updatedLetters));
      
      toast.success('✨ تم إنشاء رسالة التعريف بنجاح!');
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast.error('فشل في إنشاء رسالة التعريف. يرجى المحاولة مرة أخرى');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!generatedLetter) return;

    try {
      if (format === 'pdf') {
        toast.info('جاري تحضير ملف HTML للطباعة كـ PDF...');
      } else {
        toast.info('جاري تحضير ملف Word...');
      }
      
      await downloadCoverLetter({
        content: generatedLetter.content,
        jobTitle: generatedLetter.jobTitle,
        company: generatedLetter.company,
        userName: currentUser.name,
        format,
        language: selectedLanguage
      });
      
      if (format === 'pdf') {
        toast.success('✓ تم تنزيل الملف! افتحه واضغط Ctrl+P لحفظه كـ PDF');
      } else {
        toast.success('✓ تم تنزيل ملف Word بنجاح');
      }
    } catch (error) {
      console.error('Error downloading cover letter:', error);
      toast.error('فشل في تنزيل الملف');
    }
  };

  const handleReset = () => {
    setGeneratedLetter(null);
    setSelectedJobId('');
    setSelectedLanguage('ar');
    setAdditionalInfo('');
  };

  const handleDeleteLetter = (letterId: string) => {
    const updatedLetters = savedLetters.filter(l => l.id !== letterId);
    setSavedLetters(updatedLetters);
    localStorage.setItem(`cover_letters_${currentUser.id}`, JSON.stringify(updatedLetters));
    
    if (generatedLetter?.id === letterId) {
      setGeneratedLetter(null);
    }
    
    toast.success('تم حذف رسالة التعريف');
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
            <Sparkles className="w-5 h-5 ml-2" />
            إنشاء Cover Letter بالذكاء الاصطناعي
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-blue-600" />
              إنشاء رسالة تعريف احترافية
            </DialogTitle>
            <DialogDescription>
              استخدم الذكاء الاصطناعي لإنشاء رسالة تعريف مخصصة بناءً على الوظيفة وبياناتك الشخصية
            </DialogDescription>
          </DialogHeader>

          {!generatedLetter ? (
            <div className="space-y-6 py-4">
              {/* Job Selection */}
              <div className="space-y-2">
                <Label>اختر الوظيفة *</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوظيفة التي تريد التقديم عليها" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.length > 0 ? (
                      jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{job.title}</span>
                            <span className="text-sm text-gray-500">{job.company} - {job.location}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-jobs" disabled>
                        لا توجد وظائف متاحة
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                {selectedJob && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                    <h4 className="font-medium text-blue-900 mb-2">{selectedJob.title}</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p>📍 {selectedJob.location}</p>
                      <p>🏢 {selectedJob.company}</p>
                      <p>💼 {selectedJob.type}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <Label>اللغة *</Label>
                <Select value={selectedLanguage} onValueChange={(value: 'ar' | 'en') => setSelectedLanguage(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر لغة رسالة التعريف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">
                      <div className="flex items-center gap-2">
                        <span>🇸🇦</span>
                        <span>العربية</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <span>🇬🇧</span>
                        <span>English</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label>معلومات إضافية (اختياري)</Label>
                <Textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="أضف أي معلومات إضافية تريد تضمينها في رسالة التعريف..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Alert>
                <Sparkles className="w-4 h-4" />
                <AlertDescription>
                  سيتم استخدام الذكاء الاصطناعي لإنشاء رسالة تعريف مخصصة بناءً على:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>وصف الوظيفة ومتطلباتها</li>
                    <li>معلومات ملفك الشخصي</li>
                    <li>المعلومات الإضافية</li>
                    <li className="font-medium text-blue-600">
                      اللغة: {selectedLanguage === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English'}
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedJobId || isGenerating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      إنشاء رسالة التعريف
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  disabled={isGenerating}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Success Message */}
              <Alert className="bg-green-50 border-green-200">
                <Check className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  تم إنشاء رسالة التعريف بنجاح! يمكنك الآن تنزيلها أو تعديلها.
                </AlertDescription>
              </Alert>

              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{generatedLetter.jobTitle}</h4>
                    <p className="text-sm text-gray-600">{generatedLetter.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedLanguage === 'ar' ? '🇸🇦 عربي' : '🇬🇧 English'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(generatedLetter.generatedAt).toLocaleDateString('ar-SA')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Content */}
              <div className="space-y-2">
                <Label>محتوى رسالة التعريف</Label>
                <Textarea
                  value={generatedLetter.content}
                  onChange={(e) => setGeneratedLetter({ ...generatedLetter, content: e.target.value })}
                  rows={15}
                  className="font-sans text-sm leading-relaxed"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                  style={{ textAlign: selectedLanguage === 'ar' ? 'right' : 'left' }}
                />
                <p className="text-xs text-gray-500">
                  يمكنك تعديل المحتوى قبل التنزيل
                </p>
              </div>

              {/* Download Buttons */}
              <div className="space-y-3">
                <Label>تنزيل رسالة التعريف</Label>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownload('pdf')}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    PDF (طباعة)
                  </Button>
                  <Button
                    onClick={() => handleDownload('docx')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    Word (تعديل)
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-2">
                  <p className="font-medium text-blue-900">💡 كيفية حفظ كـ PDF:</p>
                  <ol className="list-decimal list-inside text-blue-800 space-y-1 mr-2">
                    <li>اضغط "PDF (طباعة)" لتنزيل ملف HTML</li>
                    <li>افتح الملف في المتصفح</li>
                    <li>اضغط <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl+P</kbd> أو اضغط زر الطباعة</li>
                    <li>اختر "حفظ كـ PDF" واحفظ الملف ✓</li>
                  </ol>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  إنشاء رسالة جديدة
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Saved Cover Letters */}
      {savedLetters.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">رسائل التعريف المحفوظة ({savedLetters.length})</h4>
          {savedLetters.slice(0, 3).map((letter) => (
            <div key={letter.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">{letter.jobTitle}</p>
                  <Badge variant="outline" className="text-xs">
                    {letter.language === 'ar' ? '🇸🇦' : '🇬🇧'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{letter.company}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(letter.generatedAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGeneratedLetter(letter);
                    setSelectedLanguage(letter.language || 'ar');
                    setIsOpen(true);
                  }}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteLetter(letter.id)}
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

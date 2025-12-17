import React, { useState } from 'react';
import { ArrowRight, Download, RefreshCw, CheckCircle2, AlertCircle, Info, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { scrapeJobs } from '../../utils/adminApi';
import { toast } from 'sonner@2.0.3';

export function AdminScraperPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastScrapeResult, setLastScrapeResult] = useState<any>(null);
  const [lastScrapeTime, setLastScrapeTime] = useState<Date | null>(null);

  const handleScrapeJobs = async () => {
    setIsLoading(true);
    const startTime = new Date();
    
    try {
      const result = await scrapeJobs();
      
      setLastScrapeResult(result);
      setLastScrapeTime(startTime);
      
      if (result.success) {
        toast.success(result.message || 'تم جلب الوظائف بنجاح');
      } else {
        toast.error(result.message || 'فشل جلب الوظائف');
      }
    } catch (error) {
      console.error('Error scraping jobs:', error);
      toast.error('حدث خطأ أثناء جلب الوظائف');
      setLastScrapeResult({
        success: false,
        message: 'فشل الاتصال بالسيرفر',
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/admin/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للوحة التحكم
              </Button>
            </Link>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl mb-2">جلب الوظائف تلقائياً</h1>
                <p className="text-gray-600">
                  استيراد وظائف جديدة من المواقع الخارجية تلقائياً
                </p>
              </div>
              
              {lastScrapeTime && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Clock className="h-4 w-4" />
                  <span>آخر تحديث: {lastScrapeTime.toLocaleTimeString('ar-SA')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">كيف يعمل النظام؟</AlertTitle>
            <AlertDescription className="text-sm leading-relaxed text-blue-800">
              يقوم النظام بجلب الوظائف من موقع Jobs of Oman تلقائياً، ويتحقق من الوظائف المكررة قبل الإضافة.
              يمكنك تشغيل العملية يدوياً من هنا، أو جدولتها لتعمل تلقائياً (راجع القسم أدناه).
            </AlertDescription>
          </Alert>

          {/* Manual Scrape Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                جلب الوظائف يدوياً
              </CardTitle>
              <CardDescription>
                انقر على الزر أدناه لجلب الوظائف الآن من jobsofoman.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  onClick={handleScrapeJobs}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      جاري جلب الوظائف...
                    </>
                  ) : (
                    <>
                      <Download className="ml-2 h-4 w-4" />
                      جلب الوظائف الآن
                    </>
                  )}
                </Button>
                
                <a 
                  href="https://jobsofoman.com/ar/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                >
                  زيارة الموقع المصدر
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Last Scrape Result */}
          {lastScrapeResult && (
            <Card className="mb-6 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lastScrapeResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  نتيجة آخر عملية جلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="text-sm text-gray-700 mb-1">الوظائف المستخرجة</div>
                      <div className="text-3xl text-blue-700">{lastScrapeResult.jobsScraped || 0}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="text-sm text-gray-700 mb-1">الوظائف المضافة</div>
                      <div className="text-3xl text-green-700">{lastScrapeResult.jobsAdded || 0}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <div className="text-sm text-gray-700 mb-1">الوظائف المكررة</div>
                      <div className="text-3xl text-purple-700">
                        {(lastScrapeResult.jobsScraped || 0) - (lastScrapeResult.jobsAdded || 0)}
                      </div>
                    </div>
                  </div>

                  <Alert variant={lastScrapeResult.success ? "default" : "destructive"}>
                    <AlertDescription>
                      {lastScrapeResult.message}
                      {lastScrapeResult.error && (
                        <div className="mt-2 text-xs opacity-75">
                          تفاصيل الخطأ: {lastScrapeResult.error}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>

                  {lastScrapeResult.jobs && lastScrapeResult.jobs.length > 0 && (
                    <div>
                      <h3 className="mb-3">الوظائف المضافة ({lastScrapeResult.jobs.length}):</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {lastScrapeResult.jobs.map((job: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <span className="flex-1">{job.title}</span>
                              {job.applicationUrl && job.applicationUrl !== 'https://jobsofoman.com/ar/index.php' && (
                                <a 
                                  href={job.applicationUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {job.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {job.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automation Instructions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                جدولة الجلب التلقائي
              </CardTitle>
              <CardDescription>
                اتبع هذه الخطوات لتشغيل جلب الوظائف بشكل تلقائي دوري
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                <h3 className="mb-3 flex items-center gap-2 text-green-900">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  الطريقة 1: استخدام خدمة Cron-Job.org (مجاني وسهل)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mr-8">
                  <li>
                    قم بالتسجيل في موقع{' '}
                    <a 
                      href="https://cron-job.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      cron-job.org
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>أنشئ Cron Job جديد</li>
                  <li>
                    استخدم URL التالي:
                    <div className="bg-white p-3 rounded mt-2 font-mono text-xs break-all border border-green-300">
                      https://{window.location.hostname.replace('localhost', 'YOUR_PROJECT_ID.supabase.co')}/functions/v1/make-server-8a20c00b/admin/scrape-jobs
                    </div>
                  </li>
                  <li>اختر Method: <span className="bg-white px-2 py-1 rounded font-mono">POST</span></li>
                  <li>في Headers، أضف:</li>
                  <div className="bg-white p-3 rounded mt-2 font-mono text-xs border border-green-300">
                    <div>Content-Type: application/json</div>
                    <div>X-Admin-Token: [ضع admin token هنا]</div>
                  </div>
                  <li>اختر التوقيت المناسب (مثلاً: كل 6 ساعات أو مرة يومياً)</li>
                  <li>احفظ وفعّل الـ Cron Job</li>
                </ol>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                <h3 className="mb-3 flex items-center gap-2 text-blue-900">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  الطريقة 2: استخدام GitHub Actions (مجاني ومتقدم)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mr-8">
                  <li>أنشئ مستودع GitHub جديد (Repository)</li>
                  <li>
                    أنشئ ملف في:
                    <code className="bg-white px-2 py-1 rounded text-xs mx-1 border border-blue-300">
                      .github/workflows/scrape-jobs.yml
                    </code>
                  </li>
                  <li>انسخ الكود التالي في الملف:</li>
                </ol>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mt-3 overflow-x-auto">
                  <pre className="text-xs">
{`name: Scrape Jobs
on:
  schedule:
    # يعمل كل 6 ساعات
    - cron: '0 */6 * * *'
  workflow_dispatch: # يمكن تشغيله يدوياً

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Scrape Jobs
        run: |
          curl -X POST \\
            https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-8a20c00b/admin/scrape-jobs \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
            -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \\
            -d '{"sourceUrl": "https://jobsofoman.com/ar/index.php"}'`}
                  </pre>
                </div>
                
                <p className="text-sm text-gray-600 mt-3">
                  استبدل YOUR_PROJECT_ID و YOUR_SUPABASE_ANON_KEY و YOUR_ADMIN_TOKEN بالقيم الفعلية من مشروعك.
                </p>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-700" />
                <AlertTitle className="text-yellow-900">ملاحظة هامة</AlertTitle>
                <AlertDescription className="text-sm text-yellow-800">
                  يُنصح بجدولة عملية الجلب لتعمل مرة واحدة يومياً أو كل 6 ساعات لتجنب التحميل الزائد على السيرفر.
                  النظام سيتجاهل الوظائف المكررة تلقائياً بناءً على العنوان ورابط التقديم.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
import { Calendar, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../utils/api";
import { Button } from "./ui/button";

interface Job {
  id: string;
  title: string;
  date: string;
  company?: string;
  location?: string;
  type?: string;
  description?: string;
}

export function JobsSection() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      if (response.success) {
        setJobs(response.jobs);
      } else {
        setError("فشل في تحميل الوظائف");
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("حدث خطأ أثناء تحميل الوظائف");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border border-gray-300 rounded-lg p-8 bg-white text-center">
          <p className="text-gray-600">جاري تحميل الوظائف...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border border-gray-300 rounded-lg p-8 bg-white text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border border-gray-300 rounded-lg p-8 bg-white">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-2xl">جديد الوظائف</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-50 flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-red-600 mb-3 leading-relaxed">
                    {job.title}
                  </h3>
                  {job.company && (
                    <p className="text-gray-700 mb-2">{job.company}</p>
                  )}
                  {job.location && (
                    <p className="text-gray-600 text-sm mb-2">📍 {job.location}</p>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{job.date}</span>
                  </div>
                </div>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
              </div>
              
              <Button 
                onClick={() => handleViewDetails(job.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                <span>التفاصيل والتقديم</span>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
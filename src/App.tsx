import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { NewsPage } from "./pages/NewsPage";
import { ScholarshipsPage } from "./pages/ScholarshipsPage";
import { TrainingPage } from "./pages/TrainingPage";
import { CompanyJobsPage } from "./pages/CompanyJobsPage";
import { GovernmentJobsPage } from "./pages/GovernmentJobsPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/career-path" element={<CareerPathPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/company-jobs" element={<CompanyJobsPage />} />
            <Route path="/government-jobs" element={<GovernmentJobsPage />} />
            {/* Catch all unmatched routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
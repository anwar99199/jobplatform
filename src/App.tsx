import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CoverLetterPage } from "./pages/CoverLetterPage";
import { DigitalCardPage } from "./pages/DigitalCardPage";
import { PublicCardPage } from "./pages/PublicCardPage";
import { JobMatchPage } from "./pages/JobMatchPage";
import { ATSConverterPage } from "./pages/ATSConverterPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { PremiumPage } from "./pages/PremiumPage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { NewsPage } from "./pages/NewsPage";
import { ScholarshipsPage } from "./pages/ScholarshipsPage";
import { TrainingPage } from "./pages/TrainingPage";
import { CompanyJobsPage } from "./pages/CompanyJobsPage";
import { GovernmentJobsPage } from "./pages/GovernmentJobsPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { Layout } from "./components/Layout";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminJobsPage } from "./pages/admin/AdminJobsPage";
import { AdminJobFormPage } from "./pages/admin/AdminJobFormPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
import { AdminNewsPage } from "./pages/admin/AdminNewsPage";
import { AdminContactPage } from "./pages/admin/AdminContactPage";
import { AdminScraperPage } from "./pages/admin/AdminScraperPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="premium" element={
              <ProtectedRoute>
                <PremiumPage />
              </ProtectedRoute>
            } />
            <Route path="career-path" element={<CareerPathPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="scholarships" element={<ScholarshipsPage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="company-jobs" element={<CompanyJobsPage />} />
            <Route path="government-jobs" element={<GovernmentJobsPage />} />
            <Route path="job/:id" element={<JobDetailsPage />} />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms-of-service" element={<TermsOfServicePage />} />
          </Route>

          {/* Premium Tools Routes (Outside Layout - Full Page) */}
          <Route path="/premium/cover-letter" element={
            <ProtectedRoute>
              <CoverLetterPage />
            </ProtectedRoute>
          } />
          <Route path="/premium/digital-card" element={
            <ProtectedRoute>
              <DigitalCardPage />
            </ProtectedRoute>
          } />
          <Route path="/premium/job-match" element={
            <ProtectedRoute>
              <JobMatchPage />
            </ProtectedRoute>
          } />
          <Route path="/premium/ats-converter" element={
            <ProtectedRoute>
              <ATSConverterPage />
            </ProtectedRoute>
          } />

          {/* Public Card Page - No Auth Required */}
          <Route path="/card/:id" element={<PublicCardPage />} />

          {/* User Auth Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/jobs/:id" element={<AdminJobFormPage />} />
          <Route path="/admin/scraper" element={<AdminScraperPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />
          <Route path="/admin/contact" element={<AdminContactPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          
          {/* Catch all unmatched routes and redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import GuestOnly from '../layouts/GuestOnly';
import RequireAuth from '../layouts/RequireAuth';
import RequireRole from '../layouts/RequireRole';
import HomePage from '../features/home/HomePage';
import NotFoundPage from '../features/home/NotFoundPage';
import StatusPage from '../features/health/StatusPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import AccountPage from '../features/auth/AccountPage';
import DashboardPage from '../features/profile/DashboardPage';
import ProfilePage from '../features/profile/ProfilePage';
import EmployerDashboardPage from '../features/employers/EmployerDashboardPage';
import CompanyProfilePage from '../features/employers/CompanyProfilePage';
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import EmployersReviewPage from '../features/admin/EmployersReviewPage';
import JobsReviewPage from '../features/admin/JobsReviewPage';
import UsersPage from '../features/admin/UsersPage';
import AdminApplicationsPage from '../features/admin/AdminApplicationsPage';
import JobsPage from '../features/jobs/JobsPage';
import JobDetailsPage from '../features/jobs/JobDetailsPage';
import EmployerJobsPage from '../features/jobs/EmployerJobsPage';
import JobEditorPage from '../features/jobs/JobEditorPage';
import ApplicationsPage from '../features/applications/ApplicationsPage';
import EmployerApplicantsPage from '../features/applications/EmployerApplicantsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<AccountPage />} />
          <Route element={<RequireRole roles={['job_seeker']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
          </Route>
          <Route element={<RequireRole roles={['employer']} />}>
            <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
            <Route path="/employer/company" element={<CompanyProfilePage />} />
            <Route path="/employer/jobs" element={<EmployerJobsPage />} />
            <Route path="/employer/jobs/new" element={<JobEditorPage />} />
            <Route path="/employer/jobs/:id/edit" element={<JobEditorPage />} />
            <Route path="/employer/jobs/:id/applicants" element={<EmployerApplicantsPage />} />
          </Route>
          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/employers" element={<EmployersReviewPage />} />
            <Route path="/admin/jobs" element={<JobsReviewPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

import React, { useState } from 'react';
import { RecruitmentProvider, useRecruitment } from './context/RecruitmentContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { JobsView } from './components/jobs/JobsView';
import { ApplicantsView } from './components/applicants/ApplicantsView';
import { ApplicantDrawer } from './components/applicants/ApplicantDrawer';
import { InterviewCalendarView } from './components/interviews/InterviewCalendarView';
import { EmployeesView } from './components/employees/EmployeesView';
import { AdminChatView } from './components/chat/AdminChatView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';
import { CreateJobModal } from './components/jobs/CreateJobModal';
import { AddApplicantModal } from './components/jobs/AddApplicantModal';
import type { Job } from './types/recruitment';
import { LandingPage } from './components/public/LandingPage';
import { LoginPage } from './components/public/LoginPage';
import { SignupPage } from './components/public/SignupPage';
import { UserDashboard } from './components/public/UserDashboard';
import { MultiStepApplyForm } from './components/public/MultiStepApplyForm';
import { HowItWorksPanel } from './components/common/HowItWorksPanel';
import { LiveChatWidget } from './components/common/LiveChatWidget';
import { AdminLogin } from './components/admin/AdminLogin';
import { ConfirmEmailPage } from './components/public/ConfirmEmailPage';
import { ForgotPasswordPage } from './components/public/ForgotPasswordPage';
import { ResetPasswordPage } from './components/public/ResetPasswordPage';
import { PrivacyPolicyPage } from './components/public/PrivacyPolicyPage';
import { TermsPage } from './components/public/TermsPage';
import { LockKeyhole, ArrowRight } from 'lucide-react';

const AuthRequired: React.FC = () => {
  const { setActivePage } = useRecruitment();
  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <button onClick={() => setActivePage('landing')} className="flex flex-col items-center mx-auto mb-8 cursor-pointer">
          <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-9 w-auto object-contain mx-auto" />
          <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
        </button>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
          <LockKeyhole className="w-7 h-7" style={{ color: '#AF7C28' }} />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Account required</h2>
        <p className="text-secondary mb-8">You need to create an account or sign in to access this page.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setActivePage('signup')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: '#AF7C28' }}
          >
            Create Account <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActivePage('login')}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-secondary border border-line hover:border-line-strong hover:text-primary transition-colors"
          >
            I already have an account — Sign In
          </button>
        </div>
        <p className="text-xs text-faint mt-6">
          <button onClick={() => setActivePage('landing')} className="hover:text-primary transition-colors">← Back to home</button>
        </p>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { activePage, setActivePage, isAuthenticated, publicUser } = useRecruitment();
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isAddApplicantOpen, setIsAddApplicantOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  React.useEffect(() => {
    if (activePage === 'auditor-login' && isAuthenticated) {
      setActivePage('applicants');
    }
  }, [activePage, isAuthenticated, setActivePage]);

  const publicPages = ['landing', 'login', 'signup', 'user-dashboard', 'apply', 'confirm', 'forgot-password', 'reset-password', 'privacy-policy', 'terms'];
  const isPublicPage = publicPages.includes(activePage);
  
  // Redirect to admin / auditor login if trying to view admin panels while not logged in
  const isAdminView = !publicPages.includes(activePage);
  if ((isAdminView || activePage === 'auditor-login') && !isAuthenticated) {
    return <AdminLogin />;
  }

  // Candidate portal pages require a signed-in user
  if ((activePage === 'apply' || activePage === 'user-dashboard') && !publicUser) {
    return <AuthRequired />;
  }

  // Render full screen public pages without sidebar or header
  if (isPublicPage) {
    let page: React.ReactNode = null;
    if (activePage === 'landing') page = <LandingPage />;
    if (activePage === 'login') page = <LoginPage />;
    if (activePage === 'signup') page = <SignupPage />;
    if (activePage === 'user-dashboard') page = <UserDashboard />;
    if (activePage === 'apply') page = <MultiStepApplyForm />;
    if (activePage === 'confirm') page = <ConfirmEmailPage />;
    if (activePage === 'forgot-password') page = <ForgotPasswordPage />;
    if (activePage === 'reset-password') page = <ResetPasswordPage />;
    if (activePage === 'privacy-policy') page = <PrivacyPolicyPage />;
    if (activePage === 'terms') page = <TermsPage />;
    return (
      <>
        {page}
        <LiveChatWidget />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-page text-primary selection:bg-[#AF7C28] selection:text-white font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileNavOpen} onCloseMobile={() => setIsMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header 
          onOpenCreateJob={() => {
            setEditingJob(null);
            setIsCreateJobOpen(true);
          }}
          onOpenAddApplicant={() => setIsAddApplicantOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenNav={() => setIsMobileNavOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto">
          {activePage === 'dashboard' && <DashboardView />}
          {activePage === 'jobs' && (
            <JobsView
              onOpenCreateJob={() => {
                setEditingJob(null);
                setIsCreateJobOpen(true);
              }}
              onOpenEditJob={(job) => {
                setEditingJob(job);
                setIsCreateJobOpen(true);
              }}
            />
          )}
          {activePage === 'applicants' && <ApplicantsView onOpenAddApplicant={() => setIsAddApplicantOpen(true)} />}
          {activePage === 'interviews' && <InterviewCalendarView />}
          {activePage === 'employees' && <EmployeesView />}
          {activePage === 'chat' && <AdminChatView />}
          {activePage === 'reports' && <ReportsView />}
          {activePage === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ApplicantDrawer />
      <CommandPalette />
      <ToastContainer />
      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => {
          setIsCreateJobOpen(false);
          setEditingJob(null);
        }}
        editingJob={editingJob}
      />
      <AddApplicantModal isOpen={isAddApplicantOpen} onClose={() => setIsAddApplicantOpen(false)} />
      <HowItWorksPanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <RecruitmentProvider>
      <MainLayout />
    </RecruitmentProvider>
  );
}

export default App;

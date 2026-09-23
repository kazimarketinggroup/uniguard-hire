import React, { useState, useRef, useEffect } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  Plus, 
  Bell, 
  ChevronRight, 
  UserPlus, 
  Briefcase, 
  Lightbulb, 
  Menu,
  ShieldCheck,
  MessageSquare,
  Clock,
  X,
  Eye
} from 'lucide-react';

interface HeaderProps {
  onOpenCreateJob: () => void;
  onOpenAddApplicant: () => void;
  onOpenGuide: () => void;
  onOpenNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateJob, onOpenAddApplicant, onOpenGuide, onOpenNav }) => {
  const { activePage, applicants, activityLogs, messages, setActivePage, isAuditor } = useRecruitment();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setShowQuickMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of UK security recruitment & manual vetting pipeline' },
    jobs: { title: 'Security Job Listings', subtitle: 'Active guard vacancies & application tracking' },
    applicants: { title: 'Applicants & Vetting Queue', subtitle: 'Review applications, schedule interviews, and perform manual checks' },
    interviews: { title: 'Interview Calendar', subtitle: 'Scheduled interview slots with security guard candidates' },
    employees: { title: 'Hired Security Staff', subtitle: 'Active employees, badge numbers, and SIA licence expiry tracking' },
    chat: { title: 'Candidate Messaging', subtitle: 'Live chat with applicants — send, edit and delete messages' },
    reports: { title: 'Vetting & Recruitment Reports', subtitle: 'Audit statistics, pass rates, and compliance analytics' },
    settings: { title: 'System Settings', subtitle: 'UK security company settings & vetting checklist configuration' },
    landing: { title: 'Careers Portal', subtitle: 'Public security guard job application form' }
  };

  const currentMeta = pageTitleMap[activePage] || { title: activePage, subtitle: '' };

  const pendingChecksCount = applicants.filter(a => 
    a.currentStage === 'vetting_in_progress' || 
    a.vettingChecks.some(c => c.status === 'pending')
  ).length;

  const unreadMessagesCount = messages.filter(m => m.sender === 'user' && !m.readByAdmin).length;
  const totalNotifications = pendingChecksCount + unreadMessagesCount;

  return (
    <header className="h-16 border-b border-line bg-page-dim backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenNav}
          className="lg:hidden p-2 rounded-lg bg-panel border border-line text-secondary hover:text-primary transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-tertiary truncate">
            <span className="hidden sm:inline">Uniguard Hire</span>
            <ChevronRight className="w-3.5 h-3.5 text-faint hidden sm:inline" />
            <span className="text-primary font-medium capitalize truncate">{activePage}</span>
          </div>
          <h1 className="text-base font-semibold text-primary flex items-center gap-2 truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        {/* Auditor Read-Only Banner */}
        {isAuditor && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0F172A] border border-slate-700 text-amber-400 text-xs font-bold shadow-sm">
            <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline text-white">Auditor View: <span className="text-amber-400">Read-Only Mode (BS 7858 Compliance)</span></span>
            <span className="sm:hidden text-amber-400">Auditor (Read-Only)</span>
          </div>
        )}

        {/* Pending Check Indicator */}
        {pendingChecksCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{pendingChecksCount} Pending Vetting Check{pendingChecksCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* How it works */}
        <button
          onClick={onOpenGuide}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-panel border border-line text-secondary hover:text-[#AF7C28] hover:border-[#AF7C28]/40 transition-colors"
          title="How this dashboard works"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-xs font-semibold">How it works</span>
        </button>

        {/* Interactive Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl border transition-all ${
              showNotifications ? 'bg-panel-2 border-[#AF7C28] text-primary' : 'bg-panel border-line text-secondary hover:text-primary'
            }`}
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-zinc-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-panel border border-line rounded-2xl shadow-2xl p-4 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#AF7C28]" />
                  <span className="font-bold text-primary text-sm">Notifications & Activity</span>
                </div>
                <button onClick={() => setShowNotifications(false)} className="text-tertiary hover:text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notification Categories */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {unreadMessagesCount > 0 && (
                  <div 
                    onClick={() => { setShowNotifications(false); setActivePage('chat'); }}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 cursor-pointer hover:bg-amber-500/20 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-600">{unreadMessagesCount} Unread Message{unreadMessagesCount > 1 ? 's' : ''}</div>
                      <div className="text-[11px] text-secondary">Candidate sent a new message in chat.</div>
                    </div>
                  </div>
                )}

                {pendingChecksCount > 0 && (
                  <div 
                    onClick={() => { setShowNotifications(false); setActivePage('applicants'); }}
                    className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-2.5 cursor-pointer hover:bg-sky-500/20 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sky-600">{pendingChecksCount} Vetting Check{pendingChecksCount > 1 ? 's' : ''} Require Review</div>
                      <div className="text-[11px] text-secondary">Click to open applicant vetting pipeline.</div>
                    </div>
                  </div>
                )}

                {/* Activity Feed */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2">Recent System Audit Stream</div>
                  <div className="space-y-2">
                    {activityLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-panel-2 border border-line flex items-start gap-2.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-tertiary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-primary">{log.applicantName}: </span>
                          <span className="text-secondary">{log.action}</span>
                          <div className="text-[10px] text-tertiary mt-0.5">{log.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-line text-center">
                <button 
                  onClick={() => { setShowNotifications(false); setActivePage('applicants'); }}
                  className="text-[#AF7C28] hover:underline font-bold text-[11px]"
                >
                  View All Applicants & Audit Trail →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Dropdown — only for admins */}
        {!isAuditor && (
          <div className="relative" ref={quickMenuRef}>
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#AF7C28] hover:bg-[#c99a3e] text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Quick Action</span>
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-panel border border-line rounded-xl shadow-2xl p-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenCreateJob();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2 text-primary text-left transition-colors font-semibold"
                >
                  <Briefcase className="w-4 h-4 text-[#AF7C28]" />
                  <span>Post New Job</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenAddApplicant();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2 text-primary text-left transition-colors font-semibold"
                >
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <span>Add Applicant</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

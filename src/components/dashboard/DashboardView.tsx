import React, { useMemo } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import {
  Inbox,
  ShieldCheck,
  CalendarDays,
  Briefcase,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { requiredPending } from '../common/recruitmentStages';
import { Avatar } from '../common/Avatar';

export const DashboardView: React.FC = () => {
  const { applicants, employees, setSelectedApplicant, setActivePage, logout, isAuditor } = useRecruitment();

  const newCount = applicants.filter(a => a.currentStage === 'applied' || a.currentStage === 'under_review').length;
  const vettingCount = useMemo(
    () => applicants.filter(a => requiredPending(a) > 0 && a.currentStage !== 'hired' && a.currentStage !== 'rejected').length,
    [applicants]
  );
  const interviewCount = applicants.filter(a => a.currentStage === 'interview_scheduled' || a.currentStage === 'interview_completed').length;

  const attentionQueue = useMemo(() => {
    return applicants
      .filter(a => requiredPending(a) > 0 && a.currentStage !== 'hired' && a.currentStage !== 'rejected')
      .sort((a, b) => requiredPending(b) - requiredPending(a))
      .slice(0, 5);
  }, [applicants]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const items = [
    {
      key: 'new',
      count: newCount,
      text: 'new application' + (newCount === 1 ? '' : 's') + ' to review',
      page: 'applicants',
      dot: 'bg-sky-500'
    },
    {
      key: 'vetting',
      count: vettingCount,
      text: 'candidate' + (vettingCount === 1 ? '' : 's') + ' needing security checks',
      page: 'applicants',
      dot: 'bg-amber-500'
    },
    {
      key: 'interviews',
      count: interviewCount,
      text: 'interview' + (interviewCount === 1 ? '' : 's') + ' on the calendar',
      page: 'interviews',
      dot: 'bg-purple-500'
    }
  ];

  const actions = [
    {
      label: isAuditor ? 'Audit New Applicants' : 'Review New Applicants',
      desc: isAuditor ? 'Inspect submitted credentials and SIA details' : 'See fresh applications and confirm SIA details',
      icon: <Inbox className="w-6 h-6" />,
      iconBg: 'bg-sky-500/15 text-sky-500 border-sky-500/25',
      page: 'applicants',
      badge: newCount > 0 ? newCount : null,
      badgeCls: 'bg-sky-500 text-white'
    },
    {
      label: isAuditor ? 'Audit BS 7858 Vetting' : 'Do Security Checks',
      desc: isAuditor ? 'Audit 5-point verification files & dossiers' : 'Approve or reject each vetting check',
      icon: <ShieldCheck className="w-6 h-6" />,
      iconBg: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
      page: 'applicants',
      badge: vettingCount > 0 ? vettingCount : null,
      badgeCls: 'bg-amber-500 text-white'
    },
    {
      label: isAuditor ? 'Interview Logs' : 'Schedule Interviews',
      desc: isAuditor ? 'Inspect interview records and scores' : 'Book slots and see who is coming in',
      icon: <CalendarDays className="w-6 h-6" />,
      iconBg: 'bg-purple-500/15 text-purple-500 border-purple-500/25',
      page: 'interviews',
      badge: interviewCount > 0 ? interviewCount : null,
      badgeCls: 'bg-purple-500 text-white'
    },
    {
      label: isAuditor ? 'Job Listings Audit' : 'Post a New Job',
      desc: isAuditor ? 'Audit guard specifications & licence criteria' : 'List a vacancy on the careers page',
      icon: <Briefcase className="w-6 h-6" />,
      iconBg: 'bg-[#AF7C28]/15 text-[#AF7C28] border-[#AF7C28]/25',
      page: 'jobs',
      badge: null,
      badgeCls: ''
    }
  ];

  const caughtUp = newCount === 0 && vettingCount === 0 && interviewCount === 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans">

      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-tertiary uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#AF7C28]" />
            <span>{today}</span>
            {isAuditor && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0F172A] text-amber-400 border border-slate-700 ml-2 shadow-sm">
                AUDITOR PORTAL
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-primary mt-1">
            {isAuditor ? 'Compliance Audit Overview' : 'Good day!'}
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            {isAuditor 
              ? 'BS 7858 compliance inspection dashboard. All verification files and logs in read-only mode.' 
              : 'Here is everything you need to do today.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-panel hover:bg-panel-2 text-secondary hover:text-rose-500 border border-line text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ===== What needs you today ===== */}
      <div className="rounded-2xl bg-panel-dim border border-line p-5">
        <div className="text-xs font-bold text-primary mb-3">What needs you today?</div>
        {caughtUp ? (
          <div className="flex items-center gap-3 text-sm text-secondary">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>All caught up. Nothing urgent — relax or review the applicant list.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {items.filter(i => i.count > 0).map(item => (
              <button
                key={item.key}
                onClick={() => setActivePage(item.page as 'applicants' | 'interviews')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-panel hover:bg-panel-2 border border-line transition-colors text-left group"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`}></span>
                <span className="text-sm font-bold text-primary">{item.count}</span>
                <span className="text-sm text-secondary">{item.text}</span>
                <ChevronRight className="w-4 h-4 text-faint ml-auto group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Quick actions ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={() => setActivePage(action.page as 'applicants' | 'interviews' | 'jobs')}
            className="group relative p-5 rounded-2xl bg-panel border border-line hover:border-[#AF7C28]/40 hover:shadow-lg transition-all text-left flex items-start gap-4"
          >
            {action.badge !== null && (
              <span className={`absolute top-3 right-3 min-w-6 h-6 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${action.badgeCls}`}>
                {action.badge}
              </span>
            )}
            <span className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${action.iconBg}`}>
              {action.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-primary group-hover:text-[#8f6420] transition-colors">{action.label}</span>
              <span className="block text-xs text-secondary mt-1">{action.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ===== Who needs your attention ===== */}
      <div className="rounded-2xl bg-panel-dim border border-line overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Who needs your attention</h3>
          {attentionQueue.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
              {attentionQueue.length}
            </span>
          )}
        </div>

        <div className="divide-y divide-line/70">
          {attentionQueue.length === 0 ? (
            <div className="p-6 text-center space-y-1.5">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
              <p className="text-xs text-primary font-semibold">Nothing waiting on you.</p>
              <p className="text-[11px] text-tertiary">All security checks are up to date.</p>
            </div>
          ) : (
            attentionQueue.map(applicant => (
              <button
                key={applicant.id}
                onClick={() => setSelectedApplicant(applicant)}
                className="w-full p-4 flex items-center gap-3 hover:bg-panel-2-dim transition-colors text-left"
              >
                <Avatar name={applicant.fullName} url={applicant.avatarUrl} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{applicant.fullName}</div>
                  <div className="text-[11px] text-tertiary mt-0.5 truncate">
                    {applicant.appliedJobTitle} · {requiredPending(applicant)} check{requiredPending(applicant) > 1 ? 's' : ''} to do
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-panel-2 hover:bg-panel-3 text-primary border border-line-strong font-bold transition-all text-[11px] flex items-center gap-1">
                  <span>Review</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </button>
            ))
          )}
          {attentionQueue.length > 0 && (
            <button
              onClick={() => setActivePage('applicants')}
              className="w-full p-3 text-center text-[11px] text-[#AF7C28] hover:text-[#8f6420] hover:bg-panel-2-dim transition-colors font-semibold"
            >
              View all applicants →
            </button>
          )}
        </div>
      </div>

      {/* ===== Small shortcuts ===== */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-tertiary">Quick links:</span>
        <button
          onClick={() => setActivePage('employees')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel border border-line text-secondary hover:text-primary transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Hired Staff ({employees.length})
        </button>
        <button
          onClick={() => setActivePage('reports')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel border border-line text-secondary hover:text-primary transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Reports
        </button>
      </div>
    </div>
  );
};
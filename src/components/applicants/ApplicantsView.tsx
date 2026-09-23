import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  SlidersHorizontal,
  XCircle
} from 'lucide-react';
import { 
  STAGE_RANK,
  STAGE_BADGE, 
  STAGE_DOT, 
  STAGE_LABEL, 
  requiredPending, 
  requiredApproved, 
  requiredRejected, 
  requiredTotal 
} from '../common/recruitmentStages';
import { Avatar } from '../common/Avatar';

interface ApplicantsViewProps {
  onOpenAddApplicant: () => void;
}

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Applicants' },
  { id: 'applied', label: 'New Applied' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'interview_scheduled', label: 'Interview' },
  { id: 'vetting_in_progress', label: 'Vetting' },
  { id: 'ready_for_contract', label: 'Ready Contract' },
  { id: 'contract_sent', label: 'Contract Sent' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' }
];

export const ApplicantsView: React.FC<ApplicantsViewProps> = ({ onOpenAddApplicant }) => {
  const { 
    applicants, 
    setSelectedApplicant, 
    searchQuery, 
    setSearchQuery, 
    selectedStageFilter, 
    setSelectedStageFilter,
    isAuditor
  } = useRecruitment();

  const filteredApplicants = applicants
    .filter(app => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === '' ||
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.siaLicenceNo.toLowerCase().includes(q) ||
        app.appliedJobTitle.toLowerCase().includes(q);

      const matchesStage = selectedStageFilter === 'all' || app.currentStage === selectedStageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      const aRejected = requiredRejected(a) > 0 ? -1 : 0;
      const bRejected = requiredRejected(b) > 0 ? -1 : 0;
      if (aRejected !== bRejected) return aRejected - bRejected;
      return (STAGE_RANK[a.currentStage] ?? 99) - (STAGE_RANK[b.currentStage] ?? 99);
    });

  const filterCount = (id: string) =>
    id === 'all' ? applicants.length : applicants.filter(a => a.currentStage === id).length;

  const pendingTotal = applicants.reduce((sum, a) => sum + requiredPending(a), 0);
  const flaggedTotal = applicants.filter(a => requiredRejected(a) > 0).length;
  const hiredTotal = applicants.filter(a => a.currentStage === 'hired').length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header & KPI Summary Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                {isAuditor ? 'Compliance Vetting & Audit Archive' : 'Applicant Management'}
              </h1>
              {isAuditor && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#0F172A] text-amber-400 border border-slate-700 shadow-sm">
                  BS 7858 READ-ONLY
                </span>
              )}
            </div>
            <p className="text-xs text-secondary mt-1">
              {isAuditor 
                ? 'BS 7858 compliance inspection portal. Audit candidate files, right to work share codes, SIA records, and 5-year history.'
                : 'Review applications, conduct 5-point UK SIA vetting, and issue contracts.'}
            </p>
          </div>

          {!isAuditor && (
            <button
              onClick={onOpenAddApplicant}
              className="px-5 py-2.5 rounded-xl bg-[#AF7C28] hover:bg-[#c99a3e] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>New Application</span>
            </button>
          )}
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="linear-card p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Total Applicants</span>
              <Users className="w-4 h-4 text-[#AF7C28]" />
            </div>
            <div className="text-xl font-bold text-primary font-mono">{applicants.length}</div>
          </div>

          <div className="linear-card p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Pending Checks</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-500 font-mono">{pendingTotal}</div>
          </div>

          <div className="linear-card p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Flagged / Failed</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-rose-500 font-mono">{flaggedTotal}</div>
          </div>

          <div className="linear-card p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Roster Hired</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-500 font-mono">{hiredTotal}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search applicants by name, email, SIA licence or job role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full linear-input pl-10 pr-4 py-3 rounded-xl text-xs font-medium shadow-sm"
          />
        </div>

        {/* Filter Stage Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {FILTERS.map(f => {
            const active = selectedStageFilter === f.id;
            const count = filterCount(f.id);
            return (
              <button
                key={f.id}
                onClick={() => setSelectedStageFilter(f.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#AF7C28] text-white border-[#AF7C28] shadow-md shadow-amber-500/20'
                    : 'bg-panel text-secondary border-line hover:border-line-strong hover:text-primary'
                }`}
              >
                <span>{f.label}</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${active ? 'bg-black/20 text-white' : 'bg-panel-2 text-tertiary'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applicants List Grid */}
      {filteredApplicants.length === 0 ? (
        <div className="p-16 text-center text-secondary text-xs space-y-3 rounded-2xl border border-dashed border-line-strong bg-panel">
          <Inbox className="w-10 h-10 mx-auto text-faint" />
          <p className="font-bold text-primary text-sm">No matching applicants found</p>
          <p className="text-tertiary">Try clearing your search query or selecting a different filter stage.</p>
        </div>
      ) : (
        <div className="linear-card rounded-2xl overflow-hidden border border-line">
          <div className="p-4 bg-panel-dim border-b border-line flex items-center justify-between text-xs font-semibold text-secondary">
            <span>Showing {filteredApplicants.length} Candidates</span>
            <span>Vetting Protocol & Action</span>
          </div>

          <div className="divide-y divide-line">
            {filteredApplicants.map(applicant => {
              const pending = requiredPending(applicant);
              const ok = requiredApproved(applicant);
              const rejected = requiredRejected(applicant);
              const total = requiredTotal(applicant);
              const stage = applicant.currentStage;
              const isHired = stage === 'hired';

              return (
                <div
                  key={applicant.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedApplicant(applicant)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedApplicant(applicant); }}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-panel-2-dim transition-all cursor-pointer group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <Avatar name={applicant.fullName} url={applicant.avatarUrl} size="lg" />

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-primary group-hover:text-[#AF7C28] transition-colors">
                          {applicant.fullName}
                        </span>

                        {isHired && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            ROSTER ACTIVE
                          </span>
                        )}

                        {rejected > 0 && (
                          <span className="text-[10px] bg-rose-500/15 text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            CHECK REJECTED
                          </span>
                        )}

                        {pending > 0 && !isHired && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-600 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                            {pending} PENDING CHECK{pending > 1 ? 'S' : ''}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-secondary flex items-center gap-2 truncate">
                        <span>{applicant.appliedJobTitle}</span>
                        <span>•</span>
                        <span className="font-mono text-tertiary flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#AF7C28]" />
                          {applicant.siaLicenceNo || 'No SIA Listed'}
                        </span>
                      </div>

                      {/* Vetting Checklist Summary Badges */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {applicant.vettingChecks.map((chk, i) => (
                          <span
                            key={i}
                            title={`${chk.title}: ${chk.status}`}
                            className={`w-2.5 h-2.5 rounded-full border ${
                              chk.status === 'approved'
                                ? 'bg-emerald-500 border-emerald-600'
                                : chk.status === 'rejected'
                                ? 'bg-rose-500 border-rose-600'
                                : 'bg-panel-3 border-line-strong'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] text-tertiary font-mono ml-1">
                          {ok}/{total} Passed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage & Manage Trigger */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STAGE_BADGE[stage] || 'bg-panel'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[stage] || 'bg-zinc-500'} inline-block mr-1.5`} />
                      {STAGE_LABEL[stage] || stage}
                    </span>

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedApplicant(applicant); }}
                      className={`px-4 py-2 rounded-xl border font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm ${
                        isAuditor 
                          ? 'bg-[#0F172A] hover:bg-slate-800 text-white border-slate-700 shadow-sm' 
                          : 'bg-panel-2 hover:bg-panel-3 text-primary border-line-strong'
                      }`}
                    >
                      {isAuditor ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Audit Vetting File</span>
                        </>
                      ) : (
                        <>
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#AF7C28]" />
                          <span>Review & Vetting</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

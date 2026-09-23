import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import {
  MapPin, ArrowRight, LogOut, FileText, Clock, CheckCircle, MessageSquare, Send,
  CheckCheck, Check, Calendar, PartyPopper, Inbox, XCircle, Video, Building2, ShieldCheck,
  Lock, Unlock, FileCheck, Eye, CheckCircle2, X
} from 'lucide-react';
import { STAGE_BADGE, STAGE_LABEL } from '../common/recruitmentStages';
import type { Applicant } from '../../types/recruitment';

const FLOW_STEPS = [
  { stage: 'applied', label: 'Application Sent', icon: CheckCircle },
  { stage: 'under_review', label: 'Under Review', icon: FileText },
  { stage: 'interview', label: 'Interview', icon: Calendar },
  { stage: 'vetting', label: 'Vetting & Checks', icon: ShieldIcon },
  { stage: 'contract', label: 'Contract', icon: Inbox },
  { stage: 'hired', label: 'Hired', icon: PartyPopper },
];

function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

const flowIndex = (app: Applicant): number => {
  const s = app.currentStage;
  if (s === 'applied') return 0;
  if (s === 'under_review') return 1;
  if (s === 'interview_scheduled' || s === 'interview_completed') return 2;
  if (s === 'vetting_in_progress') return 3;
  if (s === 'ready_for_contract' || s === 'contract_sent') return 4;
  if (s === 'hired') return 5;
  return 0;
};

const StageFlow: React.FC<{ app: Applicant }> = ({ app }) => {
  const idx = flowIndex(app);
  const rejected = app.currentStage === 'rejected';
  const progress = rejected ? 100 : ((idx + 1) / FLOW_STEPS.length) * 100;
  const activeStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [idx]);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Your Progress</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 sm:hidden">
            {rejected ? 'Closed' : FLOW_STEPS[idx]?.label || 'In Progress'}
          </span>
        </div>
        {rejected ? (
          <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 shrink-0"><XCircle className="w-3.5 h-3.5" /> Application closed</span>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-600 shrink-0">{Math.round(progress)}% complete</span>
        )}
      </div>

      {/* Touch-friendly horizontal stepper contained within the card */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2 scroll-smooth">
        <div className="min-w-[460px] sm:min-w-0 flex items-center justify-between">
          {FLOW_STEPS.map((step, i) => {
            const done = !rejected && i < idx;
            const current = !rejected && i === idx;
            const Icon = step.icon;
            return (
              <React.Fragment key={step.stage}>
                {i > 0 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-1.5 -mt-5 transition-colors ${rejected ? 'bg-rose-300' : done ? 'bg-emerald-400' : current ? 'bg-amber-300' : 'bg-line'}`} />
                )}
                <div
                  ref={current ? activeStepRef : null}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      rejected
                        ? 'bg-rose-50 border-rose-300 text-rose-500'
                        : done
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : current
                        ? 'bg-amber-400 border-amber-400 text-zinc-900 shadow-md shadow-amber-400/30 ring-4 ring-amber-400/20'
                        : 'bg-white border-line text-faint'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-medium text-center leading-tight w-14 sm:w-16 ${
                    rejected ? 'text-rose-400' : done ? 'text-emerald-600 font-semibold' : current ? 'text-amber-600 font-bold' : 'text-tertiary'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const InterviewCard: React.FC<{ app: Applicant }> = ({ app }) => {
  const { interviewsByApplication, showToast } = useRecruitment();
  const upcoming = interviewsByApplication(app.id).filter(i => !i.completed)[0];

  if (!upcoming) return null;
  const date = new Date(upcoming.scheduledAt);
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  const isVideo = /video|call|zoom|teams|meet/i.test(upcoming.location);

  // Generate Google Calendar Link
  const gcalTitle = encodeURIComponent(`Uniguard Security Interview — ${app.appliedJobTitle}`);
  const startTimeISO = date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endDate = new Date(date.getTime() + (upcoming.durationMinutes || 45) * 60000);
  const endTimeISO = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${startTimeISO}/${endTimeISO}&details=${encodeURIComponent(upcoming.notes || 'Uniguard Security Recruitment Interview')}&location=${encodeURIComponent(upcoming.location)}`;

  const copyDetails = () => {
    const text = `Uniguard Interview: ${date.toLocaleDateString('en-GB')} at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}. Location: ${upcoming.location}`;
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', 'Interview details copied.', 'info');
  };

  return (
    <div className="mt-5 p-5 rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50/40 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-purple-900 flex items-center gap-2">
          {isVideo ? <Video className="w-4 h-4 text-purple-600 animate-pulse" /> : <Building2 className="w-4 h-4 text-purple-600" />}
          Official Interview Scheduled
        </h4>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
          days < 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : days === 0 ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse' : 'bg-purple-100 text-purple-800 border-purple-300'
        }`}>
          {days < 0 ? 'Completed ✓' : days === 0 ? 'TODAY!' : days === 1 ? 'Tomorrow' : `In ${days} Days`}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-bold text-purple-950">
          <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="font-mono text-purple-700 font-extrabold">• {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-purple-800">
          <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="font-semibold">{upcoming.location}</span>
          <span className="text-purple-400">•</span>
          <span>{upcoming.durationMinutes} Minutes</span>
        </div>
      </div>

      {upcoming.notes && (
        <div className="text-xs text-purple-900 bg-white/90 rounded-xl p-3 border border-purple-200/80 leading-relaxed">
          <span className="font-bold text-purple-950 block mb-0.5">Instructions from Recruitment Team:</span>
          {upcoming.notes}
        </div>
      )}

      {/* Action Buttons for Candidate */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <a
          href={gcalUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Add to Google Calendar</span>
        </a>
        <button
          onClick={copyDetails}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-900 font-semibold text-xs border border-purple-200 transition-colors"
        >
          Copy Details
        </button>
      </div>
    </div>
  );
};

const COMPANY_DOCS = [
  {
    id: 'contract',
    title: 'Employment Contract & Terms of Engagement',
    badge: 'Legal Contract',
    desc: 'UK standard SIA security officer terms, £15.50/hr pay rate, site deployment, and conditional probationary terms.',
    content: `UNIGUARD SECURITY SERVICES UK LTD
EMPLOYMENT CONTRACT & STATEMENT OF TERMS (BS 7858 & SIA COMPLIANT)

1. THE PARTIES
This agreement is entered into between Uniguard Security Services UK Ltd (Company No. 09823412, Registered in England & Wales) ("The Employer") and the appointed Security Officer ("The Employee").

2. COMMENCEMENT & PROBATIONARY PERIOD
Employment commences upon completion of all BS 7858 screening verifications. A probationary period of 12 weeks applies during which conditional employment and reference auditing standards apply.

3. JOB ROLE & DUTIES
The Employee is engaged as an SIA Licensed Security Officer. Duties encompass static venue guarding, access control, regular perimeter patrols, incident logging, and adhering to customer safety directives.

4. REMUNERATION & PAY RATE
Base pay rate is £15.50 per hour, payable directly into the Employee's verified UK bank account via direct deposit. Approved overtime or bank holiday shifts are remunerated according to site assignment schedules.

5. BS 7858 & SIA LICENCE COMPLIANCE
The Employee must maintain an active, valid SIA Licence and display it at all times whilst on duty. The Employee consents to periodic BS 7858 screening audits and criminal/financial re-vetting.

6. CONFIDENTIALITY & SITE SAFETY
All assignment details, client premises layouts, key codes, and operational directives are strictly confidential and must never be disclosed to third parties.`,
  },
  {
    id: 'handbook',
    title: 'BS 7858 Staff Handbook & Code of Conduct',
    badge: 'BS 7858 Standards',
    desc: 'BS 7858:2019 Security Screening Code of Practice, uniform standards, radio protocol & professional ethics.',
    content: `UNIGUARD SECURITY SERVICES UK LTD
BS 7858:2019 SECURITY STAFF HANDBOOK & PROFESSIONAL CODE OF CONDUCT

1. STANDARD OF CONDUCT
All Uniguard officers represent the front line of security and customer trust. Officers must remain vigilant, courteous, impartial, and punctual on all assignments.

2. UNIFORM & SIA BADGE DISPLAY
Full approved uniform (security blazer/jacket, tie, dark trousers, and clean footwear) must be worn. Your SIA Licence must be worn in an approved arm-band or lanyard display at all times.

3. BS 7858 VETTING STANDARDS
Under British Standard BS 7858:2019, any change of residential address, criminal convictions, court summons, or financial judgments must be reported to the compliance department immediately.

4. SUBSTANCE POLICY
Uniguard operates a strict zero-tolerance drug and alcohol policy. Random screenings may be performed in accordance with site regulations and client requirements.

5. INCIDENT LOGGING & ESCALATION
All security breaches, suspicious activity, or health & safety hazards must be recorded in the site Daily Occurrence Book (DOB) and escalated to Uniguard 24/7 Control.`,
  },
  {
    id: 'safety',
    title: 'Health, Safety & Lone Worker Assignment Policy',
    badge: 'Safety & Operations',
    desc: 'Emergency response, lone-worker hourly check-in intervals, risk escalation & first aid guidance.',
    content: `UNIGUARD SECURITY SERVICES UK LTD
HEALTH, SAFETY, LONE WORKING & OPERATIONAL ASSIGNMENT POLICY

1. LONE WORKER CHECK-INS
Where an officer is stationed on a lone-worker assignment, hourly check-in calls to the 24/7 Control Room are mandatory. Failure to check in triggers automated welfare escalation.

2. EMERGENCY ESCALATION & 999
In circumstances involving imminent violence, weapons, fire, or acute medical emergencies, immediately contact emergency services (999) before notifying Uniguard Control.

3. DYNAMIC RISK ASSESSMENT
Prior to commencing any patrol or intervening in a disturbance, officers must assess risks to their personal safety. Never place yourself or the public in avoidable physical hazard.

4. ACCIDENT & NEAR MISS REPORTING
Every incident or near miss occurring on site must be reported within 2 hours to Uniguard Operations using the standard incident report form.`,
  },
];

const CompanyDocumentsSection: React.FC<{ app: Applicant }> = ({ app }) => {
  const { completeHiring, showToast } = useRecruitment();
  const [readingDoc, setReadingDoc] = useState<typeof COMPANY_DOCS[0] | null>(null);
  const [agreeContract, setAgreeContract] = useState(false);
  const [agreeHandbook, setAgreeHandbook] = useState(false);
  const [agreeSafety, setAgreeSafety] = useState(false);
  const [signerName, setSignerName] = useState(app.fullName || '');
  const [signing, setSigning] = useState(false);

  const isHired = app.currentStage === 'hired' || app.companyDocsSigned;
  const isApproved = app.approvedByAdmin || app.currentStage === 'contract_sent' || app.currentStage === 'ready_for_contract';

  const handleSignAndComplete = async () => {
    if (!agreeContract || !agreeHandbook || !agreeSafety) {
      showToast('Agreement Required', 'Please check all 3 agreement boxes before signing.', 'error');
      return;
    }
    if (!signerName.trim()) {
      showToast('Signature Required', 'Please enter your printed legal name to sign.', 'error');
      return;
    }
    setSigning(true);
    try {
      completeHiring(app.id, signerName.trim());
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      {/* 1. STATE: HIRING COMPLETE */}
      {isHired && (
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-white">Hiring Complete ✓</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/25 text-white whitespace-nowrap">
                    ACTIVE OFFICER
                  </span>
                </div>
                <p className="text-xs text-white/90 mt-1 leading-relaxed">
                  All company documents and onboarding requirements have been completed and signed.
                </p>
              </div>
            </div>

            {app.employeeId && (
              <div className="self-start sm:self-auto sm:text-right shrink-0 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                <span className="text-[10px] font-medium text-white/80 block uppercase tracking-wider">Employee ID</span>
                <span className="font-mono font-extrabold text-sm text-white">{app.employeeId}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-black/20 text-xs text-white/90 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/80 shrink-0">Digitally Signed By:</span>
              <strong className="text-white font-mono truncate text-right">{app.companyDocsSignerName || app.fullName}</strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/80 shrink-0">Signed Date:</span>
              <span className="text-white font-medium shrink-0">{app.companyDocsSignedAt ? new Date(app.companyDocsSignedAt).toLocaleDateString('en-GB') : app.hiredDate || 'Confirmed'}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/80 shrink-0">Assigned Role:</span>
              <span className="text-white font-semibold truncate text-right">{app.appliedJobTitle}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {COMPANY_DOCS.map(doc => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setReadingDoc(doc)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <FileCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{doc.badge}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. STATE: LOCKED (AWAITING ADMIN APPROVAL) */}
      {!isHired && !isApproved && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary">Company Onboarding Documents & Policies</h4>
                <p className="text-[11px] text-tertiary">Employment contract, BS 7858 staff handbook, and operational safety pack</p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/30 flex items-center gap-1 shrink-0">
              <Lock className="w-3 h-3" /> Pending Admin Approval
            </span>
          </div>

          <p className="text-xs text-secondary leading-relaxed bg-white/60 p-3 rounded-xl border border-line">
            Under BS 7858 security vetting guidelines, official company documents and your formal employment contract will be unlocked once an administrator reviews and approves your application. You will be notified instantly when access is granted.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 opacity-60">
            {COMPANY_DOCS.map(doc => (
              <div key={doc.id} className="p-2.5 rounded-xl bg-panel border border-dashed border-line text-xs flex items-center gap-2 text-tertiary">
                <Lock className="w-3.5 h-3.5 text-faint shrink-0" />
                <span className="truncate">{doc.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STATE: UNLOCKED (ADMIN APPROVED — OFFICER REVIEWS & SIGNS) */}
      {!isHired && isApproved && (
        <div className="p-4 sm:p-6 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-700 shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-base text-primary">Company Documents & Onboarding</h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/40">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  An administrator has approved your application! Review the 3 documents below, confirm agreement, and sign to complete hiring.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Document Cards with Preview */}
          <div className="space-y-2.5">
            {COMPANY_DOCS.map(doc => (
              <div key={doc.id} className="p-3.5 rounded-xl bg-white border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-[#AF7C28] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-primary text-xs truncate">{doc.title}</span>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-panel-2 border border-line text-tertiary">{doc.badge}</span>
                    </div>
                    <p className="text-[11px] text-tertiary truncate mt-0.5">{doc.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReadingDoc(doc)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#AF7C28]/10 hover:bg-[#AF7C28]/20 text-[#AF7C28] text-xs font-bold border border-[#AF7C28]/30 flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Read & Review
                </button>
              </div>
            ))}
          </div>

          {/* E-Signing Form */}
          <div className="p-4 rounded-xl bg-white border border-line space-y-4">
            <h5 className="text-xs font-bold text-primary uppercase tracking-wider">Candidate Confirmation & E-Signature</h5>
            
            <div className="space-y-2.5 text-xs text-secondary">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeContract}
                  onChange={e => setAgreeContract(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-emerald-600 shrink-0"
                />
                <span className="leading-snug">I have read, understood, and accept the Uniguard Security Employment Contract & Terms of Engagement.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeHandbook}
                  onChange={e => setAgreeHandbook(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-emerald-600 shrink-0"
                />
                <span className="leading-snug">I acknowledge and agree to comply with BS 7858 security vetting standards and the Staff Code of Conduct.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeSafety}
                  onChange={e => setAgreeSafety(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-emerald-600 shrink-0"
                />
                <span className="leading-snug">I agree to all Health, Safety, Lone Worker Check-In, and Operational Assignment procedures.</span>
              </label>
            </div>

            <div className="pt-3 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Full Legal Name (Digital Signature) <span className="text-emerald-600">•</span>
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  placeholder="Enter full legal name"
                  className="w-full px-3.5 py-2 rounded-lg border border-line text-sm font-semibold text-primary bg-panel focus:outline-none focus:border-line-strong"
                />
              </div>

              <button
                type="button"
                onClick={handleSignAndComplete}
                disabled={!agreeContract || !agreeHandbook || !agreeSafety || !signerName.trim() || signing}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                {signing ? 'Signing Documents…' : 'Sign All Documents & Complete Hiring'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {readingDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setReadingDoc(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-line flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-5 border-b border-line bg-panel-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AF7C28]">{readingDoc.badge}</span>
                <h3 className="text-base font-bold text-primary">{readingDoc.title}</h3>
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="p-1.5 rounded-lg border border-line text-secondary hover:text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-secondary font-mono bg-[#faf8f5]">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-secondary">{readingDoc.content}</pre>
            </div>
            <div className="p-4 border-t border-line bg-panel flex items-center justify-end">
              <button
                onClick={() => setReadingDoc(null)}
                className="px-4 py-2 rounded-xl bg-[#AF7C28] text-white text-xs font-bold"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserChat: React.FC<{ app: Applicant; apps: Applicant[] }> = ({ app, apps }) => {
  const { messagesByApplication, sendMessage, markConversationRead, reloadMessages } = useRecruitment();
  const [draft, setDraft] = useState('');
  const [activeAppId, setActiveAppId] = useState(app.id);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeApp = apps.find(a => a.id === activeAppId) || app;
  const msgs = messagesByApplication(activeApp.id);

  useEffect(() => {
    reloadMessages();
  }, []);

  useEffect(() => {
    markConversationRead(activeApp.id, false);
  }, [activeApp.id, msgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(activeApp.id, draft, 'user');
    setDraft('');
  };

  const timeLabel = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Split messages into day groups
  const dayGroups: { label: string; items: typeof msgs }[] = [];
  let lastDate = '';
  for (const m of msgs) {
    const day = new Date(m.createdAt).toDateString();
    if (day !== lastDate) {
      lastDate = day;
      dayGroups.push({ label: dayLabel(m.createdAt), items: [] });
    }
    dayGroups[dayGroups.length - 1].items.push(m);
  }

  // First unread admin message index (for a divider)
  const firstUnreadIdx = msgs.findIndex(m => m.sender === 'admin' && !m.readByUser);

  const quickReplies = [
    'Hi! I have a question about my application.',
    'Can I get an update on my application status?',
    'I have a question about my interview.',
    "I'd like to know more about the vetting process.",
  ];

  return (
    <div className="flex flex-col h-[65vh] min-h-[440px] bg-white border border-line rounded-2xl overflow-hidden shadow-lg shadow-zinc-200/60">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#7a5a22] to-[#AF7C28] flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            Uniguard Recruitment Team
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-400/90 text-emerald-950 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-white/75 text-[11px] truncate">
            Replies within 1 working day. Chat about {activeApp.appliedJobTitle || 'your application'}
          </div>
        </div>
        {apps.length > 1 && (
          <select
            value={activeAppId}
            onChange={e => setActiveAppId(e.target.value)}
            className="bg-white/90 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#7a5a22] outline-none max-w-32"
            title="Switch application"
          >
            {apps.map(a => (
              <option key={a.id} value={a.id}>{a.appliedJobTitle || 'Application'}</option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#faf7f1]">
        {msgs.length === 0 && (
          <div className="text-center pt-8 pb-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#AF7C28]/10 border border-[#AF7C28]/20 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-[#AF7C28]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Start a conversation with our team</p>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                Ask anything about your application, interview, vetting or contract. Pick a suggestion below or type your own message.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {quickReplies.map(q => (
                <button
                  key={q}
                  onClick={() => { setDraft(q); }}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#AF7C28]/30 text-[11px] font-medium text-[#8f6420] hover:bg-[#AF7C28]/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {dayGroups.map(group => (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[10px] font-semibold text-tertiary uppercase tracking-wider">{group.label}</span>
              <div className="flex-1 h-px bg-line" />
            </div>
            {group.items.map(m => {
              const mine = m.sender === 'user';
              const isUnreadDivider = !mine && m.id === msgs[firstUnreadIdx]?.id && firstUnreadIdx !== -1;
              return (
                <div key={m.id} className="space-y-1">
                  {isUnreadDivider && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-amber-400/50" />
                      <span className="text-[10px] font-bold text-amber-600">Unread</span>
                      <div className="flex-1 h-px bg-amber-400/50" />
                    </div>
                  )}
                  <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] ${mine ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                        mine
                          ? 'bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-primary border border-line rounded-2xl rounded-bl-md'
                      }`}>
                        {m.body}
                        {m.editedAt && <span className={`ml-1.5 text-[10px] ${mine ? 'text-white/70' : 'text-tertiary'}`}>(edited)</span>}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-tertiary ${mine ? 'justify-end' : 'justify-start'}`}>
                        <span>{timeLabel(m.createdAt)}</span>
                        {mine && (m.readByAdmin ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Check className="w-3.5 h-3.5 text-tertiary" />)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-line bg-white flex items-end gap-2.5">
        <textarea
          rows={1}
          placeholder="Type your message... (Enter to send)"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-2xl border border-line bg-[#faf7f1] px-4 py-3 text-[13px] text-primary outline-none focus:border-[#AF7C28]/60 focus:ring-2 focus:ring-[#AF7C28]/15 transition-all resize-none max-h-28 placeholder:text-tertiary"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white text-[13px] font-bold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};

export const UserDashboard: React.FC = () => {
  const { jobs, publicUser, publicLogout, setActivePage, applicants, messages, setPendingJobId } = useRecruitment();
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [tab, setTab] = useState<'overview' | 'chat'>('overview');

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const myApplications = applicants.filter(a => a.email === publicUser?.email);
  const myAppIds = useMemo(() => new Set(myApplications.map(a => a.id)), [myApplications]);
  const unreadForMe = messages.filter(m => myAppIds.has(m.applicationId) && m.sender === 'admin' && !m.readByUser).length;

  const sortedApps = useMemo(
    () => [...myApplications].sort((a, b) => b.appliedDate.localeCompare(a.appliedDate)),
    [myApplications]
  );

  const handleApply = () => {
    if (!selectedJob) return;
    setPendingJobId(selectedJob.id);
    setActivePage('apply');
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Top Bar */}
      <header className="border-b border-line bg-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActivePage('landing')} className="flex flex-col items-center cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-9 w-auto object-contain" />
            <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-primary">{publicUser?.name}</p>
              <p className="text-xs text-secondary">{publicUser?.email}</p>
            </div>
            <button
              onClick={publicLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-secondary border border-line hover:border-line-strong hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-line bg-panel backdrop-blur-md sticky top-[61px] sm:top-[69px] z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTab('overview')}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              tab === 'overview' ? 'border-[#AF7C28] text-[#8f6420]' : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            My Application Progress
          </button>
          <button
            onClick={() => setTab('chat')}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              tab === 'chat' ? 'border-[#AF7C28] text-[#8f6420]' : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            Message Recruitment Team
            {unreadForMe > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#AF7C28] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadForMe}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {tab === 'chat' ? (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-primary mb-1">Chat with our recruitment team</h2>
            <p className="text-sm text-secondary mb-6">
              Ask about your application, interview, vetting or contract. Messages are delivered instantly.
            </p>
            {sortedApps.length > 0 ? (
              <UserChat app={sortedApps[0]} apps={sortedApps} />
            ) : (
              <div className="text-center border border-dashed border-line rounded-2xl py-16 space-y-3">
                <MessageSquare className="w-10 h-10 text-faint mx-auto" />
                <p className="text-secondary font-medium">No applications yet</p>
                <p className="text-xs text-tertiary">Submit an application first and you'll be able to message the team here.</p>
                <button
                  onClick={() => setTab('overview')}
                  className="mx-auto mt-2 px-4 py-2 rounded-xl bg-[#AF7C28] text-white text-xs font-bold"
                >
                  Browse Vacancies
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-primary mb-2">Welcome, {publicUser?.name}</h2>
              <p className="text-secondary -mt-3 mb-2">Track your applications live. Status updates and messages appear instantly.</p>

              {sortedApps.length > 0 ? (
                sortedApps.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-line p-4 sm:p-6 shadow-sm overflow-hidden">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="font-bold text-primary text-base">{app.appliedJobTitle || 'Application'}</h4>
                        <p className="text-xs text-secondary">Submitted {app.appliedDate}</p>
                      </div>
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STAGE_BADGE[app.currentStage] || 'bg-slate-500/15 text-slate-600 border-slate-500/25'}`}>
                        {STAGE_LABEL[app.currentStage] || 'Application Received'}
                      </span>
                    </div>

                    <StageFlow app={app} />
                    <InterviewCard app={app} />
                    <CompanyDocumentsSection app={app} />

                    <button
                      onClick={() => setTab('chat')}
                      className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#8f6420] hover:text-[#AF7C28] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message the team about this application
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center border border-dashed border-line rounded-2xl py-14 space-y-3">
                  <FileText className="w-10 h-10 text-faint mx-auto" />
                  <p className="text-secondary font-medium">You haven't submitted any applications yet.</p>
                  <p className="text-xs text-tertiary">Pick a vacancy below and start your application.</p>
                </div>
              )}

              {/* Jobs */}
              <h3 className="text-lg font-bold text-primary flex items-center gap-2 pt-2">
                <FileText className="w-5 h-5" style={{ color: '#AF7C28' }} />
                Active Vacancies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobs.filter(j => j.status === 'active').map(job => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedJobId === job.id
                        ? 'border-amber-400 bg-amber-50/50'
                        : 'border-line hover:border-line-strong bg-panel'
                    }`}
                  >
                    <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded mb-3" style={{ backgroundColor: 'rgba(175,124,40,0.1)', color: '#8f6420' }}>
                      {job.employmentType}
                    </span>
                    <h4 className="font-bold text-primary mb-2">{job.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-secondary mb-1">
                      <MapPin className="w-3.5 h-3.5 text-faint" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-line">
                      <span className="text-xs text-secondary">SIA: <span className="font-medium text-primary">{job.siaRequired ? 'Required' : 'Not Required'}</span></span>
                      <span className="text-xs text-secondary">UK Licence: <span className="font-medium text-primary">{job.drivingLicenceRequired ? 'Required' : 'Not Required'}</span></span>
                      <span className="text-sm font-bold font-mono" style={{ color: '#AF7C28' }}>£{job.payRate.toFixed(2)}/hr</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white transition-all hover:shadow-xl active:scale-[0.98] text-center"
                style={{ backgroundColor: '#AF7C28' }}
              >
                <span className="truncate">Start Application for {selectedJob?.title}</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-panel-2 rounded-xl border border-line p-6">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-faint" />
                  My Applications
                </h3>
                {sortedApps.length === 0 ? (
                  <p className="text-sm text-secondary">You haven't submitted any applications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedApps.map(app => (
                      <div key={app.id} className="flex items-start gap-3 p-3 bg-panel rounded-lg border border-line">
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          app.currentStage === 'rejected' ? 'text-rose-500' :
                          app.currentStage === 'hired' || app.currentStage === 'contract_sent' || app.currentStage === 'ready_for_contract' ? 'text-emerald-600' : 'text-amber-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-primary">{app.appliedJobTitle || 'Application'}</p>
                          <p className="text-xs text-secondary">Submitted {app.appliedDate}</p>
                          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${STAGE_BADGE[app.currentStage] || 'bg-slate-500/15 text-slate-600 border-slate-500/25'}`}>
                            {STAGE_LABEL[app.currentStage] || 'Application Received'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Help Card */}
              <div className="rounded-xl border p-6" style={{ borderColor: 'rgba(175,124,40,0.2)', backgroundColor: 'rgba(175,124,40,0.04)' }}>
                <h3 className="font-bold text-primary mb-2">Need Help?</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Message us anytime from the chat tab, or email{' '}
                  <a
                    href="mailto:recruitment@uniguard.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2 hover:opacity-80"
                    style={{ color: '#AF7C28' }}
                  >
                    recruitment@uniguard.co.uk
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

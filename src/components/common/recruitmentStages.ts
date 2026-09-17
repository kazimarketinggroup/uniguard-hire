import type { ApplicationStage, Applicant } from '../../types/recruitment';

export const STAGE_RANK: Record<string, number> = {
  applied: 0,
  under_review: 1,
  interview_scheduled: 2,
  interview_completed: 3,
  vetting_in_progress: 4,
  ready_for_contract: 5,
  contract_sent: 6,
  hired: 7,
  rejected: 8
};

export const STAGE_BADGE: Record<string, string> = {
  applied: 'bg-slate-500/15 text-slate-600 border-slate-500/25',
  under_review: 'bg-sky-500/15 text-sky-600 border-sky-500/25',
  interview_scheduled: 'bg-purple-500/15 text-purple-600 border-purple-500/25',
  interview_completed: 'bg-purple-500/15 text-purple-600 border-purple-500/25',
  vetting_in_progress: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
  ready_for_contract: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
  contract_sent: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
  hired: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/25',
  rejected: 'bg-rose-500/15 text-rose-600 border-rose-500/25'
};

export const STAGE_DOT: Record<string, string> = {
  applied: 'bg-slate-400',
  under_review: 'bg-sky-400',
  interview_scheduled: 'bg-purple-400',
  interview_completed: 'bg-purple-400',
  vetting_in_progress: 'bg-amber-400',
  ready_for_contract: 'bg-emerald-400',
  contract_sent: 'bg-emerald-400',
  hired: 'bg-indigo-400',
  rejected: 'bg-rose-400'
};

export const STAGE_LABEL: Record<string, string> = {
  applied: 'New Application',
  under_review: 'Under Review',
  interview_scheduled: 'Interview Booked',
  interview_completed: 'Interview Done',
  vetting_in_progress: 'Vetting in Progress',
  ready_for_contract: 'Ready for Contract',
  contract_sent: 'Contract Sent',
  hired: 'Hiring Complete',
  rejected: 'Rejected'
};

export const requiredPending = (a: Applicant) => a.vettingChecks.filter(c => c.isRequired && c.status === 'pending').length;
export const requiredApproved = (a: Applicant) => a.vettingChecks.filter(c => c.isRequired && c.status === 'approved').length;
export const requiredRejected = (a: Applicant) => a.vettingChecks.filter(c => c.isRequired && c.status === 'rejected').length;
export const requiredTotal = (a: Applicant) => a.vettingChecks.filter(c => c.isRequired).length;

export const initialsOf = (name: string) => name.split(' ').map(p => p[0] || '').slice(0, 2).join('').toUpperCase();

export type ApplicationStageKey = ApplicationStage;

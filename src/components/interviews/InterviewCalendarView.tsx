import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Calendar as CalendarIcon, Clock, User, Star, Plus, Video, MapPin, ShieldCheck } from 'lucide-react';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';

export const InterviewCalendarView: React.FC = () => {
  const { applicants, completeInterview, setSelectedApplicant, isAuditor } = useRecruitment();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Filter applicants with scheduled or completed interviews
  const interviewedApplicants = applicants.filter(a => a.interview);

  const [ratingInput, setRatingInput] = useState<Record<string, number>>({});
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});

  const handleComplete = (applicantId: string, passed: boolean) => {
    if (isAuditor) return;
    const rating = ratingInput[applicantId] || 0;
    const notes = notesInput[applicantId] || '';
    completeInterview(applicantId, notes, rating, passed);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <span>Interview Calendar & Agenda</span>
            {isAuditor && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0F172A] text-amber-400 border border-slate-700 ml-2 shadow-sm">
                READ-ONLY
              </span>
            )}
          </h2>
          <p className="text-xs text-secondary">
            {isAuditor
              ? 'Auditor view: inspect scheduled interview agendas, recruiter notes, and candidate scores.'
              : 'Schedule candidate screening interviews and record assessment ratings'}
          </p>
        </div>

        {!isAuditor && (
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-950/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule New Interview</span>
          </button>
        )}
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviewedApplicants.map(applicant => {
          const interview = applicant.interview!;
          const isCompleted = interview.completed;

          return (
            <div 
              key={applicant.id}
              className={`linear-card p-6 rounded-2xl space-y-4 border ${
                isCompleted ? 'border-line bg-page-dim' : 'border-purple-500/30 bg-purple-950/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-primary text-sm">{applicant.fullName}</h3>
                  <div className="text-xs text-secondary">{applicant.appliedJobTitle}</div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isCompleted 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                }`}>
                  {isCompleted ? 'Completed' : 'Upcoming'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-panel border border-line space-y-2 text-xs">
                <div className="flex items-center justify-between text-primary font-mono">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                    {interview.scheduledDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <Clock className="w-3.5 h-3.5" />
                    {interview.scheduledTime}
                  </span>
                </div>

                <div className="text-secondary flex items-center gap-1.5 text-[11px]">
                  <User className="w-3.5 h-3.5 text-tertiary" />
                  <span>Interviewer: {interview.interviewerName}</span>
                </div>

                <div className="text-secondary flex items-center gap-1.5 text-[11px] truncate">
                  {interview.interviewType === 'video' ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 text-[#AF7C28]" />}
                  <span>{interview.locationOrLink}</span>
                </div>
              </div>

              {/* If completed, show rating & notes */}
              {isCompleted ? (
                <div className="space-y-2 text-xs pt-1 border-t border-line">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < (interview.rating || 0) ? 'fill-amber-400' : 'text-faint'}`} />
                    ))}
                    <span className="ml-1 text-[11px] text-secondary font-mono">({interview.rating}/5)</span>
                  </div>
                  {interview.notes && (
                    <p className="text-[11px] text-secondary italic line-clamp-2 bg-page p-2 rounded border border-line">
                      "{interview.notes}"
                    </p>
                  )}
                  <button
                    onClick={() => setSelectedApplicant(applicant)}
                    className="w-full py-2 rounded-lg bg-panel-2 hover:bg-panel-3 text-primary text-xs font-semibold transition-colors mt-2"
                  >
                    View Candidate Vetting Checks
                  </button>
                </div>
              ) : isAuditor ? (
                <div className="space-y-2 pt-2 border-t border-line text-xs">
                  <div className="text-[11px] text-secondary italic">
                    Interview is currently scheduled. Compliance audit is read-only.
                  </div>
                  <button
                    onClick={() => setSelectedApplicant(applicant)}
                    className="w-full py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition-colors border border-slate-700 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Audit Candidate Vetting File</span>
                  </button>
                </div>
              ) : (
                /* Action controls to mark interview completed */
                <div className="space-y-3 pt-2 border-t border-line text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Score Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRatingInput(prev => ({ ...prev, [applicant.id]: star }))}
                          className={`p-1 rounded ${ (ratingInput[applicant.id] || 0) >= star ? 'text-amber-400' : 'text-faint' }`}
                        >
                          <Star className={`w-4 h-4 ${(ratingInput[applicant.id] || 0) >= star ? 'fill-amber-400' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter interview feedback notes..."
                    value={notesInput[applicant.id] || ''}
                    onChange={e => setNotesInput(prev => ({ ...prev, [applicant.id]: e.target.value }))}
                    className="w-full linear-input rounded-lg p-2 text-xs"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleComplete(applicant.id, true)}
                      className="py-1.5 rounded-lg bg-[#AF7C28] hover:bg-[#c99a3e] text-white font-bold text-xs transition-colors"
                    >
                      Pass & Start Vetting
                    </button>
                    <button
                      onClick={() => handleComplete(applicant.id, false)}
                      className="py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs transition-colors"
                    >
                      Fail / Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ScheduleInterviewModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </div>
  );
};

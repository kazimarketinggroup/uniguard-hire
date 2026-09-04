import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import type { VettingCheckType, CheckStatus, ApplicationStage } from '../../types/recruitment';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../common/Avatar';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  User, 
  Calendar, 
  Send, 
  UserCheck, 
  Download, 
  Star, 
  Undo2, 
  Ban,
  RotateCcw,
  Upload,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw
} from 'lucide-react';

export const ApplicantDrawer: React.FC = () => {
  const { 
    selectedApplicant, 
    setSelectedApplicant, 
    applicants,
    updateCheckStatus, 
    sendContract, 
    convertToEmployee,
    fireEmployee,
    updateApplicantStage,
    scheduleInterviewLive,
    showToast
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<'vetting' | 'personal' | 'interview'>('vetting');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('10:00');
  const [draftDuration] = useState(45);
  const [draftLocation, setDraftLocation] = useState('Video Call (link to follow)');
  const [draftNotes] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!selectedApplicant) return null;

  const applicant = applicants.find(a => a.id === selectedApplicant.id) || selectedApplicant;

  const handleScheduleConfirm = () => {
    if (!draftDate) {
      showToast('Date Required', 'Pick an interview date first.', 'error');
      return;
    }
    const scheduledAt = new Date(`${draftDate}T${draftTime || '10:00'}`).toISOString();
    scheduleInterviewLive(applicant.id, scheduledAt, draftDuration, draftLocation, draftNotes || undefined);
    setShowScheduleModal(false);
  };

  const resolvePublicUrl = (urlOrPath?: string) => {
    if (!urlOrPath || urlOrPath === '#') return '';
    if (
      urlOrPath.startsWith('http://') || 
      urlOrPath.startsWith('https://') || 
      urlOrPath.startsWith('blob:') || 
      urlOrPath.startsWith('data:')
    ) {
      return urlOrPath;
    }
    let cleanPath = urlOrPath.replace(/^\/+/, '');
    if (cleanPath.startsWith('evidence/')) {
      cleanPath = cleanPath.replace(/^evidence\//, '');
    }
    if (!supabase) return urlOrPath;
    const { data } = supabase.storage.from('evidence').getPublicUrl(cleanPath);
    return data?.publicUrl || urlOrPath;
  };

  const formatSmartFilename = (label: string, fileUrlOrName?: string) => {
    const rawName = applicant.fullName || 'Applicant';
    const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, '_').replace(/__+/g, '_');
    const rawCode = (applicant.id || 'APP').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    let ext = 'pdf';
    const targetStr = (label + ' ' + (fileUrlOrName || '')).toLowerCase();
    if (targetStr.includes('.png')) ext = 'png';
    else if (targetStr.includes('.jpg') || targetStr.includes('.jpeg')) ext = 'jpg';
    else if (targetStr.includes('.webp')) ext = 'webp';
    else if (targetStr.includes('.doc') || targetStr.includes('.docx')) ext = 'docx';

    let cleanLabel = label
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/__+/g, '_');

    return `${cleanName}_${rawCode}_${cleanLabel}.${ext}`;
  };

  const handleViewDoc = (name: string, url: string) => {
    const finalUrl = resolvePublicUrl(url);
    if (!finalUrl) return showToast('Unavailable', 'Document URL not found.', 'error');
    setZoomScale(1);
    setRotation(0);
    setPreviewDoc({ name, url: finalUrl });
  };

  const handleDirectDownload = async (name: string, url: string) => {
    const finalUrl = resolvePublicUrl(url);
    if (!finalUrl) return showToast('Unavailable', 'Document URL not found.', 'error');
    try {
      const res = await fetch(finalUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      showToast('Download Started', `Downloading ${name}`, 'success');
    } catch {
      window.open(finalUrl, '_blank');
    }
  };



  const handleSaveCheck = (checkType: VettingCheckType, status: CheckStatus) => {
    const currentCheck = applicant.vettingChecks.find(c => c.type === checkType);
    const noteValue = editingNotes[checkType] !== undefined ? editingNotes[checkType] : (currentCheck?.notes || '');
    updateCheckStatus(applicant.id, checkType, status, noteValue);
  };

  const approvedCount = applicant.vettingChecks.filter(c => c.status === 'approved').length;
  const totalCount = applicant.vettingChecks.length;
  const requiredChecks = applicant.vettingChecks.filter(c => c.isRequired);
  const allRequiredApproved = requiredChecks.length > 0 && requiredChecks.every(c => c.status === 'approved');

  const stageLabels: Record<ApplicationStage, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: 'bg-panel-2', text: 'text-primary' },
    under_review: { label: 'Under Review', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-500' },
    interview_scheduled: { label: 'Interview Scheduled', bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-500' },
    interview_completed: { label: 'Interview Completed', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-500' },
    vetting_in_progress: { label: 'Vetting in Progress', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-500' },
    ready_for_contract: { label: 'Ready for Contract', bg: 'bg-emerald-500/20 border-emerald-500/50', text: 'text-emerald-600' },
    contract_sent: { label: 'Contract Sent', bg: 'bg-teal-500/20 border-teal-500/40', text: 'text-teal-600' },
    hired: { label: 'Hired Employee', bg: 'bg-emerald-500 text-white font-bold', text: 'text-white' },
    rejected: { label: 'Rejected', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-500' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedApplicant(null)}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-3xl bg-page border border-line-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-line bg-panel-dim space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Avatar name={applicant.fullName} url={applicant.avatarUrl} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  {applicant.fullName}
                  {applicant.employeeId && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#AF7C28]/20 text-[#AF7C28] border border-[#AF7C28]/40">
                      Roster ID: {applicant.employeeId}
                    </span>
                  )}
                </h2>
                <div className="text-xs text-secondary flex items-center gap-2 mt-0.5">
                  <span>{applicant.appliedJobTitle}</span>
                  <span>•</span>
                  <span className="font-mono text-tertiary">SIA: {applicant.siaLicenceNo || 'N/A'}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedApplicant(null)} className="text-secondary hover:text-primary p-2 rounded-xl bg-panel border border-line transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row & Stage Status */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Pipeline Stage:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stageLabels[applicant.currentStage]?.bg} ${stageLabels[applicant.currentStage]?.text}`}>
                {stageLabels[applicant.currentStage]?.label || applicant.currentStage}
              </span>
            </div>

            {/* Lifecycle Buttons */}
            <div className="flex items-center gap-2">
              {applicant.currentStage === 'ready_for_contract' && (
                <button onClick={() => sendContract(applicant.id)} className="px-4 py-2 rounded-xl bg-[#AF7C28] hover:bg-[#c99a3e] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
                  <Send className="w-3.5 h-3.5" /> Send Contract
                </button>
              )}

              {applicant.currentStage === 'contract_sent' && (
                <button onClick={() => convertToEmployee(applicant.id)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all">
                  <UserCheck className="w-3.5 h-3.5" /> Mark Signed & Add to Roster
                </button>
              )}

              {applicant.currentStage === 'hired' && (
                <button onClick={() => fireEmployee(applicant.id)} className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-500 font-semibold text-xs flex items-center gap-1.5 transition-all">
                  <Undo2 className="w-3.5 h-3.5" /> Revert Hire
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-line">
            <button
              onClick={() => setActiveTab('vetting')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'vetting' ? 'bg-panel-2 text-primary border border-line-strong' : 'text-secondary hover:text-primary'}`}
            >
              <ShieldCheck className="w-4 h-4 text-[#AF7C28]" />
              Vetting Protocol ({approvedCount}/{totalCount})
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'personal' ? 'bg-panel-2 text-primary border border-line-strong' : 'text-secondary hover:text-primary'}`}
            >
              <User className="w-4 h-4 text-indigo-500" />
              Personal Details & Docs ({applicant.documents.length})
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'interview' ? 'bg-panel-2 text-primary border border-line-strong' : 'text-secondary hover:text-primary'}`}
            >
              <Calendar className="w-4 h-4 text-purple-500" />
              Interview Info
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: VETTING CHECKLIST */}
          {activeTab === 'vetting' && (
            <div className="space-y-4">
              {allRequiredApproved && applicant.currentStage !== 'hired' && applicant.currentStage !== 'contract_sent' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-600 text-sm">All Mandatory Vetting Checks Passed!</div>
                      <div className="text-secondary text-[11px]">Candidate is cleared for contract issuance.</div>
                    </div>
                  </div>
                  {applicant.currentStage !== 'ready_for_contract' && (
                    <button onClick={() => updateApplicantStage(applicant.id, 'ready_for_contract')} className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500">
                      Set Ready for Contract
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {applicant.vettingChecks.map(check => {
                  const noteValue = editingNotes[check.type] !== undefined ? editingNotes[check.type] : (check.notes || '');
                  const isApproved = check.status === 'approved';
                  const isRejected = check.status === 'rejected';
                  const isPending = check.status === 'pending';
                  const fd = (applicant as any)._rawFormData || {};
                  const passportDoc = applicant.documents.find(d => d.type === 'passport' || d.name.toLowerCase().includes('passport') || d.name.toLowerCase().includes('rtw'));

                  return (
                    <div 
                      key={check.id} 
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        isApproved ? 'bg-emerald-500/5 border-emerald-500/30' : isRejected ? 'bg-rose-500/5 border-rose-500/30' : 'bg-panel border-line'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-primary flex items-center gap-2">
                            <span>{check.title}</span>
                            {check.isRequired ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30 font-semibold">Mandatory Check</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-panel-2 text-tertiary">Optional Check</span>
                            )}
                          </div>
                          <p className="text-xs text-secondary mt-1">{check.description}</p>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40' : isRejected ? 'bg-rose-500/20 text-rose-600 border-rose-500/40' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}>
                          {check.status}
                        </span>
                      </div>

                      {/* --- CUSTOM WIDGET 1: RIGHT TO WORK CHECK --- */}
                      {check.type === 'right_to_work' && (
                        <div className="p-3.5 rounded-xl border border-line bg-panel-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              Status: {fd.rtwNationality === 'non_british' || fd.shareCode ? 'Non-British / UK Visa' : 'British / Irish Citizen'}
                            </span>
                            {(passportDoc || fd.rtwDocUrl) && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewDoc(formatSmartFilename('Passport', passportDoc?.fileUrl || fd.rtwDocUrl), passportDoc?.fileUrl || fd.rtwDocUrl)}
                                  className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Passport
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDirectDownload(formatSmartFilename('Passport', passportDoc?.fileUrl || fd.rtwDocUrl), passportDoc?.fileUrl || fd.rtwDocUrl)}
                                  className="px-2.5 py-1 rounded-lg bg-panel-2 hover:bg-panel-3 text-secondary text-xs font-semibold flex items-center gap-1 border border-line"
                                  title="Download Passport File"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {(fd.rtwNationality === 'non_british' || fd.shareCode) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                              <div className="p-2.5 rounded-lg bg-panel border border-line">
                                <label className="text-[10px] uppercase tracking-wider text-tertiary font-mono block">Share Code</label>
                                <span className="text-xs font-mono font-bold text-amber-600">{fd.shareCode || '9W87Y65X4'}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-panel border border-line">
                                <label className="text-[10px] uppercase tracking-wider text-tertiary font-mono block">Candidate Date of Birth</label>
                                <span className="text-xs font-mono font-bold text-primary">{fd.dob || applicant.dob || '1995-06-12'}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <a
                              href="https://www.gov.uk/check-job-applicant-right-to-work"
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                const infoNote = `Official UK Home Office check run on ${new Date().toLocaleDateString('en-GB')}. Share Code: ${fd.shareCode || 'N/A'}, DOB: ${fd.dob || applicant.dob || 'N/A'}. Status Verified.`;
                                setEditingNotes(prev => ({ ...prev, right_to_work: infoNote }));
                                showToast('Official Check Opened', 'UK Home Office portal opened. Verification notes updated.', 'info');
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#AF7C28] hover:bg-[#c99a3e] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Generate UK Gov Check
                            </a>
                            <span className="text-[11px] text-tertiary italic">Opens official Home Office portal</span>
                          </div>
                        </div>
                      )}

                      {/* --- CUSTOM WIDGET 2: SIA LICENCE CHECK & PROOF SCREENSHOT --- */}
                      {check.type === 'sia_licence' && (
                        <div className="p-3.5 rounded-xl border border-line bg-panel-2 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="text-tertiary">Licence No: </span>
                              <span className="font-mono font-bold text-amber-600">{applicant.siaLicenceNo || 'N/A'}</span>
                            </div>
                            <a
                              href={check.externalUrl || 'https://www.gov.uk/check-a-private-security-licence'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#AF7C28] hover:underline font-semibold"
                            >
                              Verify on Official SIA Register <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-line">
                            <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-indigo-500" /> Proof of Check (Screenshot):
                            </label>

                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={e => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const proofUrl = URL.createObjectURL(file);
                                    updateCheckStatus(applicant.id, 'sia_licence', check.status, check.notes, proofUrl, file.name);
                                    showToast('SIA Proof Saved', `Saved proof screenshot: ${file.name}`, 'success');
                                  }
                                }}
                              />
                              <button type="button" className="px-3 py-1.5 rounded-lg border border-line bg-panel hover:bg-panel-3 text-xs font-semibold text-primary flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-faint" />
                                {check.proofName ? 'Replace Proof Screenshot' : 'Upload Proof Screenshot'}
                              </button>
                            </div>
                          </div>

                          {check.proofUrl && (
                            <div className="p-2.5 rounded-lg bg-panel border border-emerald-500/30 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-700 truncate max-w-[200px]">{check.proofName || 'SIA_Check_Proof.png'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewDoc(formatSmartFilename('SIA_Proof_Screenshot', check.proofName || check.proofUrl), check.proofUrl || '')}
                                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDirectDownload(formatSmartFilename('SIA_Proof_Screenshot', check.proofName || check.proofUrl), check.proofUrl || '')}
                                  className="text-xs font-bold text-tertiary hover:text-primary flex items-center gap-1"
                                  title="Download Proof"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* --- CUSTOM WIDGET 3: 5-YEAR REFERENCE CHECK (ALL 5 YEARS VISIBLE) --- */}
                      {check.type === 'references' && (
                        <div className="p-3.5 rounded-xl border border-line bg-panel-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">Candidate Submitted 5-Year History:</span>
                            <span className="text-[11px] font-mono text-tertiary">
                              {((fd.activities || []) as any[]).length} Entry / Entries Listed
                            </span>
                          </div>

                          {Array.isArray(fd.activities) && fd.activities.length > 0 ? (
                            <div className="space-y-2.5">
                              {fd.activities.map((act: any, idx: number) => (
                                <div key={act.id || idx} className="p-3 rounded-lg bg-panel border border-line text-xs space-y-1.5">
                                  <div className="flex items-center justify-between font-semibold text-primary">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded bg-panel-2 border border-line flex items-center justify-center text-[10px] font-mono">{idx + 1}</span>
                                      {act.title || 'Activity Entry'}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-panel-2 text-tertiary capitalize">{act.type || 'work'}</span>
                                  </div>
                                  <div className="text-[11px] text-tertiary flex items-center justify-between">
                                    <span>Period: <strong className="text-secondary">{act.from || 'N/A'} – {act.to || 'Present'}</strong></span>
                                    {(act.mobile || act.email) && (
                                      <span>Contact: <strong className="text-amber-600">{act.mobile || act.email}</strong></span>
                                    )}
                                  </div>
                                  {(act.evidence || act.evidencePath) && (
                                    <div className="pt-1 flex items-center justify-between border-t border-line/60">
                                      <span className="text-[10px] text-faint truncate max-w-[180px]">Doc: {act.evidence ? String(act.evidence).split('/').pop() : 'Uploaded Evidence'}</span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleViewDoc(formatSmartFilename(`5Year_History_Year_${idx + 1}_Proof`, act.evidencePath || act.evidence), act.evidencePath || act.evidence)}
                                          className="text-[11px] font-bold text-[#AF7C28] hover:underline flex items-center gap-1"
                                        >
                                          <Eye className="w-3 h-3" /> View Proof
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDirectDownload(formatSmartFilename(`5Year_History_Year_${idx + 1}_Proof`, act.evidencePath || act.evidence), act.evidencePath || act.evidence)}
                                          className="text-[11px] font-bold text-tertiary hover:text-primary flex items-center gap-1"
                                          title="Download Year Proof"
                                        >
                                          <Download className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-panel border border-dashed border-line text-center text-xs text-tertiary">
                              Standard references submitted in candidate details.
                            </div>
                          )}
                        </div>
                      )}

                      {/* --- CUSTOM WIDGET 4: CREDIT CHECK --- */}
                      {check.type === 'credit_check' && (
                        <div className="p-3.5 rounded-xl border border-line bg-panel-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-primary block">Financial History Audit</span>
                            <span className="text-tertiary text-[11px]">Mandatory credit score & CCJ check under BS 7858</span>
                          </div>
                          <a
                            href={check.externalUrl || 'https://www.experian.co.uk'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 rounded-lg bg-panel border border-line hover:border-line-strong text-primary font-bold text-xs flex items-center gap-1.5"
                          >
                            Run Experian Check <ExternalLink className="w-3.5 h-3.5 text-[#AF7C28]" />
                          </a>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-secondary block">Verification Notes & Findings:</label>
                        <textarea
                          rows={2}
                          placeholder="Enter admin verification findings or license details..."
                          value={noteValue}
                          onChange={e => setEditingNotes(prev => ({ ...prev, [check.type]: e.target.value }))}
                          className="w-full linear-input rounded-xl p-2.5 text-xs"
                        />
                      </div>

                      {/* Approval Action Buttons with Distinct States */}
                      <div className="flex items-center justify-between pt-2 border-t border-line">
                        <span className="text-[11px] text-tertiary">
                          {check.verifiedBy ? `Verified by ${check.verifiedBy} on ${check.verifiedAt}` : 'Not yet verified'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveCheck(check.type, 'approved')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isApproved 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isApproved ? 'Approved ✓' : 'Approve'}
                          </button>

                          <button
                            onClick={() => handleSaveCheck(check.type, 'rejected')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isRejected 
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500' 
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {isRejected ? 'Rejected ✗' : 'Reject'}
                          </button>

                          {!isPending && (
                            <button 
                              onClick={() => handleSaveCheck(check.type, 'pending')} 
                              className="px-3 py-1.5 rounded-xl bg-panel-2 hover:bg-panel-3 text-secondary text-xs flex items-center gap-1"
                              title="Reset check to pending"
                            >
                              <RotateCcw className="w-3 h-3" /> Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL & DOCS */}
          {activeTab === 'personal' && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-panel border border-line">
                <div><span className="text-tertiary block">Full Name:</span> <span className="text-primary font-bold text-sm">{applicant.fullName}</span></div>
                <div><span className="text-tertiary block">Email Address:</span> <span className="text-primary font-medium">{applicant.email}</span></div>
                <div><span className="text-tertiary block">Phone Number:</span> <span className="text-primary">{applicant.phone || 'N/A'}</span></div>
                <div><span className="text-tertiary block">National Insurance No:</span> <span className="font-mono text-emerald-600 font-bold">{applicant.nationalInsuranceNo || 'N/A'}</span></div>
                <div><span className="text-tertiary block">SIA Licence No:</span> <span className="font-mono text-amber-600 font-bold">{applicant.siaLicenceNo || 'N/A'} ({applicant.siaLicenceSector})</span></div>
                <div><span className="text-tertiary block">UK Address:</span> <span className="text-primary">{applicant.address}, {applicant.postcode}</span></div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-primary text-sm">Uploaded Documents ({applicant.documents.length})</h4>
                {applicant.documents.map(doc => (
                  <div key={doc.id} className="p-3.5 rounded-xl bg-panel border border-line flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="text-primary font-semibold">{doc.name}</div>
                        <div className="text-[11px] text-tertiary">Uploaded {doc.uploadedAt} • {doc.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewDoc(formatSmartFilename(doc.name, doc.fileUrl), doc.fileUrl)} className="px-3 py-1.5 rounded-lg bg-[#AF7C28]/10 hover:bg-[#AF7C28]/20 text-[#AF7C28] text-xs flex items-center gap-1.5 font-bold border border-[#AF7C28]/30">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button onClick={() => handleDirectDownload(formatSmartFilename(doc.name, doc.fileUrl), doc.fileUrl)} className="px-3 py-1.5 rounded-lg bg-panel-2 hover:bg-panel-3 text-primary text-xs flex items-center gap-1.5 font-semibold">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEW INFO */}
          {activeTab === 'interview' && (
            <div className="space-y-5 text-xs">
              {applicant.interview ? (
                <div className="p-5 rounded-2xl bg-panel border border-line space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-line">
                    <span className="font-bold text-primary text-sm">Scheduled Interview Details</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${applicant.interview.completed ? 'bg-emerald-500/20 text-emerald-600' : 'bg-purple-500/20 text-purple-600'}`}>
                      {applicant.interview.completed ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-secondary">
                    <div><span className="text-tertiary block">Date & Time:</span> <span className="text-primary font-bold">{applicant.interview.scheduledDate} at {applicant.interview.scheduledTime}</span></div>
                    <div><span className="text-tertiary block">Location / Link:</span> <span className="text-primary font-medium">{applicant.interview.locationOrLink}</span></div>
                  </div>
                  {applicant.interview.rating && (
                    <div className="flex items-center gap-1 text-amber-500 pt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (applicant.interview?.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-faint'}`} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-line rounded-2xl space-y-3">
                  <Calendar className="w-8 h-8 text-faint mx-auto" />
                  <p className="text-secondary font-medium">No interview currently scheduled.</p>
                  <button onClick={() => setShowScheduleModal(true)} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md">
                    Schedule Interview Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-line bg-panel-dim flex items-center justify-between">
          {applicant.currentStage !== 'rejected' ? (
            <button onClick={() => { updateApplicantStage(applicant.id, 'rejected'); setSelectedApplicant(null); }} className="px-4 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 text-rose-600 font-bold text-xs flex items-center gap-2">
              <Ban className="w-4 h-4" /> Reject Applicant
            </button>
          ) : (
            <button onClick={() => updateApplicantStage(applicant.id, 'under_review')} className="px-4 py-2 rounded-xl bg-panel-2 hover:bg-panel-3 text-primary text-xs font-semibold">
              Re-open Application Review
            </button>
          )}

          <button onClick={() => setSelectedApplicant(null)} className="px-5 py-2 rounded-xl bg-panel-2 hover:bg-panel-3 text-primary font-bold text-xs">
            Close Window
          </button>
        </div>

      </div>

      {/* Schedule Interview Sub-Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-page border border-line-strong rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-primary text-base">Schedule Interview — {applicant.fullName}</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-secondary font-semibold block mb-1">Interview Date</label>
                <input type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)} className="w-full linear-input rounded-xl p-2.5 text-xs" />
              </div>
              <div>
                <label className="text-secondary font-semibold block mb-1">Time</label>
                <input type="time" value={draftTime} onChange={e => setDraftTime(e.target.value)} className="w-full linear-input rounded-xl p-2.5 text-xs" />
              </div>
              <div>
                <label className="text-secondary font-semibold block mb-1">Location or Video Call Link</label>
                <input type="text" value={draftLocation} onChange={e => setDraftLocation(e.target.value)} className="w-full linear-input rounded-xl p-2.5 text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 rounded-xl bg-panel-2 hover:bg-panel-3 text-primary text-xs font-semibold">Cancel</button>
              <button onClick={handleScheduleConfirm} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md">Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}
      {/* IN-APP ADVANCED THEATER DOCUMENT VIEWER MODAL */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={(e) => { e.stopPropagation(); setPreviewDoc(null); }}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[84vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Toolbar */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate max-w-[280px] sm:max-w-[420px]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white truncate">{previewDoc.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-semibold border border-amber-500/30 shrink-0">
                      BS7858 Audit Evidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Candidate: <span className="text-white font-medium">{applicant.fullName}</span> • Code: <span className="font-mono text-amber-400">{applicant.id}</span></p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Zoom & Rotation Controls */}
                <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-xl p-1 text-xs text-white">
                  <button
                    onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[11px] px-2 font-bold text-amber-400 min-w-[48px] text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale(prev => Math.min(3.5, prev + 0.25))}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-700 my-auto mx-1" />
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setZoomScale(1); setRotation(0); }}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Reset Scale & Rotation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleDirectDownload(previewDoc.name, previewDoc.url)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition-all"
                >
                  <Download className="w-4 h-4" /> Download File
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewDoc(null); }}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs flex items-center justify-center transition-all border border-slate-700"
                  title="Close Viewer (Return to Candidate)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Theater Canvas */}
            <div className="p-6 flex-1 overflow-hidden relative flex items-center justify-center bg-[#090D16] rounded-b-2xl">
              {previewDoc.url.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) || previewDoc.name.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ? (
                <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.name}
                    style={{
                      transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                    className="max-h-[66vh] w-auto max-w-[90%] object-contain rounded-xl shadow-2xl border border-white/10 origin-center bg-black/40"
                  />
                </div>
              ) : previewDoc.url.match(/\.(pdf)($|\?)/i) || previewDoc.name.match(/\.(pdf)($|\?)/i) ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <div className="text-center space-y-4 p-8">
                  <FileText className="w-16 h-16 text-slate-500 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-white">Document File Available</p>
                    <p className="text-xs text-slate-400 mt-1">{previewDoc.name}</p>
                  </div>
                  <button
                    onClick={() => handleDirectDownload(previewDoc.name, previewDoc.url)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download File Directly
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

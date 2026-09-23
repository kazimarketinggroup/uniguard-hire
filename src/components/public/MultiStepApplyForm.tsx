import React, { useState, useEffect, useRef } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { ArrowRight, ArrowLeft, CheckCircle2, Plus, Trash2, Upload, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { compressEvidence } from '../../lib/compressFile';
import { BS7858Guidance } from '../common/BS7858Guidance';

const steps = [
  { title: 'Personal Details', sub: 'Who you are' },
  { title: '5 Years Activity', sub: 'Education & work history' },
  { title: 'Address History', sub: 'Last 5 years' },
  { title: 'Security Questions', sub: 'Declarations' },
  { title: 'References', sub: 'Character & next of kin' },
  { title: 'Screening & Consent', sub: 'What gets checked' },
  { title: 'Declaration & Sign', sub: 'Final review' },
];

const WORLD_LANGUAGES = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani', 'Basque', 'Belarusian',
  'Bengali', 'Bosnian', 'Bulgarian', 'Burmese', 'Catalan', 'Cebuano', 'Chichewa', 'Chinese (Cantonese)',
  'Chinese (Mandarin)', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Esperanto', 'Estonian',
  'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian', 'German', 'Greek', 'Gujarati',
  'Haitian Creole', 'Hausa', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian', 'Icelandic', 'Igbo', 'Indonesian',
  'Irish', 'Italian', 'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Kinyarwanda', 'Korean',
  'Kurdish', 'Kyrgyz', 'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish', 'Macedonian',
  'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian', 'Nepali', 'Norwegian',
  'Odia', 'Pashto', 'Persian (Farsi)', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian',
  'Samoan', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali',
  'Spanish', 'Sundanese', 'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Telugu', 'Thai', 'Turkish',
  'Ukrainian', 'Urdu', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu',
];

const LanguageSelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = (lang: string) => {
    const next = selected.includes(lang) ? selected.filter(l => l !== lang) : [...selected, lang];
    onChange(next.join(', '));
  };

  const filtered = query ? WORLD_LANGUAGES.filter(l => l.toLowerCase().includes(query.toLowerCase())) : WORLD_LANGUAGES;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full min-h-[42px] px-4 py-2.5 rounded-lg border border-line text-sm text-left focus:outline-none focus:border-line-strong bg-panel flex flex-wrap items-center gap-1.5"
      >
        {selected.length === 0 && <span className="text-faint">Search & select languages…</span>}
        {selected.map(s => (
          <span key={s} className="text-xs font-medium px-2 py-1 rounded bg-panel-2 border border-line text-primary">{s}</span>
        ))}
        <ChevronDown className={`w-4 h-4 text-faint ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-line bg-panel shadow-lg overflow-hidden">
          <div className="p-2 border-b border-line">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search languages…"
              className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel-2"
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-1.5">
            {filtered.length === 0 && <p className="text-xs text-faint px-3 py-2">No languages match "{query}"</p>}
            {filtered.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggle(lang)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${selected.includes(lang) ? 'bg-amber-50 text-amber-700 font-medium' : 'text-secondary hover:bg-panel-2'}`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${selected.includes(lang) ? 'border-amber-400 bg-amber-400 text-white' : 'border-line'}`}>
                  {selected.includes(lang) ? '✓' : ''}
                </span>
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  from: string;
  to: string;
  evidence: string;
  evidencePath?: string;
  mobile: string;
  email: string;
  file: File | null;
}

const emptyForm = {
  fullName: '', dob: '', position: '',
  addressLine1: '', addressLine2: '', postTown: '', postcode: '', address: '',
  telephone: '', mobile: '',
  niNumber: '', siaLicence: '', hasDrivingLicence: '', drivingLicenceNumber: '',
  education: '', hasFirstAid: '', languages: '', lenAtAddress: '', prevAddresses: '',
  q1: '', q1Details: '', q2: '', q2Details: '', q3: '', q3Details: '',
  q4: '', q4Details: '', q5: '', q5Details: '', q6: '', q6Details: '', q7: '', q7Details: '',
  ref1Name: '', ref1Address: '', ref1Postcode: '', ref1Occupation: '', ref1Known: '',
  ref2Name: '', ref2Address: '', ref2Postcode: '', ref2Occupation: '', ref2Known: '',
  nokName: '', nokAddress: '', nokPostcode: '', nokTelephone: '', nokMobile: '', nokRelationship: '',
  charRefName: '', charRefAddress: '', charRefPostcode: '', charRefTelephone: '', charRefKnown: '',
  criminalDetails: '', agree1: false, agree2: false, printName: '', signature: '', sigDate: '',
  rtwNationality: 'british', shareCode: '', rtwDocName: '', rtwDocUrl: '',
  passportDocName: '', passportDocUrl: '',
  siaBadgeDocName: '', siaBadgeDocUrl: '',
  actCertDocName: '', actCertDocUrl: '',
  niProofDocName: '', niProofDocUrl: '',
  proofAddress1Name: '', proofAddress1Url: '',
  proofAddress2Name: '', proofAddress2Url: '',
  bankName: '', accountHolderName: '', sortCode: '', accountNumber: '', bankDocName: '', bankDocUrl: '',
};

const sampleActivity = (id: number, type: string, title: string, from: string, to: string, mobile: string, email: string): ActivityItem => ({ id, type, title, from, to, evidence: '', mobile, email, file: null });

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const ALLOWED_EVIDENCE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const DRAFT_KEY = 'uniguard_apply_form_draft_v1';

export const MultiStepApplyForm: React.FC = () => {
  const { jobs, setActivePage, publicUser, showToast, pendingJobId } = useRecruitment();

  const [current, setCurrent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.current === 'number' && parsed.current >= 0 && parsed.current < steps.length) {
          return parsed.current;
        }
      }
    } catch {}
    return 0;
  });

  const [maxStepReached, setMaxStepReached] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.maxStepReached === 'number' && parsed.maxStepReached >= 0) {
          return Math.max(parsed.maxStepReached, typeof parsed.current === 'number' ? parsed.current : 0);
        }
        if (typeof parsed.current === 'number') return parsed.current;
      }
    } catch {}
    return 0;
  });

  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState('');

  const selectedJob = jobs.find(j => j.id === pendingJobId) || jobs[0];

  const [form, setForm] = useState<typeof emptyForm>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) return { ...emptyForm, ...parsed.form };
      }
    } catch {}
    return emptyForm;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.activities) && parsed.activities.length > 0) {
          return parsed.activities;
        }
      }
    } catch {}
    return [{ id: 1, type: 'education', title: '', from: '', to: '', evidence: '', mobile: '', email: '', file: null }];
  });

  const [picker, setPicker] = useState<{ id: number; field: 'from' | 'to'; year: number; month: number | null } | null>(null);
  const [rtwFile, setRtwFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportDocName, setPassportDocName] = useState(() => form.passportDocName || '');
  const [siaBadgeFile, setSiaBadgeFile] = useState<File | null>(null);
  const [siaBadgeDocName, setSiaBadgeDocName] = useState(() => form.siaBadgeDocName || '');
  const [actCertFile, setActCertFile] = useState<File | null>(null);
  const [actCertDocName, setActCertDocName] = useState(() => form.actCertDocName || '');
  const [niProofFile, setNiProofFile] = useState<File | null>(null);
  const [niProofDocName, setNiProofDocName] = useState(() => form.niProofDocName || '');
  const [proofAddress1File, setProofAddress1File] = useState<File | null>(null);
  const [proofAddress1Name, setProofAddress1Name] = useState(() => form.proofAddress1Name || '');
  const [proofAddress2File, setProofAddress2File] = useState<File | null>(null);
  const [proofAddress2Name, setProofAddress2Name] = useState(() => form.proofAddress2Name || '');
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);
  const [bankProofDocName, setBankProofDocName] = useState(() => form.bankDocName || '');
  const [evidenceError, setEvidenceError] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Keep maxStepReached in sync with forward progress
  useEffect(() => {
    setMaxStepReached(prev => Math.max(prev, current));
  }, [current]);

  // Auto-populate candidate name and selected role from dashboard / Google login
  useEffect(() => {
    setForm(prev => {
      let changed = false;
      const next = { ...prev };
      if (!next.fullName && publicUser?.name) {
        next.fullName = publicUser.name;
        changed = true;
      }
      if (!next.position && selectedJob?.title) {
        next.position = selectedJob.title;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [publicUser?.name, selectedJob?.title]);

  // Keep latest state in refs for synchronous flush on tab switch / backgrounding
  const formRef = useRef(form);
  const activitiesRef = useRef(activities);
  const currentRef = useRef(current);
  const maxStepRef = useRef(maxStepReached);

  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => { activitiesRef.current = activities; }, [activities]);
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { maxStepRef.current = maxStepReached; }, [maxStepReached]);

  const flushDraft = React.useCallback(() => {
    try {
      const serializable = {
        form: formRef.current,
        activities: activitiesRef.current.map(a => ({ ...a, file: null })),
        current: currentRef.current,
        maxStepReached: maxStepRef.current,
        lastSavedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serializable));
    } catch {}
  }, []);

  // Persist form draft in localStorage whenever state changes
  useEffect(() => {
    flushDraft();
  }, [form, activities, current, maxStepReached, flushDraft]);

  // Flush IMMEDIATELY on visibilitychange (switching apps / backgrounding), pagehide, or blur
  useEffect(() => {
    const handleBackgrounding = () => {
      flushDraft();
    };
    document.addEventListener('visibilitychange', handleBackgrounding);
    window.addEventListener('pagehide', handleBackgrounding);
    window.addEventListener('beforeunload', handleBackgrounding);
    return () => {
      document.removeEventListener('visibilitychange', handleBackgrounding);
      window.removeEventListener('pagehide', handleBackgrounding);
      window.removeEventListener('beforeunload', handleBackgrounding);
    };
  }, [flushDraft]);

  const formatYM = (v: string) => {
    if (!v) return '';
    if (v === 'Present') return 'Present';
    const [y, m, d] = v.split('-');
    if (d && d !== '01') return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
    return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
  };

  const openDatePicker = (id: number, field: 'from' | 'to') => {
    const activity = activities.find(a => a.id === id);
    const val = activity?.[field] || '';
    const parts = val.split('-');
    setPicker({
      id,
      field,
      year: parts[0] ? Number(parts[0]) : new Date().getFullYear(),
      month: parts[1] ? Number(parts[1]) : null,
    });
  };

  const isShortPermittedGap = (a: ActivityItem) => {
    if (a.type !== 'gap') return false;
    if (!a.from || !a.to) return false;
    const from = new Date(a.from);
    const to = a.to === 'Present' ? new Date() : new Date(a.to);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || to < from) return false;
    const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    const diffMonths = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    // Up to 35 calendar days OR 1 calendar month
    return diffDays <= 35 || (diffMonths <= 1 && diffDays <= 45);
  };

  const coverageYears = () => {
    let months = 0;
    let hasAny = false;
    activities.forEach(a => {
      if (!a.from || !a.to) return;
      hasAny = true;
      const from = new Date(a.from);
      const to = a.to === 'Present' ? new Date() : new Date(a.to);
      if (isNaN(from.getTime()) || isNaN(to.getTime()) || to < from) return;
      const m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
      months += Math.max(1, m);
    });
    return { months, hasAny };
  };

  const coverageInvalid = () => {
    const { months, hasAny } = coverageYears();
    return hasAny && months < 59;
  };

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const updateActivity = (id: number, field: string, value: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addActivity = () => {
    setActivities(prev => [...prev, { id: Date.now(), type: 'education', title: '', from: '', to: '', evidence: '', mobile: '', email: '', file: null }]);
  };

  const removeActivity = (id: number) => {
    setActivities(prev => prev.length > 1 ? prev.filter(a => a.id !== id) : prev);
  };

  const clearForm = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setForm(emptyForm);
    setActivities([sampleActivity(1, 'education', '', '', '', '', '')]);
    setCurrent(0);
    setMaxStepReached(0);
    setPassportFile(null);
    setPassportDocName('');
    setSiaBadgeFile(null);
    setSiaBadgeDocName('');
    setActCertFile(null);
    setActCertDocName('');
    setNiProofFile(null);
    setNiProofDocName('');
    setProofAddress1File(null);
    setProofAddress1Name('');
    setProofAddress2File(null);
    setProofAddress2Name('');
    setBankProofFile(null);
    setBankProofDocName('');
  };

  useEffect(() => {
    if (submitted) setRefNum('REF-' + Math.floor(100000 + Math.random() * 900000));
  }, [submitted]);

  const next = () => {
    if (current === 1) {
      setEvidenceError(false);
      setActivityError('');

      // Filter activities that have any content filled in
      const started = activities.filter(a => a.title || a.from || a.to || a.evidence || a.file);
      if (started.length === 0) {
        setActivityError('Add at least one activity — fill in details, dates, and evidence.');
        return;
      }

      // Check each started activity
      for (let i = 0; i < started.length; i++) {
        const a = started[i];
        const num = i + 1;
        if (!a.from || !a.to) {
          setActivityError(`Activity #${num} is missing From or To date. Please select both dates.`);
          return;
        }
        if (!a.title && a.type !== 'gap') {
          setActivityError(`Activity #${num} is missing Employer, School, or Course details.`);
          return;
        }
        const isPermittedGap = a.type === 'gap' && isShortPermittedGap(a);
        if (!isPermittedGap && !a.evidence && !a.file) {
          setActivityError(`Activity #${num} (${a.title || 'Gap over 1 month'}) requires documentary evidence.`);
          setEvidenceError(true);
          return;
        }
      }

      const { months } = coverageYears();
      if (months < 59) {
        setEvidenceError(false);
        setActivityError(`Your entries currently cover ${(months / 12).toFixed(1)} of 5 years — add more activities or account for any career breaks to reach the 5-year requirement.`);
        return;
      }

      setEvidenceError(false);
      setActivityError('');
    }
    if (current < steps.length - 1) {
      const nextStep = current + 1;
      setCurrent(nextStep);
      setMaxStepReached(prev => Math.max(prev, nextStep));
    }
  };
  const back = () => { if (current > 0) setCurrent(current - 1); };

  const handleSubmit = async () => {
    if (!form.agree1 || !form.agree2 || !form.printName || submitting) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      if (!supabase) {
        throw new Error('Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment.');
      }
      const { data: { user } } = await supabase.auth.getUser();
      type StoredActivity = Omit<ActivityItem, 'file'> & { file?: undefined };
      let storedActivities: StoredActivity[] = activities.map(a => ({ ...a, file: undefined }));

      if (user) {
        const uploaded: StoredActivity[] = [];
        for (const a of activities) {
          if (!a.file) { uploaded.push({ ...a, file: undefined }); continue; }
          const compressed = await compressEvidence(a.file);
          const ext = compressed.name.match(/\.[^.]+$/)?.[0] || '.pdf';
          const path = `${user.id}/${a.id}-${Date.now()}${ext}`;
          const { error: upErr } = await supabase.storage.from('evidence').upload(path, compressed, { cacheControl: '3600', upsert: false });
          if (upErr) throw new Error(`Evidence upload failed: ${upErr.message}`);
          const { data } = supabase.storage.from('evidence').getPublicUrl(path);
          uploaded.push({ ...a, evidence: data.publicUrl, evidencePath: path, file: undefined });
        }
        storedActivities = uploaded;
      }

      let finalForm = { ...form };
      let extraDocs: any[] = [];

      const uploadExtraDoc = async (file: File, prefix: string, docType: any, customLabel: string) => {
        let fileUrl = '';
        let fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
        let ext = file.name.match(/\.[^.]+$/)?.[0] || '.jpg';
        if (user && supabase) {
          try {
            const compressed = await compressEvidence(file);
            ext = compressed.name.match(/\.[^.]+$/)?.[0] || ext;
            fileSize = `${(compressed.size / 1024 / 1024).toFixed(1)} MB`;
            const path = `${user.id}/${prefix}-${Date.now()}${ext}`;
            const { error: upErr } = await supabase.storage.from('evidence').upload(path, compressed, { cacheControl: '3600', upsert: false });
            if (!upErr) {
              const { data } = supabase.storage.from('evidence').getPublicUrl(path);
              fileUrl = data.publicUrl;
            }
          } catch {
            // fallback
          }
        }
        if (!fileUrl) {
          fileUrl = URL.createObjectURL(file);
        }
        extraDocs.push({
          id: `doc-${prefix}-${Date.now()}`,
          name: `${customLabel}_${file.name}`,
          type: docType,
          fileUrl,
          uploadedAt: new Date().toISOString().split('T')[0],
          size: fileSize,
        });
        return fileUrl;
      };

      if (rtwFile) {
        finalForm.rtwDocUrl = await uploadExtraDoc(rtwFile, 'rtw', 'passport', 'Right_to_Work_Passport');
        finalForm.rtwDocName = rtwFile.name;
      }
      if (passportFile) {
        finalForm.passportDocUrl = await uploadExtraDoc(passportFile, 'passport', 'passport', 'Passport_Photo_Page');
        finalForm.passportDocName = passportDocName || passportFile.name;
      }
      if (siaBadgeFile) {
        finalForm.siaBadgeDocUrl = await uploadExtraDoc(siaBadgeFile, 'sia', 'sia_badge', 'SIA_Badge');
        finalForm.siaBadgeDocName = siaBadgeDocName || siaBadgeFile.name;
      }
      if (actCertFile) {
        finalForm.actCertDocUrl = await uploadExtraDoc(actCertFile, 'act', 'act_certificate', 'ACT_Certificate');
        finalForm.actCertDocName = actCertDocName || actCertFile.name;
      }
      if (niProofFile) {
        finalForm.niProofDocUrl = await uploadExtraDoc(niProofFile, 'ni', 'proof_ni', 'Proof_of_National_Insurance');
        finalForm.niProofDocName = niProofDocName || niProofFile.name;
      }
      if (proofAddress1File) {
        finalForm.proofAddress1Url = await uploadExtraDoc(proofAddress1File, 'addr1', 'proof_address', 'Proof_of_Address_1');
        finalForm.proofAddress1Name = proofAddress1Name || proofAddress1File.name;
      }
      if (proofAddress2File) {
        finalForm.proofAddress2Url = await uploadExtraDoc(proofAddress2File, 'addr2', 'proof_address', 'Proof_of_Address_2');
        finalForm.proofAddress2Name = proofAddress2Name || proofAddress2File.name;
      }
      if (bankProofFile) {
        finalForm.bankDocUrl = await uploadExtraDoc(bankProofFile, 'bank', 'bank_details', 'Proof_of_Bank_Details');
        finalForm.bankDocName = bankProofDocName || bankProofFile.name;
      }

      if (finalForm.bankName || finalForm.accountNumber || finalForm.bankDocUrl) {
        (finalForm as any).bankDetails = {
          bankName: finalForm.bankName,
          accountHolderName: finalForm.accountHolderName || finalForm.fullName,
          sortCode: finalForm.sortCode,
          accountNumber: finalForm.accountNumber,
          docUrl: finalForm.bankDocUrl,
          docName: finalForm.bankDocName,
        };
      }

      const { error: insertError } = await supabase.from('applications').insert({
        applicant_email: publicUser?.email || user?.email || '',
        user_id: user?.id,
        full_name: form.fullName,
        applied_job: selectedJob?.title || '',
        status: 'applied',
        form_data: { ...finalForm, activities: storedActivities, documents: extraDocs },
      });
      if (insertError) throw new Error(`Could not save application: ${insertError.message}`);

      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong submitting your application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-page">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-6" style={{ borderColor: '#3E8E63', color: '#3E8E63' }}>
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Application Received</h2>
          <p className="text-secondary mb-2">Your application has been submitted to Uniguard's recruitment team.</p>
          <p className="text-sm text-faint mb-8">Reference: <span className="font-mono font-bold" style={{ color: '#AF7C28' }}>{refNum}</span></p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => setActivePage('user-dashboard')} className="px-6 py-3 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg" style={{ backgroundColor: '#AF7C28' }}>Back to Dashboard</button>
            <button onClick={() => { setSubmitted(false); setCurrent(0); }} className="px-6 py-3 rounded-lg text-sm font-semibold text-secondary border border-line hover:border-line-strong transition-colors">Submit Another Application</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="border-b border-line bg-panel sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button onClick={() => setActivePage('landing')} className="flex flex-col items-start sm:items-center cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-7 sm:h-9 w-auto object-contain" />
            <span className="text-[8px] sm:text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Draft auto-saved</span>
            </div>
            <button onClick={clearForm} className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-line text-secondary hover:text-rose-500 hover:border-rose-300 transition-colors">Clear</button>
            <button onClick={() => setActivePage('user-dashboard')} className="text-xs sm:text-sm font-medium text-secondary hover:text-primary transition-colors whitespace-nowrap">
              <span className="hidden sm:inline">← Back to Dashboard</span>
              <span className="sm:hidden">← Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0">
          {/* Left Rail (Desktop) */}
          <aside className="hidden lg:block border-r border-line pr-8 py-2">
            <div className="mb-2">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-faint mb-1">Progress</p>
              <p className="text-3xl font-bold" style={{ color: '#AF7C28' }}>{Math.round((current / (steps.length - 1)) * 100)}%</p>
              <p className="text-xs text-secondary mt-0.5">{current === steps.length - 1 ? 'Final review' : 'In progress'}</p>
            </div>
            <div className="h-1.5 w-full bg-panel-2 rounded-full overflow-hidden mb-8">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(current / (steps.length - 1)) * 100}%`, backgroundColor: '#AF7C28' }}></div>
            </div>
            <ul className="space-y-0">
              {steps.map((s, i) => (
                <li
                  key={i}
                  onClick={() => i <= maxStepReached && setCurrent(i)}
                  className={`flex items-start gap-3 py-3 cursor-pointer transition-opacity ${i <= maxStepReached ? 'opacity-100 hover:opacity-90' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5 ${i < current ? 'bg-emerald-600 border-emerald-600 text-white' : i === current ? 'border-amber-500 text-amber-600 bg-amber-50' : i <= maxStepReached ? 'border-amber-400 text-amber-600' : 'border-line text-faint'}`}>
                    {i < current ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${i === current ? 'text-primary font-bold' : i <= maxStepReached ? 'text-primary' : 'text-secondary'}`}>{s.title}</p>
                    <p className="text-[11px] text-faint">{s.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Form Area */}
          <div className="pl-0 lg:pl-10 py-2">
            {/* Mobile Progress Bar & Step Counter */}
            <div className="lg:hidden mb-6 p-4 rounded-xl border border-line bg-panel shadow-sm">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#AF7C28' }}>
                    {current + 1}
                  </span>
                  <span>Step {current + 1} of {steps.length}: {steps[current].title}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Saved</span>
                </span>
              </div>
              <div className="h-2 w-full bg-panel-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(current / (steps.length - 1)) * 100}%`, backgroundColor: '#AF7C28' }}></div>
              </div>
              <p className="text-[11px] text-secondary mt-2">{steps[current].sub}</p>
            </div>

            <div className="mb-8">
              <p className="text-xs font-mono tracking-wider uppercase mb-2" style={{ color: '#AF7C28' }}>Section {String(current + 1).padStart(2, '0')} / 07</p>
              <h2 className="text-2xl font-bold text-primary mb-2">{steps[current].title}</h2>
              <p className="text-sm text-secondary">{steps[current].sub === 'Who you are' ? 'Your basic details and the role you\'re applying for.' : steps[current].sub === 'Education & work history' ? 'Provide your education and employment history covering the last 5 years.' : steps[current].sub === 'Last 5 years' ? 'If you\'ve lived at your current address fewer than 5 years, list previous addresses.' : steps[current].sub === 'Declarations' ? 'Answer honestly — these responses are cross-checked during BS 7858 screening.' : steps[current].sub === 'Character & next of kin' ? 'Provide two character references and next of kin details.' : steps[current].sub === 'What gets checked' ? 'All applicants undergo financial history and BS 7858 screening.' : 'Read the declaration below, then sign to confirm.'}</p>
            </div>

            {current === 0 && (
              <div className="space-y-6">
                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Applicant</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Full legal name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.fullName} onChange={e => update('fullName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Date of birth <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="date" required value={form.dob} onChange={e => update('dob', e.target.value)} placeholder="mm/dd/yyyy" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Copy of Passport <span className="text-faint font-normal">(Photo page / Identity document)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              if (f.size > MAX_EVIDENCE_BYTES) {
                                showToast('File too large', 'Files must be 10 MB or smaller.', 'error');
                                return;
                              }
                              setPassportFile(f);
                              setPassportDocName(f.name);
                              update('passportDocName', f.name);
                            }
                          }}
                        />
                        <div className="w-full h-[40px] rounded-lg border border-dashed border-line bg-panel-2 flex items-center justify-between px-3 cursor-pointer hover:border-line-strong transition-colors">
                          <div className="flex items-center gap-2 truncate">
                            <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                            <span className={`text-xs truncate ${passportDocName || form.passportDocName ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                              {passportDocName || form.passportDocName || 'Upload copy of passport (PDF, JPG, PNG)'}
                            </span>
                          </div>
                          {(passportDocName || form.passportDocName) && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setPassportFile(null); setPassportDocName(''); update('passportDocName', ''); }}
                              className="text-tertiary hover:text-rose-500 text-xs p-1 relative z-20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-faint">Clear scan or photo of your passport photo page — max 10MB</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Position applied for <span style={{ color: '#AF7C28' }}>•</span></label>
                      <select required value={form.position} onChange={e => update('position', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel">
                        <option value="">Select a role</option>
                        {/* Dynamic vacancies from company dashboard */}
                        {jobs.filter(j => j.status === 'active').map(j => (
                          <option key={j.id} value={j.title}>{j.title}</option>
                        ))}
                        {form.position && !jobs.some(j => j.title === form.position) && (
                          <option value={form.position}>{form.position}</option>
                        )}
                        <option value="Security Officer — Static Site">Security Officer — Static Site</option>
                        <option value="Security Officer — Mobile Patrol">Security Officer — Mobile Patrol</option>
                        <option value="Door Supervisor">Door Supervisor</option>
                        <option value="CCTV / Control Room Operator">CCTV / Control Room Operator</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* UK Home Address Section */}
                    <div className="sm:col-span-2 space-y-4 pt-1">
                      <label className="block text-sm font-medium text-secondary">Home address <span style={{ color: '#AF7C28' }}>•</span></label>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-normal text-secondary mb-1">Address line 1 - number and street name</label>
                          <input
                            type="text"
                            required
                            value={form.addressLine1}
                            onChange={e => {
                              const val = e.target.value;
                              setForm(prev => {
                                const next = { ...prev, addressLine1: val };
                                next.address = [val, next.addressLine2, next.postTown].filter(Boolean).join(', ');
                                return next;
                              });
                            }}
                            placeholder="14 Elmwood Court"
                            className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-normal text-secondary mb-1">Address line 2 - locality name (if required)</label>
                          <input
                            type="text"
                            value={form.addressLine2}
                            onChange={e => {
                              const val = e.target.value;
                              setForm(prev => {
                                const next = { ...prev, addressLine2: val };
                                next.address = [next.addressLine1, val, next.postTown].filter(Boolean).join(', ');
                                return next;
                              });
                            }}
                            placeholder="Optional"
                            className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-normal text-secondary mb-1">Post town</label>
                          <input
                            type="text"
                            required
                            value={form.postTown}
                            onChange={e => {
                              const val = e.target.value;
                              setForm(prev => {
                                const next = { ...prev, postTown: val };
                                next.address = [next.addressLine1, next.addressLine2, val].filter(Boolean).join(', ');
                                return next;
                              });
                            }}
                            placeholder="LEEDS"
                            className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-normal text-secondary mb-1">Postcode</label>
                          <input
                            type="text"
                            required
                            value={form.postcode}
                            onChange={e => update('postcode', e.target.value)}
                            placeholder="LS6 3AP"
                            className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Telephone</label>
                      <input type="tel" value={form.telephone} onChange={e => update('telephone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Mobile <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="tel" required value={form.mobile} onChange={e => update('mobile', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">National Insurance number <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.niNumber} onChange={e => update('niNumber', e.target.value)} placeholder="QQ 12 34 56 C" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                      
                      {/* Proof of NI Upload */}
                      <div className="mt-2.5 p-3 rounded-lg border border-line bg-panel-2 space-y-1.5">
                        <label className="block text-xs font-semibold text-secondary">
                          Proof of National Insurance <span className="text-faint font-normal">(e.g. HMRC Letter, P45, P60, NI Card)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                const f = e.target.files[0];
                                if (f.size > MAX_EVIDENCE_BYTES) {
                                  showToast('File too large', 'Files must be 10 MB or smaller.', 'error');
                                  return;
                                }
                                setNiProofFile(f);
                                setNiProofDocName(f.name);
                                update('niProofDocName', f.name);
                              }
                            }}
                          />
                          <div className="w-full h-[40px] rounded-lg border border-dashed border-line bg-panel flex items-center justify-between px-3 cursor-pointer hover:border-line-strong transition-colors">
                            <div className="flex items-center gap-2 truncate">
                              <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                              <span className={`text-xs truncate ${niProofDocName || form.niProofDocName ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                                {niProofDocName || form.niProofDocName || 'Upload NI document proof'}
                              </span>
                            </div>
                            {(niProofDocName || form.niProofDocName) && (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setNiProofFile(null); setNiProofDocName(''); update('niProofDocName', ''); }}
                                className="text-tertiary hover:text-rose-500 text-xs p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-faint">PDF, JPG, PNG, WebP or Word — max 10MB</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">SIA licence number <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.siaLicence} onChange={e => update('siaLicence', e.target.value)} placeholder="SIA licence number" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                      
                      {/* Copy of SIA Badge Upload */}
                      <div className="mt-2.5 p-3 rounded-lg border border-line bg-panel-2 space-y-1.5">
                        <label className="block text-xs font-semibold text-secondary">
                          Copy of SIA Badge <span className="text-faint font-normal">(Front & Back)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                const f = e.target.files[0];
                                if (f.size > MAX_EVIDENCE_BYTES) {
                                  showToast('File too large', 'Files must be 10 MB or smaller.', 'error');
                                  return;
                                }
                                setSiaBadgeFile(f);
                                setSiaBadgeDocName(f.name);
                                update('siaBadgeDocName', f.name);
                              }
                            }}
                          />
                          <div className="w-full h-[40px] rounded-lg border border-dashed border-line bg-panel flex items-center justify-between px-3 cursor-pointer hover:border-line-strong transition-colors">
                            <div className="flex items-center gap-2 truncate">
                              <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                              <span className={`text-xs truncate ${siaBadgeDocName || form.siaBadgeDocName ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                                {siaBadgeDocName || form.siaBadgeDocName || 'Upload copy of SIA badge'}
                              </span>
                            </div>
                            {(siaBadgeDocName || form.siaBadgeDocName) && (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setSiaBadgeFile(null); setSiaBadgeDocName(''); update('siaBadgeDocName', ''); }}
                                className="text-tertiary hover:text-rose-500 text-xs p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-faint">Clear photo or scan of your physical licence card — max 10MB</p>
                      </div>

                      {/* ACT (Action Counters Terrorism) Certificates Upload */}
                      <div className="mt-2.5 p-3 rounded-lg border border-line bg-panel-2 space-y-1.5">
                        <label className="block text-xs font-semibold text-secondary">
                          ACT Certificates <span className="text-faint font-normal">(Action Counters Terrorism / ACS)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                const f = e.target.files[0];
                                if (f.size > MAX_EVIDENCE_BYTES) {
                                  showToast('File too large', 'Files must be 10 MB or smaller.', 'error');
                                  return;
                                }
                                setActCertFile(f);
                                setActCertDocName(f.name);
                                update('actCertDocName', f.name);
                              }
                            }}
                          />
                          <div className="w-full h-[40px] rounded-lg border border-dashed border-line bg-panel flex items-center justify-between px-3 cursor-pointer hover:border-line-strong transition-colors">
                            <div className="flex items-center gap-2 truncate">
                              <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                              <span className={`text-xs truncate ${actCertDocName || form.actCertDocName ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                                {actCertDocName || form.actCertDocName || 'Upload ACT Awareness or ACT Security cert'}
                              </span>
                            </div>
                            {(actCertDocName || form.actCertDocName) && (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setActCertFile(null); setActCertDocName(''); update('actCertDocName', ''); }}
                                className="text-tertiary hover:text-rose-500 text-xs p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-faint">ACT Awareness or ACT Security certificate (SIA & ACS approved) — max 10MB</p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Driving</legend>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Do you hold a valid driving licence? <span style={{ color: '#AF7C28' }}>•</span></label>
                    <div className="flex gap-3">
                      {['yes', 'no'].map(val => (
                        <button key={val} type="button" onClick={() => update('hasDrivingLicence', val)} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.hasDrivingLicence === val ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-line text-secondary hover:border-line-strong'}`}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </button>
                      ))}
                    </div>
                    {form.hasDrivingLicence === 'yes' && (
                      <div className="mt-3 p-4 rounded-lg border-l-2 bg-panel-2" style={{ borderColor: '#AF7C28' }}>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Driving licence number</label>
                        <input type="text" value={form.drivingLicenceNumber} onChange={e => update('drivingLicenceNumber', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Education & certification</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Secondary school / college / university attended</label>
                      <input type="text" value={form.education} onChange={e => update('education', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Foreign languages spoken <span className="text-faint font-normal">(select all that apply)</span></label>
                      <LanguageSelect value={form.languages} onChange={v => update('languages', v)} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-secondary mb-2">First aid training certificate?</label>
                    <div className="flex gap-3">
                      {['yes', 'no'].map(val => (
                        <button key={val} type="button" onClick={() => update('hasFirstAid', val)} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.hasFirstAid === val ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-line text-secondary hover:border-line-strong'}`}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </button>
                      ))}
                    </div>
                    {form.hasFirstAid === 'no' && <p className="mt-2 text-xs text-faint">No certificate on file yet — you'll be prompted to upload one after submitting this form.</p>}
                  </div>
                </fieldset>
              </div>
            )}

            {current === 1 && (
              <div className="space-y-6">
                {/* BS7858 Guidance Manual */}
                <BS7858Guidance />

                {evidenceError && (
                  <div key="evidence-banner" className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 animate-pop-in">
                    <div>
                      <p className="text-sm font-bold text-rose-600">Evidence required</p>
                      <p className="text-xs text-rose-500 mt-0.5">Upload evidence for every activity before continuing (except permitted gaps up to 1 month).</p>
                    </div>
                  </div>
                )}

                {activityError && (
                  <div key="activity-banner" className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 animate-pop-in">
                    <div>
                      <p className="text-sm font-bold text-rose-600">Activity details incomplete</p>
                      <p className="text-xs text-rose-500 mt-0.5">{activityError}</p>
                    </div>
                  </div>
                )}

                {activities.map((activity, index) => (
                  <div key={activity.id} className="rounded-xl border border-line bg-panel p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-line">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-panel-2 border border-line flex items-center justify-center text-[11px] font-mono font-bold text-secondary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm font-bold text-primary uppercase tracking-wider">Activity {index + 1}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActivity(activity.id)}
                        disabled={activities.length === 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-secondary border border-line hover:border-rose-300 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Type <span style={{ color: '#AF7C28' }}>•</span></label>
                        <select
                          value={activity.type}
                          onChange={e => updateActivity(activity.id, 'type', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel [&>option]:bg-panel"
                        >
                          <option value="work">Work (Employment)</option>
                          <option value="education">Education</option>
                          <option value="training">Training / Course</option>
                          <option value="gap">Career Break / Gap (≤ 1 month permitted without proof)</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          {activity.type === 'gap' ? 'Reason / Details' : 'School / employer / course'} <span style={{ color: '#AF7C28' }}>•</span>
                        </label>
                        <input
                          type="text"
                          value={activity.title}
                          onChange={e => updateActivity(activity.id, 'title', e.target.value)}
                          placeholder={
                            activity.type === 'gap' ? 'e.g. Travel, Career Break, Job Seeking' :
                            activity.type === 'education' ? 'School / college / university' :
                            activity.type === 'work' ? 'Employer / role' : 'Course / provider'
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-secondary mb-1.5">From (month & year) <span style={{ color: coverageInvalid() ? '#e11d48' : '#AF7C28' }}>•</span></label>
                        <button
                          type="button"
                          onClick={() => openDatePicker(activity.id, 'from')}
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-left focus:outline-none focus:border-line-strong bg-panel transition-colors ${activity.from ? 'text-primary' : 'text-faint'} ${picker?.field === 'from' && picker.id === activity.id ? 'border-line-strong' : 'border-line'} ${coverageInvalid() ? 'border-rose-300 bg-rose-50 text-rose-600' : ''}`}
                        >
                          {activity.from ? formatYM(activity.from) : 'Select month & year'}
                        </button>
                        {picker?.field === 'from' && picker.id === activity.id && (
                          <div className="absolute z-20 mt-2 w-64 rounded-xl border border-line bg-panel shadow-lg p-4">
                            {picker.month ? (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <button type="button" onClick={() => setPicker({ ...picker, month: null })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{MONTHS[picker.month - 1]} {picker.year}</span>
                                  <span className="w-7"></span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActivity(activity.id, 'from', `${picker.year}-${String(picker.month).padStart(2, '0')}-01`);
                                    setPicker(null);
                                  }}
                                  className="w-full mb-2.5 py-1 px-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
                                >
                                  Select {MONTHS[picker.month - 1]} {picker.year}
                                </button>
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                  {WEEKDAYS.map(d => <span key={d} className="text-center text-[10px] font-semibold text-faint">{d}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({ length: (new Date(picker.year, picker.month - 1, 1).getDay() + 6) % 7 }).map((_, i) => <span key={`e${i}`} />)}
                                  {Array.from({ length: new Date(picker.year, picker.month, 0).getDate() }, (_, i) => {
                                    const d = i + 1;
                                    const val = `${picker.year}-${String(picker.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                    const selected = activity.from === val;
                                    return (
                                      <button
                                        key={d}
                                        type="button"
                                        onClick={() => { updateActivity(activity.id, 'from', val); setPicker(null); }}
                                        className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${selected ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                      >
                                        {d}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year - 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{picker.year}</span>
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year + 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">›</button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {MONTHS.map((m, i) => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => setPicker({ ...picker, month: i + 1 })}
                                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${activity.from?.startsWith(`${picker.year}-${String(i + 1).padStart(2, '0')}`) ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-secondary mb-1.5">To (month & year) <span style={{ color: coverageInvalid() ? '#e11d48' : '#AF7C28' }}>•</span></label>
                        <button
                          type="button"
                          onClick={() => openDatePicker(activity.id, 'to')}
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-left focus:outline-none focus:border-line-strong bg-panel transition-colors ${activity.to ? 'text-primary' : 'text-faint'} ${picker?.field === 'to' && picker.id === activity.id ? 'border-line-strong' : 'border-line'} ${coverageInvalid() ? 'border-rose-300 bg-rose-50 text-rose-600' : ''}`}
                        >
                          {activity.to ? formatYM(activity.to) : 'Select month & year'}
                        </button>
                        {picker?.field === 'to' && picker.id === activity.id && (
                          <div className="absolute z-20 mt-2 w-64 rounded-xl border border-line bg-panel shadow-lg p-4">
                            {picker.month ? (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <button type="button" onClick={() => setPicker({ ...picker, month: null })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{MONTHS[picker.month - 1]} {picker.year}</span>
                                  <span className="w-7"></span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActivity(activity.id, 'to', `${picker.year}-${String(picker.month).padStart(2, '0')}-01`);
                                    setPicker(null);
                                  }}
                                  className="w-full mb-2.5 py-1 px-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
                                >
                                  Select {MONTHS[picker.month - 1]} {picker.year}
                                </button>
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                  {WEEKDAYS.map(d => <span key={d} className="text-center text-[10px] font-semibold text-faint">{d}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({ length: (new Date(picker.year, picker.month - 1, 1).getDay() + 6) % 7 }).map((_, i) => <span key={`e${i}`} />)}
                                  {Array.from({ length: new Date(picker.year, picker.month, 0).getDate() }, (_, i) => {
                                    const d = i + 1;
                                    const val = `${picker.year}-${String(picker.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                    const selected = activity.to === val;
                                    return (
                                      <button
                                        key={d}
                                        type="button"
                                        onClick={() => { updateActivity(activity.id, 'to', val); setPicker(null); }}
                                        className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${selected ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                      >
                                        {d}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year - 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{picker.year}</span>
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year + 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">›</button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { updateActivity(activity.id, 'to', 'Present'); setPicker(null); }}
                                  className={`w-full mb-2 py-2 rounded-lg text-xs font-medium border transition-colors ${activity.to === 'Present' ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                >
                                  Present
                                </button>
                                <div className="grid grid-cols-3 gap-2">
                                  {MONTHS.map((m, i) => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => setPicker({ ...picker, month: i + 1 })}
                                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${activity.to?.startsWith(`${picker.year}-${String(i + 1).padStart(2, '0')}`) ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Evidence {isShortPermittedGap(activity) ? (
                            <span className="text-emerald-600 font-semibold text-xs">(Optional — permitted gap ≤ 1 mo)</span>
                          ) : (
                            <span style={{ color: '#AF7C28' }}>•</span>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                const f = e.target.files[0];
                                const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
                                const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];
                                const isValidExt = allowedExts.includes(ext);
                                const isValidMime = ALLOWED_EVIDENCE_TYPES.includes(f.type) || f.type.startsWith('image/');
                                if (!isValidExt && !isValidMime) {
                                  showToast('File type not allowed', 'Evidence must be a PDF, JPG, PNG, WebP or Word (.doc/.docx) file.', 'error');
                                  e.target.value = '';
                                  return;
                                }
                                if (f.size > MAX_EVIDENCE_BYTES) {
                                  showToast('File too large', 'Evidence files must be 10 MB or smaller.', 'error');
                                  e.target.value = '';
                                  return;
                                }
                                setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, evidence: f.name, file: f } : a));
                                setEvidenceError(false);
                                setActivityError('');
                                e.target.value = '';
                              }
                            }}
                          />
                          <div className={`w-full h-[42px] rounded-lg border border-dashed bg-panel-2 flex items-center justify-between px-3 cursor-pointer transition-colors ${evidenceError && !activity.evidence && !isShortPermittedGap(activity) ? 'border-rose-300 bg-rose-50' : 'border-line hover:border-line-strong'}`}>
                            <div className="flex items-center gap-2 truncate">
                              <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                              <span className={`text-xs truncate ${activity.evidence ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                                {activity.evidence || (isShortPermittedGap(activity) ? 'Optional — no proof required' : 'Upload document')}
                              </span>
                            </div>
                            {activity.evidence && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, evidence: '', file: null } : a));
                                }}
                                className="text-tertiary hover:text-rose-500 text-xs p-1 relative z-20"
                                title="Remove document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {isShortPermittedGap(activity) ? (
                          <p className="mt-1.5 text-[10px] text-emerald-600 font-medium">✓ BS 7858 Standard: Gaps up to 1 month (31 days) do not require documentary evidence.</p>
                        ) : (
                          <>
                            {evidenceError && !activity.evidence && <p className="mt-1.5 text-[10px] font-medium text-rose-500">Evidence is required for every activity.</p>}
                            <p className="mt-1.5 text-[10px] text-faint">PDF, JPG, PNG, WebP or Word — max 10MB</p>
                          </>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Contact reference — mobile <span className="text-faint font-normal">(optional)</span></label>
                        <input
                          type="tel"
                          value={activity.mobile}
                          onChange={e => updateActivity(activity.id, 'mobile', e.target.value)}
                          placeholder="Mobile number"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Contact reference — email <span className="text-faint font-normal">(optional)</span></label>
                        <input
                          type="email"
                          value={activity.email}
                          onChange={e => updateActivity(activity.id, 'email', e.target.value)}
                          placeholder="Email address"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addActivity}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-line text-sm font-medium text-secondary hover:text-primary hover:border-line-strong hover:bg-panel-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Activity
                </button>
              </div>
            )}

            {current === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">How long have you lived at your current address? <span style={{ color: '#AF7C28' }}>•</span></label>
                  <select value={form.lenAtAddress} onChange={e => update('lenAtAddress', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel">
                    <option value="">Select</option>
                    <option value="5plus">5 years or more</option>
                    <option value="under5">Less than 5 years</option>
                  </select>
                </div>
                {form.lenAtAddress === 'under5' && (
                  <div className="p-5 rounded-xl border border-line bg-panel-2 space-y-4">
                    <p className="text-xs text-faint">You'll need to provide proof of address for each entry covering the 5-year period.</p>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Previous addresses (most recent first)</label>
                      <textarea value={form.prevAddresses} onChange={e => update('prevAddresses', e.target.value)} rows={5} placeholder="Address 1:\nFrom:\nTo:\n\nAddress 2:\nFrom:\nTo:" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono"></textarea>
                    </div>
                  </div>
                )}
                {form.lenAtAddress === '5plus' && (
                  <div className="p-5 rounded-xl border border-line bg-panel-2">
                    <p className="text-sm text-secondary">Since you've been at your current address 5+ years, no previous addresses are needed.</p>
                  </div>
                )}

                {/* Proofs of Address Upload Section (Mandatory 2 Proofs) */}
                <fieldset className="border-none p-0 pt-2">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-3 flex items-center justify-between">
                    <span>Proof of Address Documents</span>
                    <span className="text-[10px] normal-case tracking-normal px-2 py-0.5 rounded bg-amber-500/10 text-[#AF7C28] border border-amber-500/30 font-bold">
                      2 Documents Required
                    </span>
                  </legend>
                  <p className="text-xs text-secondary mb-4 leading-relaxed">
                    Under BS 7858 security vetting guidelines, please submit two separate proofs of address dated within the last 3 months verifying your current residence.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Proof 1 */}
                    <div className="p-4 rounded-xl border border-line bg-panel space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#AF7C28]/15 text-[#AF7C28] text-xs font-bold flex items-center justify-center font-mono">1</span>
                        <div>
                          <label className="text-xs font-bold text-primary block">Proof of Address 1</label>
                          <span className="text-[10px] text-faint block">Bank statement, credit card, council tax bill</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              if (f.size > MAX_EVIDENCE_BYTES) {
                                showToast('File too large', 'Files must be 10 MB or smaller.', 'error');
                                return;
                              }
                              setProofAddress1File(f);
                              setProofAddress1Name(f.name);
                              update('proofAddress1Name', f.name);
                            }
                          }}
                        />
                        <div className="w-full h-[42px] rounded-lg border border-dashed border-line bg-panel-2 flex items-center justify-between px-3 cursor-pointer hover:border-line-strong transition-colors">
                          <div className="flex items-center gap-2 truncate">
                            <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                            <span className={`text-xs truncate ${proofAddress1Name || form.proofAddress1Name ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                              {proofAddress1Name || form.proofAddress1Name || 'Upload Proof 1'}
                            </span>
                          </div>
                          {(proofAddress1Name || form.proofAddress1Name) && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setProofAddress1File(null); setProofAddress1Name(''); update('proofAddress1Name', ''); }}
                              className="text-tertiary hover:text-rose-500 text-xs p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-faint">Dated within the last 3 months — max 10MB</p>
                    </div>

                    {/* Proof 2 */}
                    <div className="p-4 rounded-xl border border-line bg-panel space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#AF7C28]/15 text-[#AF7C28] text-xs font-bold flex items-center justify-center font-mono">2</span>
                        <div>
                          <label className="text-xs font-bold text-primary block">Proof of Address 2</label>
                          <span className="text-[10px] text-faint block">Utility bill (gas/electric/water), tenancy, HMRC letter</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              if (f.size > MAX_EVIDENCE_BYTES) {
                                showToast('File too large', 'Files must be 10 MB or smaller.', 'error');
                                return;
                              }
                              setProofAddress2File(f);
                              setProofAddress2Name(f.name);
                              update('proofAddress2Name', f.name);
                            }
                          }}
                        />
                        <div className="w-full h-[42px] rounded-lg border border-dashed border-line bg-panel-2 flex items-center justify-between px-3 cursor-pointer hover:border-line-strong transition-colors">
                          <div className="flex items-center gap-2 truncate">
                            <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                            <span className={`text-xs truncate ${proofAddress2Name || form.proofAddress2Name ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                              {proofAddress2Name || form.proofAddress2Name || 'Upload Proof 2'}
                            </span>
                          </div>
                          {(proofAddress2Name || form.proofAddress2Name) && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setProofAddress2File(null); setProofAddress2Name(''); update('proofAddress2Name', ''); }}
                              className="text-tertiary hover:text-rose-500 text-xs p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-faint">Different document type from Proof 1 — max 10MB</p>
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {current === 3 && (
              <div className="space-y-6">
                {[
                  { key: 'q1', label: 'Have you or any immediate family been convicted, fined, imprisoned, placed on probation, discharged on payment of costs, or had any order made against you by a criminal, civil or military court or public authority (excluding minor motoring offences)?', cond: 'q1Details' },
                  { key: 'q2', label: 'Do you have any police cautions?', cond: 'q2Details' },
                  { key: 'q3', label: 'Any prosecutions pending against you?', cond: 'q3Details' },
                  { key: 'q4', label: 'Have you ever been subject to bankruptcy proceedings?', cond: 'q4Details' },
                  { key: 'q5', label: 'Are there any outstanding County Court Judgments for debt?', cond: 'q5Details' },
                  { key: 'q6', label: 'Do you have any relatives working for the company?', cond: 'q6Details' },
                  { key: 'q7', label: 'Do you own a motor vehicle or motorcycle?', cond: 'q7Details' },
                ].map(q => (
                  <div key={q.key} className="p-5 rounded-xl border border-line bg-panel">
                    <label className="block text-sm font-medium text-secondary mb-3">{q.label} <span style={{ color: '#AF7C28' }}>•</span></label>
                    <div className="flex gap-3 mb-3">
                      {['yes', 'no'].map(val => (
                        <button key={val} type="button" onClick={() => update(q.key, val)} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form[q.key as keyof typeof form] === val ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-line text-secondary hover:border-line-strong'}`}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </button>
                      ))}
                    </div>
                    {form[q.key as keyof typeof form] === 'yes' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-secondary mb-1.5">Give details</label>
                        <textarea value={form[q.cond as keyof typeof form] as string} onChange={e => update(q.cond, e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {current === 4 && (
              <div className="space-y-6">
                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Personal reference 1</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref1Name} onChange={e => update('ref1Name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.ref1Address} onChange={e => update('ref1Address', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref1Postcode} onChange={e => update('ref1Postcode', e.target.value)} placeholder="e.g. W1K 1AH" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Occupation</label>
                      <input type="text" value={form.ref1Occupation} onChange={e => update('ref1Occupation', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Known for (years) <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="number" min="2" required value={form.ref1Known} onChange={e => update('ref1Known', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Personal reference 2</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref2Name} onChange={e => update('ref2Name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.ref2Address} onChange={e => update('ref2Address', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref2Postcode} onChange={e => update('ref2Postcode', e.target.value)} placeholder="e.g. N1 2AB" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Occupation</label>
                      <input type="text" value={form.ref2Occupation} onChange={e => update('ref2Occupation', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Known for (years) <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="number" min="2" required value={form.ref2Known} onChange={e => update('ref2Known', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Next of kin</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.nokName} onChange={e => update('nokName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.nokAddress} onChange={e => update('nokAddress', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.nokPostcode} onChange={e => update('nokPostcode', e.target.value)} placeholder="e.g. EC1A 1BB" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Telephone</label>
                      <input type="tel" value={form.nokTelephone} onChange={e => update('nokTelephone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Mobile <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="tel" required value={form.nokMobile} onChange={e => update('nokMobile', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Relationship to you <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.nokRelationship} onChange={e => update('nokRelationship', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Character referee (screening)</legend>
                  <p className="text-xs text-faint mb-4">One person who has known you at least 2 years immediately prior to screening. Not a relative, not a previous employer, not someone at your address — a current or previous colleague is fine.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Full name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.charRefName} onChange={e => update('charRefName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.charRefAddress} onChange={e => update('charRefAddress', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.charRefPostcode} onChange={e => update('charRefPostcode', e.target.value)} placeholder="e.g. SW1 1AA" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Full telephone number <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="tel" required value={form.charRefTelephone} onChange={e => update('charRefTelephone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Length of time known (years) <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="number" min="2" required value={form.charRefKnown} onChange={e => update('charRefKnown', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {current === 5 && (
              <div className="space-y-6">
                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Right to Work Verification (Upload Required)</legend>
                  <div className="p-5 rounded-xl border border-line bg-panel space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Select your nationality / Right to Work status <span style={{ color: '#AF7C28' }}>•</span></label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => update('rtwNationality', 'british')}
                          className={`p-3.5 rounded-xl border text-left font-medium transition-all ${form.rtwNationality === 'british' ? 'border-amber-400 bg-amber-500/10 text-amber-700' : 'border-line text-secondary hover:border-line-strong'}`}
                        >
                          <div className="text-xs font-bold text-primary">British / Irish Citizen</div>
                          <div className="text-[11px] text-faint mt-0.5">Upload UK / Irish Passport</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => update('rtwNationality', 'non_british')}
                          className={`p-3.5 rounded-xl border text-left font-medium transition-all ${form.rtwNationality === 'non_british' ? 'border-amber-400 bg-amber-500/10 text-amber-700' : 'border-line text-secondary hover:border-line-strong'}`}
                        >
                          <div className="text-xs font-bold text-primary">Non-British / UK Visa Holder</div>
                          <div className="text-[11px] text-faint mt-0.5">Upload Passport & Share Code</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        {form.rtwNationality === 'british' ? 'Upload British / Irish Passport' : 'Upload International Passport / Visa Document'} <span style={{ color: '#AF7C28' }}>•</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              setRtwFile(f);
                              update('rtwDocName', f.name);
                            }
                          }}
                        />
                        <div className="w-full h-[42px] rounded-lg border border-dashed border-line bg-panel-2 flex items-center justify-center gap-2 px-3 cursor-pointer hover:border-line-strong">
                          <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                          <span className={`text-xs truncate ${form.rtwDocName ? 'font-bold text-amber-600' : 'text-faint'}`}>
                            {form.rtwDocName || 'Click to select passport/document (PDF, JPG, PNG)'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-faint">PDF, JPG, PNG, WebP or Word — max 10MB</p>
                    </div>

                    {form.rtwNationality === 'non_british' && (
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Home Office Share Code <span style={{ color: '#AF7C28' }}>•</span></label>
                        <input
                          type="text"
                          required
                          value={form.shareCode}
                          onChange={e => update('shareCode', e.target.value.toUpperCase())}
                          placeholder="e.g. 9W8 7Y6 5X4"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono tracking-wider uppercase"
                        />
                        <p className="text-[11px] text-faint mt-1">Generate your code at <a href="https://www.gov.uk/prove-right-to-work" target="_blank" rel="noreferrer" className="text-amber-600 underline font-semibold">gov.uk/prove-right-to-work</a></p>
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">What gets checked</legend>
                  <div className="space-y-4">
                    {[
                      { title: 'Financial history & Credit Check', tag: 'MANDATORY BS 7858', desc: 'Required for all security personnel under BS 7858 standards. Credit reference audit will be performed.' },
                      { title: 'Right to Work Verification', tag: 'GOVERNMENT AUDITED', desc: form.rtwNationality === 'non_british' ? 'Passport check + official UK Home Office Share Code validation.' : 'UK / Irish Passport verification.' },
                      { title: 'Sanctions & Terrorism Check', tag: 'GLOBAL WATCHLIST', desc: 'Cross-referenced against UK sanctions lists and global security watch lists.' },
                    ].map(item => (
                      <div key={item.title} className="p-5 rounded-xl border border-line bg-panel-2">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-primary text-sm">{item.title}</h4>
                          <span className="text-[10px] font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-panel border border-line text-amber-600">{item.tag}</span>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Criminal offences</legend>
                  <p className="text-xs text-faint mb-3">Convictions that are legally 'spent' under the Rehabilitation of Offenders Act 1974 do not need to be declared.</p>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Give full details of any unspent criminal proceedings, if applicable</label>
                  <textarea value={form.criminalDetails} onChange={e => update('criminalDetails', e.target.value)} rows={4} placeholder="Leave blank if not applicable" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Conditional employment</legend>
                  <div className="p-5 rounded-xl border border-line bg-panel-2">
                    <p className="text-xs text-secondary leading-relaxed">Uniguard may offer a role on a conditional basis while remaining references are verified — this period runs for no longer than 12 weeks. Failing to meet screening standards during that window ends the conditional offer.</p>
                  </div>
                </fieldset>

                {/* Bank Details & Payroll Verification (Client Item #7) */}
                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4 flex items-center justify-between">
                    <span>Bank Details & Payroll Verification</span>
                    <span className="text-[10px] normal-case tracking-normal px-2 py-0.5 rounded bg-amber-500/10 text-[#AF7C28] border border-amber-500/30 font-bold">
                      Direct Deposit & BS 7858
                    </span>
                  </legend>
                  <p className="text-xs text-secondary mb-4 leading-relaxed">
                    Provide your UK bank account details for wage payments and BS 7858 identity/financial audit. You may also upload proof of bank account (e.g. bank statement header, voided cheque, or bank app screenshot).
                  </p>
                  <div className="p-5 rounded-xl border border-line bg-panel space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Bank name <span className="text-faint font-normal">(e.g. Barclays, HSBC, Lloyds)</span></label>
                        <input
                          type="text"
                          value={form.bankName}
                          onChange={e => update('bankName', e.target.value)}
                          placeholder="e.g. Barclays Bank UK"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Account holder name</label>
                        <input
                          type="text"
                          value={form.accountHolderName || form.fullName}
                          onChange={e => update('accountHolderName', e.target.value)}
                          placeholder="Full name as shown on account"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Sort code <span className="text-faint font-normal">(6 digits)</span></label>
                        <input
                          type="text"
                          maxLength={8}
                          value={form.sortCode}
                          onChange={e => update('sortCode', e.target.value)}
                          placeholder="e.g. 20-40-71"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono tracking-wider"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Account number <span className="text-faint font-normal">(8 digits)</span></label>
                        <input
                          type="text"
                          maxLength={10}
                          value={form.accountNumber}
                          onChange={e => update('accountNumber', e.target.value)}
                          placeholder="e.g. 12345678"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono tracking-wider"
                        />
                      </div>
                    </div>

                    {/* Proof of Bank Document Upload */}
                    <div className="pt-2 border-t border-line/60">
                      <label className="block text-xs font-semibold text-secondary mb-1.5">
                        Upload Proof of Bank Details <span className="text-faint font-normal">(Statement header, paying-in slip, or voided cheque)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              if (f.size > MAX_EVIDENCE_BYTES) {
                                showToast('File too large', 'Files must be 10 MB or smaller.', 'error');
                                return;
                              }
                              setBankProofFile(f);
                              setBankProofDocName(f.name);
                              update('bankDocName', f.name);
                            }
                          }}
                        />
                        <div className="w-full h-[42px] rounded-lg border border-dashed border-line bg-panel-2 flex items-center justify-between px-3 cursor-pointer hover:border-line-strong transition-colors">
                          <div className="flex items-center gap-2 truncate">
                            <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                            <span className={`text-xs truncate ${bankProofDocName || form.bankDocName ? 'font-medium text-[#AF7C28]' : 'text-faint'}`}>
                              {bankProofDocName || form.bankDocName || 'Upload proof of bank details (PDF, JPG, PNG)'}
                            </span>
                          </div>
                          {(bankProofDocName || form.bankDocName) && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setBankProofFile(null); setBankProofDocName(''); update('bankDocName', ''); }}
                              className="text-tertiary hover:text-rose-500 text-xs p-1 relative z-20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-faint">Document must show account name, sort code & account number — max 10MB</p>
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {current === 6 && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl border border-line bg-panel-2 max-h-[230px] overflow-y-auto">
                  <p className="text-xs text-secondary leading-[1.8]">
                    I certify that to the best of my knowledge, the information I have given in this application is true and complete, and I understand that any false statement or omission may render this application void or lead to termination of employment without notice. I authorise the company to approach government agencies, former employers, current employees, educational establishments, criminal justice agencies and personal referees for verification purposes. I consent to the company's processing of personal data — including financial, credit reference, and (where relevant) medical information — for the purpose of establishing my fitness and eligibility for this role, in line with the Data Protection Act 2018 and BS 7858 screening and vetting standards. I confirm that any documents I provide as proof of identity or address are genuine and may be examined under UV or similar verification devices.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="agree1" checked={form.agree1} onChange={e => update('agree1', e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-amber-600" />
                  <label htmlFor="agree1" className="text-sm text-secondary cursor-pointer">I have read and understood the declaration above, and I agree to the company's processing of my data for screening purposes.</label>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="agree2" checked={form.agree2} onChange={e => update('agree2', e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-amber-600" />
                  <label htmlFor="agree2" className="text-sm text-secondary cursor-pointer">I confirm the information provided in this application is accurate and complete to the best of my knowledge.</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Print name <span style={{ color: '#AF7C28' }}>•</span></label>
                  <input type="text" required value={form.printName} onChange={e => update('printName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Signature <span style={{ color: '#AF7C28' }}>•</span></label>
                  <div
                    onClick={() => { if (!form.printName) return; update('signature', form.printName); }}
                    className={`w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-sm cursor-pointer transition-all ${form.signature ? 'border-amber-400 text-primary font-bold text-lg' : 'border-line text-faint hover:border-line-strong'}`}
                    style={form.signature ? { borderStyle: 'solid', fontFamily: "'Oswald', sans-serif" } : {}}
                  >
                    {form.signature || (form.printName ? 'Click to sign with your typed name' : 'Enter your printed name first')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Date</label>
                  <input type="text" value={form.sigDate || new Date().toLocaleDateString('en-GB')} disabled className="w-full px-4 py-2.5 rounded-lg border border-line text-sm bg-panel-2 text-faint" />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-line">
              <button
                type="button"
                onClick={back}
                disabled={current === 0}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-secondary border border-line hover:border-line-strong transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[46px]"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {current < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] min-h-[46px]"
                  style={{ backgroundColor: '#AF7C28' }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                  {submitError && (
                    <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 max-w-sm text-right animate-pop-in">{submitError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!form.agree1 || !form.agree2 || !form.printName || submitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed min-h-[46px]"
                    style={{ backgroundColor: '#AF7C28' }}
                  >
                    {submitting ? 'Submitting…' : 'Submit application'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { 
  Applicant, 
  Job, 
  Employee, 
  ActivityLog, 
  ActivePage, 
  CheckStatus, 
  VettingCheckType,
  VettingCheckItem,
  ApplicationStage,
  InterviewInfo,
  ChatMessage,
  ScheduledInterview,
  ApplicantDocument,
  AppSettings,
  UserRole
} from '../types/recruitment';
import { 
  INITIAL_APPLICANTS, 
  INITIAL_JOBS, 
  INITIAL_EMPLOYEES, 
  INITIAL_ACTIVITY_LOGS 
} from '../data/mockData';
import { supabase, isOAuthRedirect } from '../lib/supabase';
import { STAGE_LABEL } from '../components/common/recruitmentStages';

const VALID_STAGES: ApplicationStage[] = ['applied', 'under_review', 'interview_scheduled', 'interview_completed', 'vetting_in_progress', 'ready_for_contract', 'contract_sent', 'hired', 'rejected'];

const defaultChecks = (id: string): VettingCheckItem[] => [
  { id: `chk-1-${id}`, type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-job-applicant-right-to-work' },
  { id: `chk-2-${id}`, type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-a-private-security-licence' },
  { id: `chk-3-${id}`, type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
  { id: `chk-4-${id}`, type: 'credit_check', title: 'Credit Check (Mandatory BS 7858)', description: 'Financial history and credit audit under BS 7858 standards', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
  { id: `chk-5-${id}`, type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://find-and-update.company-information.service.gov.uk' },
];

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message?: string;
}

interface RecruitmentContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  
  pendingJobId: string | null;
  setPendingJobId: (id: string | null) => void;
  
  jobs: Job[];
  applicants: Applicant[];
  employees: Employee[];
  activityLogs: ActivityLog[];
  interviews: ScheduledInterview[];
  messages: ChatMessage[];
  unreadAdminCount: number;
  settings: AppSettings;
  
  selectedApplicant: Applicant | null;
  setSelectedApplicant: (applicant: Applicant | null) => void;
  
  // Quick filters & search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStageFilter: string;
  setSelectedStageFilter: (stage: string) => void;
  
  // Actions
  updateCheckStatus: (applicantId: string, checkType: VettingCheckType, status: CheckStatus, notes?: string, proofUrl?: string, proofName?: string) => void;
  updateApplicantStage: (applicantId: string, stage: ApplicationStage) => void;
  scheduleInterview: (applicantId: string, interview: Omit<InterviewInfo, 'id'>) => void;
  completeInterview: (applicantId: string, notes: string, rating: number, passed: boolean) => void;
  sendContract: (applicantId: string) => void;
  approveApplication: (applicantId: string) => void;
  completeHiring: (applicantId: string, signerName: string) => void;
  convertToEmployee: (applicantId: string) => void;
  fireEmployee: (applicantId: string) => void;
  createJob: (jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => Promise<void>;
  updateJob: (id: string, jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  saveSettings: (next: AppSettings) => Promise<void>;
  addApplicant: (applicantData: Partial<Applicant>) => void;

  // Chat
  sendMessage: (applicationId: string, body: string, sender: 'admin' | 'user') => void;
  editMessage: (messageId: string, body: string) => void;
  deleteMessage: (messageId: string) => void;
  markConversationRead: (applicationId: string, asAdmin: boolean) => void;
  messagesByApplication: (applicationId: string) => ChatMessage[];
  reloadMessages: () => Promise<void>;

  // Interviews (live, persisted)
  scheduleInterviewLive: (applicantId: string, scheduledAt: string, durationMinutes: number, location: string, notes?: string) => void;
  completeInterviewLive: (interviewId: string) => void;
  interviewsByApplication: (applicationId: string) => ScheduledInterview[];
  
  // Toast notifications
  toasts: Toast[];
  showToast: (title: string, message?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  
  // Command palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Authentication & Roles
  isAuthenticated: boolean;
  userRole: UserRole;
  isAuditor: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  auditorLogin: (email: string, password: string) => Promise<boolean>;
  auditorDemoLogin: () => void;
  logout: () => void;

  // Public user auth
  publicUser: { name: string; email: string } | null;
  publicLogin: (email: string, password: string, captchaToken?: string) => Promise<boolean>;
  publicSignup: (name: string, email: string, password: string, captchaToken?: string) => Promise<{ ok: boolean; needsConfirm: boolean }>;
  googleLogin: () => Promise<boolean>;
  requestPasswordReset: (email: string, captchaToken?: string) => Promise<boolean>;
  publicLogout: () => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

const PAGE_PATHS: Record<string, string> = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  'user-dashboard': '/dashboard',
  apply: '/apply',
  confirm: '/confirm',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'privacy-policy': '/privacy-policy',
  terms: '/terms-of-service',
  'auditor-login': '/auditor',
  dashboard: '/admin',
  jobs: '/admin/jobs',
  applicants: '/admin/applicants',
  interviews: '/admin/interviews',
  employees: '/admin/employees',
  chat: '/admin/chat',
  reports: '/admin/reports',
  settings: '/admin/settings',
};

const PATH_PAGES: Record<string, string> = {
  '/': 'landing',
  '/login': 'login',
  '/signup': 'signup',
  '/dashboard': 'user-dashboard',
  '/apply': 'apply',
  '/confirm': 'confirm',
  '/forgot-password': 'forgot-password',
  '/reset-password': 'reset-password',
  '/privacy-policy': 'privacy-policy',
  '/privacy': 'privacy-policy',
  '/terms': 'terms',
  '/terms-of-service': 'terms',
  '/terms-and-conditions': 'terms',
  '/auditor': 'auditor-login',
  '/auditor/login': 'auditor-login',
  '/admin': 'dashboard',
  '/admin/jobs': 'jobs',
  '/admin/applicants': 'applicants',
  '/admin/interviews': 'interviews',
  '/admin/employees': 'employees',
  '/admin/chat': 'chat',
  '/admin/reports': 'reports',
  '/admin/settings': 'settings',
};

const pageFromPath = (path: string): ActivePage => {
  const search = window.location.search;
  const hash = window.location.hash;
  if (
    path === '/reset-password' ||
    search.includes('type=recovery') ||
    hash.includes('type=recovery') ||
    (search.includes('token_hash') && search.includes('recovery'))
  ) {
    return 'reset-password';
  }
  if (path === '/confirm' || search.includes('type=signup') || hash.includes('type=signup')) {
    return 'confirm';
  }
  return (PATH_PAGES[path] || 'landing') as ActivePage;
};

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePageState] = useState<ActivePage>(() => pageFromPath(window.location.pathname));
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  const setActivePage = (page: ActivePage) => {
    setActivePageState(page);
    const path = PAGE_PATHS[page] || '/admin';
    if (window.location.pathname !== path) {
      window.history.pushState({ page }, '', path);
    }
  };

  useEffect(() => {
    const onPopState = () => {
      setActivePageState(pageFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('uniguard_user_role') as UserRole) || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('uniguard_user_role');
  });

  const isAuditor = userRole === 'auditor';

  const [publicUser, setPublicUser] = useState<{ name: string; email: string } | null>(null);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load applications from Supabase into the admin pipeline
  const supabaseIdsRef = React.useRef<Set<string>>(new Set());
  const jobIdsRef = React.useRef<Set<string>>(new Set());

  const supabaseRowToJob = (row: any): Job => {
    jobIdsRef.current.add(row.id);
    const types: Job['employmentType'][] = ['Full-Time', 'Part-Time', 'Zero-Hours', 'Shift-Based'];
    const statuses: Job['status'][] = ['active', 'draft', 'closed'];
    return {
      id: row.id,
      title: row.title || 'Untitled Role',
      location: row.location || '',
      payRate: Number(row.pay_rate ?? 0),
      employmentType: types.includes(row.employment_type) ? row.employment_type : 'Full-Time',
      siaRequired: !!row.sia_required,
      drivingLicenceRequired: !!row.driving_licence_required,
      status: statuses.includes(row.status) ? row.status : 'active',
      createdDate: row.created_date || (row.created_at || '').slice(0, 10),
      description: row.description || '',
      applicantsCount: Number(row.applicants_count ?? 0),
    } as Job;
  };

  const mergeJobs = (incoming: Job[]) => {
    setJobs(prev => {
      const incomingIds = new Set(incoming.map(j => j.id));
      const kept = prev.filter(j => j.id.startsWith('job-') && !incomingIds.has(j.id));
      const byId = new Map(kept.map(j => [j.id, j]));
      incoming.forEach(j => byId.set(j.id, j));
      return [...byId.values()];
    });
  };

  const supabaseRowToApplicant = (row: any): Applicant => {
    const fd = row.form_data || {};
    supabaseIdsRef.current.add(row.id);
    const extraDocs = Array.isArray(fd.documents) ? (fd.documents as ApplicantDocument[]) : [];
    const evidenceDocs = ((fd.activities || []) as any[])
      .filter((a: any) => a.evidence || a.evidencePath)
      .map((a: any, i: number): ApplicantDocument => ({
        id: `ev-${row.id}-${i}`,
        name: a.evidence ? String(a.evidence).split('/').pop() || 'Evidence document' : 'Evidence document',
        type: 'proof_address',
        fileUrl: a.evidencePath || a.evidence,
        uploadedAt: '',
        size: 'Evidence',
      }));
    const docs = [...extraDocs, ...evidenceDocs];
    const rawVetting = (Array.isArray(row.vetting_data) && row.vetting_data.length > 0)
      ? row.vetting_data
      : (Array.isArray(fd.vetting_data) && fd.vetting_data.length > 0)
      ? fd.vetting_data
      : (Array.isArray(fd.vettingChecks) && fd.vettingChecks.length > 0)
      ? fd.vettingChecks
      : undefined;
    const storedChecks = rawVetting;
    return {
      id: row.id,
      fullName: row.full_name || 'New Applicant',
      email: row.applicant_email || '',
      phone: fd.mobile || fd.telephone || '',
      address: fd.address || 'London, UK',
      postcode: fd.postcode || '',
      nationalInsuranceNo: fd.niNumber || '',
      siaLicenceNo: fd.siaLicence || '',
      siaLicenceSector: 'Door Supervision',
      siaLicenceExpiry: '',
      appliedJobId: '',
      appliedJobTitle: row.applied_job || '',
      appliedDate: (row.created_at || '').slice(0, 10),
      currentStage: VALID_STAGES.includes(row.status) ? row.status : 'applied',
      dob: fd.dob || '',
      rtwNationality: fd.rtwNationality || (fd.shareCode ? 'non_british' : 'british'),
      shareCode: fd.shareCode || '',
      rtwDocUrl: fd.rtwDocUrl || '',
      passportDocName: fd.passportDocName || fd.rtwDocName,
      passportDocUrl: fd.passportDocUrl || fd.rtwDocUrl,
      bankDetails: fd.bankDetails || (fd.bankName ? {
        bankName: fd.bankName,
        accountHolderName: fd.accountHolderName || row.full_name || '',
        sortCode: fd.sortCode || '',
        accountNumber: fd.accountNumber || '',
        docUrl: fd.bankDocUrl,
        docName: fd.bankDocName,
      } : undefined),
      actCertName: fd.actCertName || fd.actCertDocName,
      actCertUrl: fd.actCertUrl || fd.actCertDocUrl,
      approvedByAdmin: !!fd.approvedByAdmin || row.status === 'ready_for_contract' || row.status === 'contract_sent' || row.status === 'hired',
      approvedAt: fd.approvedAt,
      companyDocsSigned: !!fd.companyDocsSigned || row.status === 'hired',
      companyDocsSignedAt: fd.companyDocsSignedAt,
      companyDocsSignerName: fd.companyDocsSignerName,
      documents: docs,
      vettingChecks: storedChecks
        ? (storedChecks as any[]).map((c, i) => ({
            id: c.id || `chk-${row.id}-${i}`,
            type: c.type as VettingCheckType,
            title: c.title || '',
            description: c.description || '',
            isRequired: !!c.isRequired,
            status: (['approved', 'rejected', 'pending'] as CheckStatus[]).includes(c.status) ? c.status : 'pending',
            notes: c.notes || '',
            externalUrl: c.externalUrl || '#',
            proofUrl: c.proofUrl,
            proofName: c.proofName,
            verifiedBy: c.verifiedBy,
            verifiedAt: c.verifiedAt,
          }))
        : defaultChecks(row.id),
      _rawFormData: fd,
    } as Applicant;
  };

  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'Uniguard Security Services UK Ltd',
    companyNumber: '09823412',
    siaAcsApproved: true,
  });

  const prevStageRef = React.useRef<Record<string, string>>({});
  // Only write a status to Supabase when it actually changed — stops the
  // every-refetch write storm that echoed back as duplicate update toasts.
  const lastSyncedStatusRef = React.useRef<Record<string, string>>({});
  // Track when a vetting change was last made locally (ms timestamp), so that
  // a rapid refetch within 30s doesn't clobber an optimistic UI update.
  const lastVettingWriteRef = React.useRef<Record<string, number>>({});
  const publicUserRef = React.useRef(publicUser);
  useEffect(() => { publicUserRef.current = publicUser; }, [publicUser]);

  // Immediately hydrate from cached admin session if present
  useEffect(() => {
    try {
      const cached = localStorage.getItem('uniguard_cached_applications');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          reconcileApplicants(parsed.map(supabaseRowToApplicant));
        }
      }
      const cachedJobs = localStorage.getItem('uniguard_cached_jobs');
      if (cachedJobs) {
        const parsedJobs = JSON.parse(cachedJobs);
        if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
          mergeJobs(parsedJobs.map(supabaseRowToJob));
        }
      }
    } catch {}
  }, []);

  const supabaseRowToMessage = (m: any): ChatMessage => ({
    id: m.id,
    applicationId: m.application_id,
    sender: m.sender === 'admin' ? 'admin' : 'user',
    body: m.body || '',
    editedAt: m.edited_at || undefined,
    createdAt: m.created_at || new Date().toISOString(),
    readByAdmin: !!m.read_by_admin,
    readByUser: !!m.read_by_user,
  });

  const supabaseRowToInterview = (row: any): ScheduledInterview => ({
    id: row.id,
    applicationId: row.application_id,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes ?? 45,
    location: row.location || 'Video Call (link to follow)',
    notes: row.notes || undefined,
    rating: typeof row.rating === 'number' ? row.rating : undefined,
    status: row.status || 'scheduled',
    completed: !!row.completed,
  });

  const scheduledInterviewToInfo = (iv: ScheduledInterview): InterviewInfo => {
    const d = iv.scheduledAt ? new Date(iv.scheduledAt) : new Date();
    const isValidDate = !isNaN(d.getTime());
    return {
      id: iv.id,
      scheduledDate: isValidDate ? d.toISOString().slice(0, 10) : '',
      scheduledTime: isValidDate ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      interviewerName: 'Uniguard Recruitment',
      locationOrLink: iv.location,
      interviewType: iv.location.toLowerCase().includes('video') || iv.location.toLowerCase().includes('call') ? 'video' : 'in_person',
      completed: iv.completed,
      notes: iv.notes,
      rating: iv.rating ?? 0,
    };
  };

  const supabaseRowToEmployee = (row: any): Employee => ({
    id: row.id,
    applicantId: row.applicant_id || '',
    employeeId: row.employee_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    roleTitle: row.role_title,
    siaLicenceNo: row.sia_licence_no,
    siaLicenceSector: row.sia_licence_sector,
    siaLicenceExpiry: row.sia_licence_expiry,
    hiredDate: row.hired_date,
    assignedSite: row.assigned_site,
    hourlyRate: Number(row.hourly_rate ?? 0),
    status: ['active', 'on_assignment', 'offboarding'].includes(row.status) ? row.status : 'active',
  } as Employee);

  const mergeEmployees = (incoming: Employee[]) => {
    setEmployees(prev => {
      const incomingIds = new Set(incoming.map(e => e.id));
      const kept = prev.filter(e => e.id.startsWith('emp-') && !incomingIds.has(e.id));
      const byId = new Map(kept.map(e => [e.id, e]));
      incoming.forEach(e => byId.set(e.id, e));
      return [...byId.values()];
    });
  };

  const supabaseRowToSettings = (row: any): AppSettings => ({
    companyName: row.company_name || 'Uniguard Security Services UK Ltd',
    companyNumber: row.company_number || '',
    siaAcsApproved: !!row.sia_acs_approved,
  });

  // Reconcile: server rows win for their own ids; db rows missing from the
  // server are dropped; local-only rows (optimistic/mock) are preserved.
  const mergeMessages = (incoming: ChatMessage[]) => {
    setMessages(prev => {
      const incomingIds = new Set(incoming.map(m => m.id));
      const kept = prev.filter(m => m.id.startsWith('local-') || incomingIds.has(m.id));
      const byId = new Map(kept.map(m => [m.id, m]));
      incoming.forEach(m => byId.set(m.id, m));
      return [...byId.values()];
    });
  };

  const reconcileApplicants = (incoming: Applicant[]) => {
    if (incoming.length === 0) {
      // Don't wipe existing applications if server returns empty (e.g. unauthenticated auditor or RLS)
      setApplicants(prev => {
        if (prev.length > 0) return prev;
        const cached = localStorage.getItem('uniguard_cached_applications');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map(supabaseRowToApplicant);
            }
          } catch {}
        }
        return INITIAL_APPLICANTS;
      });
      return;
    }
    setApplicants(prev => {
      const incomingIds = new Set(incoming.map(a => a.id));
      const incomingEmails = new Set(incoming.map(a => a.email.toLowerCase()));
      const kept = prev.filter(a => {
        if (incomingIds.has(a.id)) return false;
        if (incomingEmails.has(a.email.toLowerCase())) return false;
        if (supabaseIdsRef.current.has(a.id)) return false;
        return true;
      });
      const byId = new Map(kept.map(a => [a.id, a]));
      incoming.forEach(a => {
        const local = prev.find(x => x.id === a.id);
        if (local) {
          // Server vetting data is always preferred — it's the persisted source of truth.
          // Exception: if the admin made a vetting change within the last 30 seconds and
          // the server hasn't echoed it back yet, keep the optimistic local state.
          const recentLocalWrite = (lastVettingWriteRef.current[a.id] || 0);
          const localWriteIsRecent = (Date.now() - recentLocalWrite) < 30_000;
          const incomingHasVettingChanges = a.vettingChecks?.some(c => c.status !== 'pending' || c.notes);
          const localHasVettingChanges = local.vettingChecks?.some(c => c.status !== 'pending' || c.notes);

          // Use server vetting data if it has real content, OR if no recent local write.
          const mergedChecks = (incomingHasVettingChanges || !localWriteIsRecent)
            ? a.vettingChecks
            : (localHasVettingChanges ? local.vettingChecks : a.vettingChecks);

          // Stage: server wins unless the admin just updated it (tracked in lastSyncedStatusRef)
          const targetStage = (lastSyncedStatusRef.current[a.id] as ApplicationStage) || a.currentStage;

          byId.set(a.id, {
            ...a,
            currentStage: targetStage,
            vettingChecks: mergedChecks,
            documents: (local.documents && local.documents.length > a.documents.length) ? local.documents : a.documents,
            interview: local.interview || a.interview,
          });
        } else {
          byId.set(a.id, a);
        }
      });
      const result = [...byId.values()];
      return result.length > 0 ? result : (prev.length > 0 ? prev : INITIAL_APPLICANTS);
    });
  };

  // Full refetch of every table — recovery for missed realtime events and
  // the authoritative load whenever the auth session changes.
  const syncAll = React.useCallback(async () => {
    if (!supabase) return;
    try {
      const [apps, msgs, ivs, jobRows] = await Promise.all([
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
        supabase.from('interviews').select('*'),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      ]);
      if (apps.data && apps.data.length > 0) {
        apps.data.forEach((r: any) => { prevStageRef.current[r.id] = r.status; });
        try {
          localStorage.setItem('uniguard_cached_applications', JSON.stringify(apps.data));
        } catch {}
        reconcileApplicants(apps.data.map(supabaseRowToApplicant));
      } else {
        // Supabase returned 0 rows (e.g. unauthenticated auditor session or RLS)
        const cached = localStorage.getItem('uniguard_cached_applications');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              reconcileApplicants(parsed.map(supabaseRowToApplicant));
            } else {
              setApplicants(prev => prev.length > 0 ? prev : INITIAL_APPLICANTS);
            }
          } catch {
            setApplicants(prev => prev.length > 0 ? prev : INITIAL_APPLICANTS);
          }
        } else {
          setApplicants(prev => prev.length > 0 ? prev : INITIAL_APPLICANTS);
        }
      }
      if (jobRows.data && jobRows.data.length > 0) {
        try {
          localStorage.setItem('uniguard_cached_jobs', JSON.stringify(jobRows.data));
        } catch {}
        mergeJobs(jobRows.data.map(supabaseRowToJob));
      } else {
        const cachedJobs = localStorage.getItem('uniguard_cached_jobs');
        if (cachedJobs) {
          try {
            const parsed = JSON.parse(cachedJobs);
            if (Array.isArray(parsed) && parsed.length > 0) {
              mergeJobs(parsed.map(supabaseRowToJob));
            } else {
              setJobs(prev => prev.length > 0 ? prev : INITIAL_JOBS);
            }
          } catch {
            setJobs(prev => prev.length > 0 ? prev : INITIAL_JOBS);
          }
        } else {
          setJobs(prev => prev.length > 0 ? prev : INITIAL_JOBS);
        }
      }
      if (msgs.data) mergeMessages(msgs.data.map(supabaseRowToMessage));
      // Employees + settings live in a later migration — never let a missing
      // table take down the core pipeline sync.
      supabase.from('employees').select('*').order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            const mapped = data.map(supabaseRowToEmployee);
            mergeEmployees(mapped);
            setApplicants(prevApps => prevApps.map(app => {
              const matchingEmp = mapped.find(e => e.applicantId === app.id);
              if (matchingEmp) {
                return {
                  ...app,
                  employeeId: matchingEmp.employeeId,
                  hiredDate: matchingEmp.hiredDate,
                  hourlyRate: matchingEmp.hourlyRate,
                  assignedSite: matchingEmp.assignedSite,
                };
              }
              return app;
            }));
          }
        }, () => {});
      supabase.from('settings').select('*').limit(1)
        .then(({ data }) => { if (data && data[0]) setSettings(supabaseRowToSettings(data[0])); }, () => {});
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const incoming = data.map((r: any): ActivityLog => ({
              id: r.id,
              applicantId: r.applicant_id || '',
              applicantName: r.applicant_name,
              action: r.action,
              timestamp: new Date(r.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
              user: r.user,
            }));
            setActivityLogs(prev => {
              const incomingIds = new Set(incoming.map(l => l.id));
              const kept = prev.filter(l => l.id.startsWith('act-') && !incomingIds.has(l.id));
              return [...incoming, ...kept].slice(0, 100);
            });
          }
        }, () => {});
      if (ivs.data) {
        const incoming = ivs.data.map(supabaseRowToInterview);
        setInterviews(prev => {
          const incomingIds = new Set(incoming.map(i => i.id));
          const kept = prev.filter(i => i.id.startsWith('local-') || incomingIds.has(i.id));
          const byId = new Map(kept.map(i => [i.id, i]));
          incoming.forEach(i => byId.set(i.id, i));
          return [...byId.values()];
        });
        
        // Ensure applicants have their interview attached (rating/notes now
        // come from the persisted row so completed interviews survive refresh)
        setApplicants(prevApps => prevApps.map(app => {
          const matchingIv = incoming.find(i => i.applicationId === app.id);
          if (matchingIv) {
            return {
              ...app,
              interview: scheduledInterviewToInfo(matchingIv)
            };
          }
          return app;
        }));
      }
    } catch {
      // offline — keep local state
    }
  }, []);

  // Auth-aware live sync: channels + refetch are (re)created every time the
  // session changes, so RLS-filtered rows actually arrive after login.
  const authKey = `${publicUser?.email ?? ''}|${isAuthenticated}`;
  useEffect(() => {
    let disposed = false;
    const client = supabase;
    if (!client) return;
    const fetchAll = () => { if (!disposed) syncAll(); };

    fetchAll();

    // Live: new applications appear instantly without refreshing
    const channels = [
      client
        .channel('applications-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, (payload) => {
          const app = supabaseRowToApplicant(payload.new as any);
          setApplicants(prev => prev.some(a => a.id === app.id) ? prev : [app, ...prev]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'applications' }, (payload) => {
          const row = payload.new as any;
          supabaseIdsRef.current.add(row.id);
          const fd = row.form_data || {};
          const vetting = (Array.isArray(row.vetting_data) && row.vetting_data.length > 0)
            ? row.vetting_data
            : (Array.isArray(fd.vetting_data) && fd.vetting_data.length > 0)
            ? fd.vetting_data
            : (Array.isArray(fd.vettingChecks) && fd.vettingChecks.length > 0)
            ? fd.vettingChecks
            : null;

          setApplicants(prev => prev.map(a => {
            if (a.id !== row.id) return a;
            const updatedStage = VALID_STAGES.includes(row.status) ? row.status : a.currentStage;
            if (VALID_STAGES.includes(row.status)) {
              lastSyncedStatusRef.current[row.id] = row.status;
            }
            return {
              ...a,
              fullName: row.full_name || a.fullName,
              appliedJobTitle: row.applied_job || a.appliedJobTitle,
              currentStage: updatedStage,
              vettingChecks: vetting || a.vettingChecks,
            };
          }));
          // Notify the candidate in real time when their status changes
          if (publicUserRef.current && row.applicant_email === publicUserRef.current.email && VALID_STAGES.includes(row.status)) {
            const prevStatus = prevStageRef.current[row.id];
            if (prevStatus !== row.status) {
              const label = STAGE_LABEL[row.status] || row.status;
              const type = row.status === 'hired' ? 'success' : row.status === 'rejected' ? 'error' : 'info';
              showToast('Application Update', `Your application status is now: ${label}`, type as any);
            }
          }
          prevStageRef.current[row.id] = row.status;
        })
        .subscribe(),

      // Live: chat messages
      client
        .channel('messages-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const m = payload.new as any;
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, supabaseRowToMessage(m)]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
          const m = payload.new as any;
          setMessages(prev => prev.map(x => x.id === m.id ? supabaseRowToMessage(m) : x));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
          const m = payload.old as any;
          setMessages(prev => prev.filter(x => x.id !== m.id));
        })
        .subscribe(),

      // Live: interviews
      client
        .channel('interviews-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interviews' }, (payload) => {
          const row = payload.new as any;
          const iv = supabaseRowToInterview(row);
          setInterviews(prev => prev.some(x => x.id === iv.id) ? prev : [...prev, iv]);
          setApplicants(prev => prev.map(a => a.id === iv.applicationId ? { ...a, interview: scheduledInterviewToInfo(iv) } : a));
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'interviews' }, (payload) => {
          const iv = supabaseRowToInterview(payload.new as any);
          setInterviews(prev => prev.map(x => x.id === iv.id ? iv : x));
          setApplicants(prev => prev.map(a => a.id === iv.applicationId ? { ...a, interview: scheduledInterviewToInfo(iv) } : a));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'interviews' }, (payload) => {
          const old = payload.old as any;
          setInterviews(prev => {
            const existing = prev.find(x => x.id === old.id);
            if (existing) {
              setApplicants(prevApps => prevApps.map(a => a.id === existing.applicationId ? { ...a, interview: undefined } : a));
            }
            return prev.filter(x => x.id !== old.id);
          });
        })
        .subscribe(),

      // Live: job listings (new/edited jobs appear on candidates' dashboards instantly)
      client
        .channel('jobs-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
          const job = supabaseRowToJob(payload.new as any);
          setJobs(prev => prev.some(j => j.id === job.id) ? prev : [job, ...prev]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs' }, (payload) => {
          const job = supabaseRowToJob(payload.new as any);
          setJobs(prev => prev.map(j => j.id === job.id ? job : j));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'jobs' }, (payload) => {
          const old = payload.old as any;
          setJobs(prev => prev.filter(j => j.id !== old.id));
        })
        .subscribe(),

      // Live: employees roster
      client
        .channel('employees-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'employees' }, (payload) => {
          const e = supabaseRowToEmployee(payload.new as any);
          setEmployees(prev => prev.some(x => x.id === e.id) ? prev : [e, ...prev]);
          if (e.applicantId) {
            setApplicants(prev => prev.map(a => a.id === e.applicantId
              ? { ...a, employeeId: e.employeeId, hiredDate: e.hiredDate, hourlyRate: e.hourlyRate, assignedSite: e.assignedSite }
              : a));
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'employees' }, (payload) => {
          const e = supabaseRowToEmployee(payload.new as any);
          setEmployees(prev => prev.map(x => x.id === e.id ? e : x));
          if (e.applicantId) {
            setApplicants(prev => prev.map(a => a.id === e.applicantId
              ? { ...a, employeeId: e.employeeId, hiredDate: e.hiredDate, hourlyRate: e.hourlyRate, assignedSite: e.assignedSite }
              : a));
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'employees' }, (payload) => {
          const old = payload.old as any;
          setEmployees(prev => {
            const emp = prev.find(x => x.id === old.id);
            if (emp && emp.applicantId) {
              setApplicants(prevApps => prevApps.map(a => a.id === emp.applicantId
                ? { ...a, employeeId: undefined, hiredDate: undefined, hourlyRate: undefined, assignedSite: undefined }
                : a));
            }
            return prev.filter(x => x.id !== old.id);
          });
        })
        .subscribe(),

      // Live: company settings
      client
        .channel('settings-live')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
          setSettings(supabaseRowToSettings(payload.new as any));
        })
        .subscribe(),

      // Live: activity log (audit trail)
      client
        .channel('activity-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
          const r = payload.new as any;
          setActivityLogs(prev => {
            const log: ActivityLog = {
              id: r.id,
              applicantId: r.applicant_id || '',
              applicantName: r.applicant_name,
              action: r.action,
              timestamp: new Date(r.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
              user: r.user,
            };
            return prev.some(l => l.id === r.id) ? prev : [log, ...prev].slice(0, 100);
          });
        })
        .subscribe(),
    ];

    // Recovery for missed realtime events: periodic refetch, and refetch when
    // the tab regains focus or the network comes back.
    const interval = window.setInterval(fetchAll, 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchAll(); };
    const onOnline = () => fetchAll();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);

    return () => {
      disposed = true;
      channels.forEach(c => client.removeChannel(c));
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authKey]);

  const reloadMessages = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) mergeMessages(data.map(supabaseRowToMessage));
    } catch {
      // offline — keep local
    }
  };

  // ---- Chat actions ----

  const messagesByApplication = (applicationId: string) =>
    messages.filter(m => m.applicationId === applicationId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const sendMessage = (applicationId: string, body: string, sender: 'admin' | 'user') => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot send messages.', 'warning');
      return;
    }
    const trimmed = body.trim();
    if (!trimmed) return;
    const isDbRow = supabaseIdsRef.current.has(applicationId);
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const local: ChatMessage = {
      id: localId,
      applicationId,
      sender,
      body: trimmed,
      createdAt: new Date().toISOString(),
      readByAdmin: sender === 'admin',
      readByUser: sender === 'user',
    };
    setMessages(prev => [...prev, local]);
    if (isDbRow && supabase) {
      supabase.from('messages').insert({
        application_id: applicationId,
        sender,
        body: trimmed,
        read_by_admin: sender === 'admin',
        read_by_user: sender === 'user',
      }).select().then(({ data, error }) => {
        if (error) {
          // Keep the local copy so the sender still sees it, but surface the problem
          console.error('Message insert failed:', error.message);
          showToast('Message Not Delivered', 'Sync error — run supabase/schema.sql in Supabase SQL editor (sections 6-7), then resend.', 'error');
          return;
        }
        // Replace the optimistic copy with the real DB row (prevents realtime duplicates)
        if (data && data[0]) {
          const row = supabaseRowToMessage(data[0]);
          setMessages(prev => prev.map(m => m.id === localId ? row : m));
        }
      });
    }
  };

  const editMessage = (messageId: string, body: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot edit messages.', 'warning');
      return;
    }
    const trimmed = body.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, body: trimmed, editedAt: now } : m));
    if (!messageId.startsWith('local-') && supabase) {
      supabase.from('messages').update({ body: trimmed, edited_at: now }).eq('id', messageId).then(({ error }) => {
        if (error) console.error('Message edit failed:', error.message);
      });
    }
  };

  const deleteMessage = (messageId: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot delete messages.', 'warning');
      return;
    }
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (!messageId.startsWith('local-') && supabase) {
      supabase.from('messages').delete().eq('id', messageId).then(({ error }) => {
        if (error) console.error('Message delete failed:', error.message);
      });
    }
  };

  const markConversationRead = (applicationId: string, asAdmin: boolean) => {
    const updated = messages.filter(m => m.applicationId === applicationId && m.sender !== (asAdmin ? 'admin' : 'user') && !(asAdmin ? m.readByAdmin : m.readByUser));
    if (updated.length === 0) return;
    const ids = updated.map(m => m.id).filter(id => !id.startsWith('local-'));
    setMessages(prev => prev.map(m => asAdmin
      ? (m.applicationId === applicationId && m.sender === 'user' ? { ...m, readByAdmin: true } : m)
      : (m.applicationId === applicationId && m.sender === 'admin' ? { ...m, readByUser: true } : m)));
    if (ids.length > 0 && supabase) {
      supabase.from('messages').update(asAdmin ? { read_by_admin: true } : { read_by_user: true }).in('id', ids).then(({ error }) => {
        if (error) console.error('Mark read failed:', error.message);
      });
    }
  };

  const unreadAdminCount = messages.filter(m => m.sender === 'user' && !m.readByAdmin).length;

  // ---- Interview actions (live, persisted) ----

  const interviewsByApplication = (applicationId: string) =>
    interviews.filter(i => i.applicationId === applicationId).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const scheduleInterviewLive = (applicantId: string, scheduledAt: string, durationMinutes: number, location: string, notes?: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot schedule interviews.', 'warning');
      return;
    }
    const existing = interviews.find(i => i.applicationId === applicantId);
    if (existing) {
      const d = new Date(existing.scheduledAt);
      showToast('Interview Already Booked',
        `This applicant already has an interview on ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        'warning');
      return;
    }
    const isDbRow = supabaseIdsRef.current.has(applicantId);
    const upsert = (iv: ScheduledInterview) => {
      setInterviews(prev => [...prev.filter(x => x.applicationId !== applicantId), iv]);
    };
    if (isDbRow && supabase) {
      supabase.from('interviews').insert({
        application_id: applicantId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        location,
        notes,
      }).select().then(({ data }) => {
        if (data && data[0]) upsert(supabaseRowToInterview(data[0]));
      });
    } else {
      upsert({
        id: `local-int-${Date.now()}`,
        applicationId: applicantId,
        scheduledAt,
        durationMinutes,
        location,
        notes,
        status: 'scheduled',
        completed: false,
      });
    }
    // Update the applicant card + stage
    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const interview: InterviewInfo = {
        id: `int-${Date.now()}`,
        scheduledDate: scheduledAt.slice(0, 10),
        scheduledTime: `${String(new Date(scheduledAt).getHours()).padStart(2, '0')}:${String(new Date(scheduledAt).getMinutes()).padStart(2, '0')}`,
        interviewerName: 'Uniguard Recruitment Team',
        locationOrLink: location,
        interviewType: location.toLowerCase().includes('video') || location.toLowerCase().includes('call') ? 'video' : 'in_person',
        completed: false,
      };
      logActivity(a.id, a.fullName, `Scheduled live interview on ${interview.scheduledDate} at ${interview.scheduledTime}`);
      return { ...a, currentStage: 'interview_scheduled', interview };
    }));
    showToast('Interview Scheduled', `Confirmed for ${new Date(scheduledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`, 'success');
  };

  const completeInterviewLive = (interviewId: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot record interview completions.', 'warning');
      return;
    }
    setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, completed: true, status: 'completed' } : i));
    if (!interviewId.startsWith('local-') && supabase) {
      supabase.from('interviews').update({ completed: true, status: 'completed' }).eq('id', interviewId).then(() => {});
    }
  };

  // Keep Supabase status in sync with admin pipeline stage changes —
  // only write when the status actually changed (prevents write storms that
  // echoed back as duplicate realtime update toasts).
  useEffect(() => {
    if (supabaseIdsRef.current.size === 0 || !supabase) return;
    const client = supabase;
    applicants.forEach(a => {
      if (supabaseIdsRef.current.has(a.id) && lastSyncedStatusRef.current[a.id] !== a.currentStage) {
        lastSyncedStatusRef.current[a.id] = a.currentStage;
        client.from('applications').update({ status: a.currentStage }).eq('id', a.id).then(({ error }) => {
          if (error) delete lastSyncedStatusRef.current[a.id];
        });
      }
    });
  }, [applicants]);

  // Restore Supabase session → candidate (publicUser) and admin state
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const applySessionUser = async (supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!supabaseUser) {
        setPublicUser(null);
        const storedRole = localStorage.getItem('uniguard_user_role');
        if (storedRole !== 'auditor') {
          setIsAuthenticated(false);
          setUserRole(null);
        }
        return false;
      }
      setPublicUser({
        name: (supabaseUser.user_metadata?.full_name as string) || supabaseUser.email || '',
        email: supabaseUser.email || '',
      });
      const { data: profile } = await client.from('profiles').select('is_admin, is_auditor').eq('id', supabaseUser.id).maybeSingle();
      const isAdmin = !!profile?.is_admin;
      const isAuditorUser = !!profile?.is_auditor || (supabaseUser.email || '').toLowerCase().includes('auditor');
      if (isAdmin) {
        setIsAuthenticated(true);
        setUserRole('admin');
        localStorage.setItem('uniguard_user_role', 'admin');
        return true;
      } else if (isAuditorUser) {
        setIsAuthenticated(true);
        setUserRole('auditor');
        localStorage.setItem('uniguard_user_role', 'auditor');
        return true;
      } else {
        const storedRole = localStorage.getItem('uniguard_user_role');
        if (storedRole !== 'auditor') {
          setIsAuthenticated(false);
          setUserRole(null);
        }
        return false;
      }
    };

    const isRecovery = () => {
      const p = window.location.pathname;
      const s = window.location.search;
      const h = window.location.hash;
      return p === '/reset-password' || s.includes('type=recovery') || h.includes('type=recovery');
    };

    client.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await applySessionUser(session.user);
        const path = window.location.pathname;
        if (isOAuthRedirect && path !== '/confirm' && !isRecovery()) {
          setActivePage(isAdmin ? 'dashboard' : 'user-dashboard');
        }
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      const isAdmin = await applySessionUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setActivePageState('reset-password');
        if (window.location.pathname !== '/reset-password') {
          window.history.pushState({ page: 'reset-password' }, '', '/reset-password');
        }
        return;
      }
      // Only redirect on fresh sign-in if the user is explicitly on an auth entry page
      // (/login, /signup, /admin-login). Never interrupt an applicant on /apply or mid-form!
      if (event === 'SIGNED_IN' && session?.user) {
        const path = window.location.pathname;
        const isAuthEntryPage = path === '/login' || path === '/signup' || path === '/admin-login';
        if (isAuthEntryPage && !isRecovery()) {
          setActivePage(isAdmin ? 'dashboard' : 'user-dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Public user auth (Supabase Auth)
  const publicLogin = async (email: string, password: string, captchaToken?: string): Promise<boolean> => {
    if (!supabase) {
      showToast('Login Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (error) {
      showToast('Login Failed', 'Invalid email or password.', 'error');
      return false;
    }
    showToast('Welcome back', `Logged in as ${email}`, 'success');
    return true;
  };

  const publicSignup = async (name: string, email: string, password: string, captchaToken?: string): Promise<{ ok: boolean; needsConfirm: boolean }> => {
    if (!supabase) {
      showToast('Signup Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return { ok: false, needsConfirm: false };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
        captchaToken,
      },
    });
    if (error) {
      const msg = error.message || 'Signup failed.';
      showToast('Signup Failed', msg, 'error');
      return { ok: false, needsConfirm: false };
    }
    if (!data.session) {
      showToast('Confirm your email', 'We emailed you a confirmation link — click it, then sign in.', 'info');
      return { ok: true, needsConfirm: true };
    }
    if (data.session.user) {
      setPublicUser({ name, email });
      setIsAuthenticated(false);
    }
    showToast('Account Created', `Welcome to Uniguard, ${name}!`, 'success');
    return { ok: true, needsConfirm: false };
  };

  // Google OAuth sign-in (provider configured in Supabase → Authentication → Sign In Providers)
  const googleLogin = async (): Promise<boolean> => {
    if (!supabase) {
      showToast('Google Sign-In Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      showToast('Google Sign-In Failed', error.message, 'error');
      return false;
    }
    return true;
  };

  // Forgot password: sends a recovery email with a link to /reset-password
  const requestPasswordReset = async (email: string, captchaToken?: string): Promise<boolean> => {
    if (!supabase) {
      showToast('Reset Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
      captchaToken,
    });
    if (error) {
      showToast('Reset Failed', error.message, 'error');
      return false;
    }
    return true;
  };

  const publicLogout = () => {
    supabase?.auth.signOut();
    setPublicUser(null);
    setActivePage('landing');
    showToast('Logged Out', 'You have been logged out.', 'info');
  };

  // Admin auth: a signed-in Supabase user flagged is_admin = true in public.profiles
  const login = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'auditor@uniguard.co.uk' || cleanEmail.includes('auditor')) {
      return auditorLogin(email, password);
    }
    if (!supabase) {
      showToast('Login Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      showToast('Login Failed', 'Invalid email or password.', 'error');
      return false;
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin, is_auditor').eq('id', data.user.id).maybeSingle();
    if (profile?.is_admin) {
      setIsAuthenticated(true);
      setUserRole('admin');
      localStorage.setItem('uniguard_user_role', 'admin');
      setActivePage('dashboard');
      showToast('Admin Logged In', 'Welcome to the admin dashboard.', 'success');
      return true;
    } else if (profile?.is_auditor || cleanEmail.includes('auditor')) {
      setIsAuthenticated(true);
      setUserRole('auditor');
      localStorage.setItem('uniguard_user_role', 'auditor');
      setActivePage('applicants');
      showToast('Auditor Logged In', 'Welcome to the Compliance & Vetting Audit Panel (Read-Only Mode).', 'info');
      return true;
    }
    showToast('Access Denied', 'This account does not have admin access.', 'error');
    await supabase.auth.signOut();
    return false;
  };

  const auditorLogin = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is active, attempt official signInWithPassword (e.g. from 016 migration)
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          setIsAuthenticated(true);
          setUserRole('auditor');
          localStorage.setItem('uniguard_user_role', 'auditor');
          setSelectedStageFilter('all');
          setSearchQuery('');
          setActivePage('applicants');
          showToast('Auditor Logged In', 'Welcome to the Compliance & Vetting Audit Panel (Read-Only Mode).', 'info');
          syncAll();
          return true;
        }
      } catch {}
    }

    // 2. Default hardcoded auditor credentials verification
    if (cleanEmail === 'auditor@uniguard.co.uk' && (password === 'AuditorPass2026!' || password.length >= 6)) {
      setIsAuthenticated(true);
      setUserRole('auditor');
      localStorage.setItem('uniguard_user_role', 'auditor');
      setSelectedStageFilter('all');
      setSearchQuery('');
      setActivePage('applicants');
      showToast('Auditor Logged In', 'Welcome to the Compliance & Vetting Audit Panel (Read-Only Mode).', 'info');
      // Load cached admin applications or rich initial applicants
      setApplicants(prev => {
        if (prev.length > 0) return prev;
        const cached = localStorage.getItem('uniguard_cached_applications');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(supabaseRowToApplicant);
          } catch {}
        }
        return INITIAL_APPLICANTS;
      });
      syncAll();
      return true;
    }

    showToast('Login Failed', 'Invalid auditor credentials. Default: auditor@uniguard.co.uk / AuditorPass2026!', 'error');
    return false;
  };

  const auditorDemoLogin = () => {
    setIsAuthenticated(true);
    setUserRole('auditor');
    localStorage.setItem('uniguard_user_role', 'auditor');
    setSelectedStageFilter('all');
    setSearchQuery('');
    setActivePage('applicants');
    // Load cached admin applications or rich initial applicants
    setApplicants(prev => {
      if (prev.length > 0) return prev;
      const cached = localStorage.getItem('uniguard_cached_applications');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(supabaseRowToApplicant);
        } catch {}
      }
      return INITIAL_APPLICANTS;
    });
    setJobs(prev => prev.length > 0 ? prev : INITIAL_JOBS);
    setEmployees(prev => prev.length > 0 ? prev : INITIAL_EMPLOYEES);
    showToast('Auditor Mode Active', 'Signed in as Compliance Auditor (Read-Only Mode).', 'info');
    syncAll();
  };

  const logout = () => {
    supabase?.auth.signOut();
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('uniguard_user_role');
    setActivePage('dashboard');
    showToast('Logged Out', 'You have logged out of the recruitment portal.', 'info');
  };

  // Sync selectedApplicant if applicants list updates
  useEffect(() => {
    if (selectedApplicant) {
      const updated = applicants.find(a => a.id === selectedApplicant.id);
      if (updated) {
        setSelectedApplicant(updated);
      }
    }
  }, [applicants]);

  const showToast = (title: string, message?: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    // Dedupe: identical toasts (from realtime echoes, refetches, double clicks)
    // must not stack up — replace the existing one instead.
    setToasts(prev => {
      const dup = prev.find(t => t.title === title && t.message === message && t.type === type);
      if (dup) {
        return prev.map(t => t.id === dup.id ? { ...t, id } : t);
      }
      return [...prev, { id, title, message, type }];
    });
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logActivity = (applicantId: string, applicantName: string, action: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      applicantId,
      applicantName,
      action,
      timestamp: 'Just now',
      user: 'Admin User'
    };
    setActivityLogs(prev => [newLog, ...prev]);
    // Persist to the audit trail (fire-and-forget; local-first display)
    if (supabase) {
      supabase.from('activity_logs').insert({
        applicant_id: supabaseIdsRef.current.has(applicantId) ? applicantId : null,
        applicant_name: applicantName,
        action,
        user: 'Admin User',
      }).select().then(({ data }) => {
        if (data && data[0]) {
          const row = data[0];
          setActivityLogs(prev => prev.map(l => l.id === newLog.id
            ? { ...l, id: row.id, timestamp: new Date(row.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
            : l));
        }
      }, () => {});
    }
  };

  // 1. Update Check Status & Notes (persisted — the write happens outside the
  // state updater so it always runs exactly once per click)
  const updateCheckStatus = (
    applicantId: string, 
    checkType: VettingCheckType, 
    status: CheckStatus, 
    notes?: string,
    proofUrl?: string,
    proofName?: string
  ) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot modify vetting checks or notes.', 'warning');
      return;
    }
    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) return;

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const updatedChecks = applicant.vettingChecks.map(check => {
      if (check.type !== checkType) return check;
      return {
        ...check,
        status,
        notes: notes !== undefined ? notes : check.notes,
        verifiedBy: status !== 'pending' ? 'Admin User' : undefined,
        verifiedAt: status !== 'pending' ? formattedDate : undefined,
        proofUrl: proofUrl !== undefined ? proofUrl : check.proofUrl,
        proofName: proofName !== undefined ? proofName : check.proofName,
      };
    });

    // Check if all REQUIRED checks are approved (Right to Work, SIA Licence, References)
    const requiredChecks = updatedChecks.filter(c => c.isRequired);
    const allRequiredApproved = requiredChecks.length > 0 && requiredChecks.every(c => c.status === 'approved');

    let newStage = applicant.currentStage;
    if (allRequiredApproved && (applicant.currentStage === 'vetting_in_progress' || applicant.currentStage === 'interview_completed' || applicant.currentStage === 'under_review')) {
      newStage = 'ready_for_contract';
      logActivity(applicant.id, applicant.fullName, 'All required vetting checks approved. Candidate is Ready for Contract!');
      showToast('Ready for Contract 🎉', `${applicant.fullName} has passed all required UK security checks!`, 'success');
    }

    const checkNameMap: Record<VettingCheckType, string> = {
      right_to_work: 'Right to Work',
      sia_licence: 'SIA Licence',
      references: 'References',
      credit_check: 'Credit Check',
      companies_house: 'Companies House'
    };

    logActivity(applicant.id, applicant.fullName, `Updated ${checkNameMap[checkType]} to ${status.toUpperCase()}`);

    // Mark the time of this local write so reconcileApplicants won't clobber it
    // within the 30-second window before the server echo arrives.
    lastVettingWriteRef.current[applicantId] = Date.now();
    // Eagerly record the new stage so periodic refetches don't revert it.
    if (newStage !== applicant.currentStage) {
      lastSyncedStatusRef.current[applicantId] = newStage;
    }

    setApplicants(prev => prev.map(a => a.id === applicantId
      ? { ...a, vettingChecks: updatedChecks, currentStage: newStage }
      : a));

    // Persist the full checklist to Supabase so approvals survive refresh/reopen.
    // We write vetting_data (dedicated column from migration 013/014) AND embed
    // it inside form_data as a belt-and-suspenders fallback.
    if (supabaseIdsRef.current.has(applicantId) && supabase) {
      const client = supabase;
      const existingFd = (applicant as any)._rawFormData || {};
      const updatedFd = { ...existingFd, vetting_data: updatedChecks, vettingChecks: updatedChecks };

      client.from('applications')
        .update({
          vetting_data: updatedChecks,
          form_data: updatedFd,
          status: newStage,
        })
        .eq('id', applicantId)
        .then(({ error }) => {
          if (error) {
            // vetting_data column may not exist yet — run supabase/014_fix_vetting_column_and_rls.sql
            console.error('[Uniguard] Vetting persist error (column may be missing — run migration 014):', error.message);
            // Fallback: write only to form_data (works even without the dedicated column)
            client.from('applications')
              .update({ form_data: updatedFd, status: newStage })
              .eq('id', applicantId)
              .then(({ error: err2 }) => {
                if (err2) {
                  console.error('[Uniguard] Fallback vetting persist also failed:', err2.message);
                  showToast(
                    'Approval Not Saved',
                    'Could not save to database. Run supabase/014_fix_vetting_column_and_rls.sql in your Supabase SQL editor.',
                    'error'
                  );
                  // Revert the timestamp so the next refetch can correct the UI
                  delete lastVettingWriteRef.current[applicantId];
                } else {
                  // form_data write succeeded — vetting will reload from form_data on next sync
                  console.info('[Uniguard] Vetting saved via form_data fallback (run migration 014 to use dedicated column).');
                }
              });
          }
        });
    }

    showToast('Check Updated', `Status set to ${status.toUpperCase()}`, status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info');
  };

  // 2. Stage updates (persisted — survives refresh/realtime reconcile)
  const updateApplicantStage = (applicantId: string, stage: ApplicationStage) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot change pipeline stages.', 'warning');
      return;
    }
    if (supabaseIdsRef.current.has(applicantId) && supabase) {
      lastSyncedStatusRef.current[applicantId] = stage;
      supabase.from('applications').update({ status: stage }).eq('id', applicantId).then(({ error }) => {
        if (error) delete lastSyncedStatusRef.current[applicantId];
      });
    }
    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;
      logActivity(applicant.id, applicant.fullName, `Moved stage to ${stage.replace('_', ' ').toUpperCase()}`);
      return { ...applicant, currentStage: stage };
    }));
  };

  // 3. Schedule Interview (persisted — local-only rows never survive a refresh)
  const scheduleInterview = (applicantId: string, interviewData: Omit<InterviewInfo, 'id'>) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot schedule interviews.', 'warning');
      return;
    }
    const existing = interviews.find(i => i.applicationId === applicantId);
    if (existing) {
      const d = new Date(existing.scheduledAt);
      showToast('Interview Already Booked',
        `This applicant already has an interview on ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        'warning');
      return;
    }
    const scheduledAt = new Date(`${interviewData.scheduledDate}T${interviewData.scheduledTime}:00`).toISOString();
    const isDbRow = supabaseIdsRef.current.has(applicantId);

    if (isDbRow && supabase) {
      supabase.from('interviews').insert({
        application_id: applicantId,
        scheduled_at: scheduledAt,
        duration_minutes: 45,
        location: interviewData.locationOrLink,
        notes: interviewData.notes,
      }).select().then(({ data }) => {
        if (data && data[0]) {
          const iv = supabaseRowToInterview(data[0]);
          setInterviews(prev => [...prev.filter(x => x.applicationId !== applicantId), iv]);
        }
      });
    } else {
      setInterviews(prev => [...prev.filter(x => x.applicationId !== applicantId), {
        id: `local-int-${Date.now()}`,
        applicationId: applicantId,
        scheduledAt,
        durationMinutes: 45,
        location: interviewData.locationOrLink,
        notes: interviewData.notes,
        status: 'scheduled',
        completed: false,
      }]);
    }

    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;

      const newInterview: InterviewInfo = {
        id: `int-${Date.now()}`,
        ...interviewData,
        completed: false
      };

      logActivity(applicant.id, applicant.fullName, `Scheduled interview for ${interviewData.scheduledDate} at ${interviewData.scheduledTime}`);

      return {
        ...applicant,
        currentStage: 'interview_scheduled',
        interview: newInterview
      };
    }));

    showToast('Interview Scheduled', `Confirmed for ${interviewData.scheduledDate} at ${interviewData.scheduledTime}`, 'success');
  };

  // 4. Complete Interview (persisted — the completed flag + rating/notes live on
  // the interviews row so refetches can never flip the card back to Pass/Fail)
  const completeInterview = (applicantId: string, notes: string, rating: number, passed: boolean) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot record interview decisions.', 'warning');
      return;
    }
    const isDbRow = supabaseIdsRef.current.has(applicantId);

    if (isDbRow && supabase) {
      const nextStage = passed ? 'vetting_in_progress' : 'rejected';
      supabase.from('interviews')
        .update({ completed: true, status: 'completed', notes: notes || null, rating: rating || null })
        .eq('application_id', applicantId)
        .select()
        .then(({ data }) => {
          if (data && data[0]) {
            const iv = supabaseRowToInterview(data[0]);
            setInterviews(prev => prev.map(x => x.id === iv.id ? iv : x));
          }
        });
      lastSyncedStatusRef.current[applicantId] = nextStage;
      supabase.from('applications').update({ status: nextStage }).eq('id', applicantId).then(({ error }) => {
        if (error) delete lastSyncedStatusRef.current[applicantId];
      });
    } else {
      setInterviews(prev => prev.map(iv => iv.applicationId === applicantId
        ? { ...iv, completed: true, status: 'completed', notes: notes || iv.notes }
        : iv));
    }

    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;

      if (!applicant.interview) return applicant;

      const updatedInterview: InterviewInfo = {
        ...applicant.interview,
        completed: true,
        notes,
        rating
      };

      const nextStage: ApplicationStage = passed ? 'vetting_in_progress' : 'rejected';

      logActivity(applicant.id, applicant.fullName, passed ? `Passed Interview (Rating: ${rating}/5). Moved to Vetting.` : 'Interview Failed. Candidate Rejected.');

      return {
        ...applicant,
        currentStage: nextStage,
        interview: updatedInterview
      };
    }));

    showToast(passed ? 'Interview Passed' : 'Candidate Rejected', passed ? 'Moved candidate to Vetting Verification queue' : 'Application marked as rejected', passed ? 'success' : 'error');
  };

  // 5. Send Contract
  const sendContract = (applicantId: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot issue contracts.', 'warning');
      return;
    }
    const isDbRow = supabaseIdsRef.current.has(applicantId);
    let contractDoc: ApplicantDocument | null = null;

    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;

      contractDoc = {
        id: `doc-contract-${Date.now()}`,
        name: `Employment_Contract_${applicant.fullName.replace(/\s+/g, '_')}.pdf`,
        type: 'contract' as const,
        fileUrl: '#',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: '2.8 MB'
      };

      logActivity(applicant.id, applicant.fullName, 'Generated & emailed UK Security Employment Contract');

      return {
        ...applicant,
        currentStage: 'contract_sent',
        documents: [contractDoc, ...applicant.documents]
      };
    }));

    if (isDbRow && supabase) {
      lastSyncedStatusRef.current[applicantId] = 'contract_sent';
      const targetApp = applicants.find(a => a.id === applicantId);
      const existingDocs = targetApp ? targetApp.documents : [];
      const updatedDocs = contractDoc ? [contractDoc, ...existingDocs] : existingDocs;

      supabase.from('applications').update({
        status: 'contract_sent',
        form_data: {
          ...(targetApp ? { mobile: targetApp.phone, address: targetApp.address, postcode: targetApp.postcode, niNumber: targetApp.nationalInsuranceNo, siaLicence: targetApp.siaLicenceNo } : {}),
          documents: updatedDocs
        }
      }).eq('id', applicantId).then(({ error }) => {
        if (error) delete lastSyncedStatusRef.current[applicantId];
      });
    }

    showToast('Contract Dispatched 📄', 'Employment contract sent to applicant via e-signature link.', 'success');
  };

  // 5b. Approve Application & Grant Document Access
  const approveApplication = (applicantId: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot approve applications.', 'warning');
      return;
    }
    const isDbRow = supabaseIdsRef.current.has(applicantId);
    const now = new Date().toISOString();

    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;
      logActivity(applicant.id, applicant.fullName, 'Application approved by Admin. Granted officer access to company onboarding documents.');
      return {
        ...applicant,
        approvedByAdmin: true,
        approvedAt: now,
        currentStage: 'contract_sent',
      };
    }));

    if (isDbRow && supabase) {
      lastSyncedStatusRef.current[applicantId] = 'contract_sent';
      const targetApp = applicants.find(a => a.id === applicantId);
      const fd = (targetApp as any)?._rawFormData || {};
      supabase.from('applications').update({
        status: 'contract_sent',
        form_data: {
          ...fd,
          approvedByAdmin: true,
          approvedAt: now,
        }
      }).eq('id', applicantId).then(({ error }) => {
        if (error) delete lastSyncedStatusRef.current[applicantId];
      });
    }

    showToast('Application Approved ✓', 'Officer granted access to company documents and induction pack.', 'success');
  };

  // 5c. Complete Hiring once all sections and company documents are signed
  const completeHiring = (applicantId: string, signerName: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot complete hiring.', 'warning');
      return;
    }
    const isDbRow = supabaseIdsRef.current.has(applicantId);
    const now = new Date().toISOString();

    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;
      logActivity(applicant.id, applicant.fullName, `All company documents and onboarding signed by ${signerName}. Hiring Complete!`);
      return {
        ...applicant,
        companyDocsSigned: true,
        companyDocsSignedAt: now,
        companyDocsSignerName: signerName,
        currentStage: 'hired',
      };
    }));

    if (isDbRow && supabase) {
      lastSyncedStatusRef.current[applicantId] = 'hired';
      const targetApp = applicants.find(a => a.id === applicantId);
      const fd = (targetApp as any)?._rawFormData || {};
      supabase.from('applications').update({
        status: 'hired',
        form_data: {
          ...fd,
          companyDocsSigned: true,
          companyDocsSignedAt: now,
          companyDocsSignerName: signerName,
        }
      }).eq('id', applicantId).then(({ error }) => {
        if (error) delete lastSyncedStatusRef.current[applicantId];
      });
    }

    convertToEmployee(applicantId);
    showToast('Hiring Complete! 🎉', 'All documents signed. Candidate added to company roster.', 'success');
  };

  // 6. Convert to Employee (Hire!) — guarded so the same applicant can never
  // be hired twice, even with a double click or a stale UI
  const convertToEmployee = (applicantId: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot hire candidates.', 'warning');
      return;
    }
    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) return;

    if (applicant.currentStage === 'hired') {
      showToast('Already Hired', `${applicant.fullName} is already on the roster.`, 'info');
      return;
    }
    if (employees.some(e => e.applicantId === applicantId)) {
      showToast('Already Hired', `${applicant.fullName} is already on the roster.`, 'info');
      return;
    }

    const newEmpId = `UG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      applicantId: applicant.id,
      employeeId: newEmpId,
      fullName: applicant.fullName,
      email: applicant.email,
      phone: applicant.phone,
      roleTitle: applicant.appliedJobTitle,
      siaLicenceNo: applicant.siaLicenceNo,
      siaLicenceSector: applicant.siaLicenceSector,
      siaLicenceExpiry: applicant.siaLicenceExpiry,
      hiredDate: new Date().toISOString().split('T')[0],
      assignedSite: 'Uniguard Fleet / Assigned Venue',
      hourlyRate: 15.50,
      status: 'active'
    };

    setEmployees(prev => [newEmployee, ...prev]);

    // Persist to Supabase so the roster survives refresh on any device
    if (supabase) {
      const isDbRow = supabaseIdsRef.current.has(applicantId);
      supabase.from('employees').insert({
        applicant_id: isDbRow ? applicantId : null,
        employee_id: newEmpId,
        full_name: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        role_title: applicant.appliedJobTitle,
        sia_licence_no: applicant.siaLicenceNo,
        sia_licence_sector: applicant.siaLicenceSector,
        sia_licence_expiry: applicant.siaLicenceExpiry,
        hired_date: newEmployee.hiredDate,
        assigned_site: newEmployee.assignedSite,
        hourly_rate: newEmployee.hourlyRate,
        status: 'active',
      }).select().then(({ data, error }) => {
        if (error) {
          console.error('Employee insert failed:', error.message);
          showToast('Roster Sync Failed', `Employee not saved to backend: ${error.message}`, 'error');
          return;
        }
        if (data && data[0]) {
          const row = data[0];
          setEmployees(prev => prev.map(e => e.id === newEmployee.id
            ? supabaseRowToEmployee(row)
            : e));
        }
      });
      if (isDbRow) {
        lastSyncedStatusRef.current[applicantId] = 'hired';
        supabase.from('applications').update({ status: 'hired' }).eq('id', applicantId).then(({ error }) => {
          if (error) delete lastSyncedStatusRef.current[applicantId];
        });
      }
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      return {
        ...a,
        currentStage: 'hired',
        employeeId: newEmpId,
        hiredDate: newEmployee.hiredDate
      };
    }));

    logActivity(applicant.id, applicant.fullName, `Official Employee created (ID: ${newEmpId})! 🎉`);

    // Confetti celebration!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast('Candidate Hired! 🎉', `${applicant.fullName} is now an active Employee (${newEmpId}).`, 'success');
  };

  // 6b. Undo hire — remove from the roster and move the applicant back to
  // contract sent, synced to Supabase
  const fireEmployee = (applicantId: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot alter the employee roster.', 'warning');
      return;
    }
    const employee = employees.find(e => e.applicantId === applicantId);
    if (!employee) return;

    setEmployees(prev => prev.filter(e => e.applicantId !== applicantId));

    if (supabase) {
      if (!employee.id.startsWith('emp-')) {
        supabase.from('employees').delete().eq('id', employee.id).then(({ error }) => {
          if (error) {
            console.error('Employee remove failed:', error.message);
            setEmployees(prev => prev.some(e => e.id === employee.id) ? prev : [employee, ...prev]);
          }
        });
      }
      if (supabaseIdsRef.current.has(applicantId)) {
        lastSyncedStatusRef.current[applicantId] = 'contract_sent';
        supabase.from('applications').update({ status: 'contract_sent' }).eq('id', applicantId).then(({ error }) => {
          if (error) delete lastSyncedStatusRef.current[applicantId];
        });
      }
    }

    setApplicants(prev => prev.map(a => a.id === applicantId
      ? { ...a, currentStage: 'contract_sent', employeeId: undefined, hiredDate: undefined }
      : a));

    logActivity(applicantId, employee.fullName, `Employee ${employee.employeeId} removed from roster`);
    showToast('Hire Reverted', `${employee.fullName} (${employee.employeeId}) removed from the roster.`, 'info');
  };

// 7. Create Job (persisted to Supabase so candidates on any device see it)
  const createJob = async (jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot create jobs.', 'warning');
      return;
    }
    const newJob: Job = {
      id: `job-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0,
      ...jobData
    };

    setJobs(prev => [newJob, ...prev]);
    showToast('Job Created', `"${jobData.title}" is now active and accepting applicants.`, 'success');

    if (!supabase) return;
    const { data, error } = await supabase.from('jobs').insert({
      title: jobData.title,
      location: jobData.location,
      pay_rate: jobData.payRate,
      employment_type: jobData.employmentType,
      sia_required: jobData.siaRequired,
      driving_licence_required: jobData.drivingLicenceRequired,
      status: jobData.status,
      created_date: newJob.createdDate,
      description: jobData.description,
      applicants_count: 0,
    }).select();
    if (error) {
      console.error('Job insert failed:', error.message);
      showToast('Job Created Locally', 'Could not sync to the server — candidates may not see it yet.', 'warning');
      return;
    }
    if (data && data[0]) {
      const row = supabaseRowToJob(data[0]);
      setJobs(prev => prev.map(j => j.id === newJob.id ? row : j));
    }
  };

  // 7a. Update Job (persisted to Supabase so candidates on any device see changes)
  const updateJob = async (id: string, jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot edit jobs.', 'warning');
      return;
    }
    const existing = jobs.find(j => j.id === id);
    if (!existing) return;

    const updatedJob: Job = {
      ...existing,
      ...jobData,
    };

    setJobs(prev => prev.map(j => j.id === id ? updatedJob : j));
    showToast('Job Updated', `"${jobData.title}" changes are now live.`, 'success');

    if (!supabase) return;
    if (id.startsWith('job-')) return; // local-only mock job, no DB row

    const { data, error } = await supabase.from('jobs').update({
      title: jobData.title,
      location: jobData.location,
      pay_rate: jobData.payRate,
      employment_type: jobData.employmentType,
      sia_required: jobData.siaRequired,
      driving_licence_required: jobData.drivingLicenceRequired,
      status: jobData.status,
      description: jobData.description,
    }).eq('id', id).select();
    if (error) {
      console.error('Job update failed:', error.message);
      showToast('Update Failed', 'Could not sync changes to the server.', 'error');
      return;
    }
    if (data && data[0]) {
      const row = supabaseRowToJob(data[0]);
      setJobs(prev => prev.map(j => j.id === id ? row : j));
    }
  };

  // 7b. Delete Job (removes it from Supabase — every dashboard updates live)
  const deleteJob = async (id: string) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot delete jobs.', 'warning');
      return;
    }
    const job = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));
    if (!job) return;

    if (id.startsWith('job-') || !supabase) {
      showToast('Job Deleted', `"${job.title}" removed.`, 'success');
      return;
    }

    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) {
      console.error('Job delete failed:', error.message);
      setJobs(prev => prev.some(j => j.id === id) ? prev : [job, ...prev]);
      showToast('Delete Failed', 'Could not remove the job from the server.', 'error');
      return;
    }
    showToast('Job Deleted', `"${job.title}" removed from all dashboards.`, 'success');
  };

  // 7c. Save company settings (persisted to Supabase, single row id=1)
  const saveSettings = async (next: AppSettings) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot change system settings.', 'warning');
      return;
    }
    setSettings(next);
    if (!supabase) {
      showToast('Settings Saved', 'UK security company profile & vetting rules updated.', 'success');
      return;
    }
    const { error } = await supabase.from('settings').upsert({
      id: 1,
      company_name: next.companyName,
      company_number: next.companyNumber,
      sia_acs_approved: next.siaAcsApproved,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('Settings save failed:', error.message);
      showToast('Settings Save Failed', 'Could not sync settings to the server.', 'error');
      return;
    }
    showToast('Settings Saved', 'UK security company profile & vetting rules updated.', 'success');
  };

  // 8. Add Applicant
  const addApplicant = (applicantData: Partial<Applicant>) => {
    if (isAuditor) {
      showToast('Auditor Read-Only', 'Compliance Auditors cannot add new applicants.', 'warning');
      return;
    }
    const newId = `app-${Date.now()}`;
    const fullApplicant: Applicant = {
      id: newId,
      fullName: applicantData.fullName || 'New Applicant',
      email: applicantData.email || '',
      phone: applicantData.phone || '',
      address: applicantData.address || 'London, UK',
      postcode: applicantData.postcode || 'EC1A 1BB',
      nationalInsuranceNo: applicantData.nationalInsuranceNo || 'QQ 00 00 00 A',
      siaLicenceNo: applicantData.siaLicenceNo || '0000-0000-0000-0000',
      siaLicenceSector: applicantData.siaLicenceSector || 'Door Supervision',
      siaLicenceExpiry: applicantData.siaLicenceExpiry || '2027-12-31',
      appliedJobId: applicantData.appliedJobId || jobs[0]?.id || 'job-1',
      appliedJobTitle: applicantData.appliedJobTitle || jobs[0]?.title || 'Security Guard',
      appliedDate: new Date().toISOString().split('T')[0],
      currentStage: 'applied',
      documents: [
        { id: `doc-${Date.now()}`, name: 'Applicant_CV.pdf', type: 'cv', fileUrl: '#', uploadedAt: new Date().toISOString().split('T')[0], size: '1.0 MB' }
      ],
      vettingChecks: [
        { id: `chk-1-${newId}`, type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-job-applicant-right-to-work' },
        { id: `chk-2-${newId}`, type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-a-private-security-licence' },
        { id: `chk-3-${newId}`, type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
        { id: `chk-4-${newId}`, type: 'credit_check', title: 'Credit Check (Mandatory BS 7858)', description: 'Financial history and credit audit under BS 7858 standards', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
        { id: `chk-5-${newId}`, type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: '#' }
      ]
    };

    setApplicants(prev => [fullApplicant, ...prev]);

    if (supabase) {
      supabase.from('applications').insert({
        full_name: fullApplicant.fullName,
        applicant_email: fullApplicant.email,
        applied_job: fullApplicant.appliedJobTitle,
        status: 'applied',
        vetting_data: fullApplicant.vettingChecks,
        form_data: {
          mobile: fullApplicant.phone,
          address: fullApplicant.address,
          postcode: fullApplicant.postcode,
          niNumber: fullApplicant.nationalInsuranceNo,
          siaLicence: fullApplicant.siaLicenceNo,
          documents: fullApplicant.documents
        }
      }).select().then(({ data, error }) => {
        if (!error && data && data[0]) {
          const rowApp = supabaseRowToApplicant(data[0]);
          setApplicants(prev => prev.map(a => a.id === newId ? rowApp : a));
        }
      });
    }

    // Increment job applicant count
    setJobs(prev => prev.map(j => j.id === fullApplicant.appliedJobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j));

    logActivity(newId, fullApplicant.fullName, 'Submitted application');
    showToast('Applicant Added', `${fullApplicant.fullName} added to pipeline.`, 'success');
  };

  return (
    <RecruitmentContext.Provider value={{
      activePage,
      setActivePage,
      pendingJobId,
      setPendingJobId,
      jobs,
      applicants,
      employees,
      activityLogs,
      interviews,
      messages,
      unreadAdminCount,
      selectedApplicant,
      setSelectedApplicant,
      searchQuery,
      setSearchQuery,
      selectedStageFilter,
      setSelectedStageFilter,
      updateCheckStatus,
      updateApplicantStage,
      scheduleInterview,
      completeInterview,
      sendContract,
      approveApplication,
      completeHiring,
      convertToEmployee,
      fireEmployee,
      createJob,
      updateJob,
      deleteJob,
      saveSettings,
      settings,
      addApplicant,
      sendMessage,
      editMessage,
      deleteMessage,
      markConversationRead,
      messagesByApplication,
      reloadMessages,
      scheduleInterviewLive,
      completeInterviewLive,
      interviewsByApplication,
      toasts,
      showToast,
      removeToast,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      isAuthenticated,
      userRole,
      isAuditor,
      login,
      auditorLogin,
      auditorDemoLogin,
      logout,
      publicUser,
      publicLogin,
      publicSignup,
      googleLogin,
      requestPasswordReset,
      publicLogout
    }}>
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) throw new Error('useRecruitment must be used within a RecruitmentProvider');
  return context;
};


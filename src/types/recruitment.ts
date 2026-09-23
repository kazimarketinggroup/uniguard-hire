export type VettingCheckType = 
  | 'right_to_work' 
  | 'sia_licence' 
  | 'references' 
  | 'credit_check' 
  | 'companies_house';

export type CheckStatus = 'pending' | 'approved' | 'rejected';

export interface VettingCheckItem {
  id: string;
  type: VettingCheckType;
  title: string;
  description: string;
  isRequired: boolean;
  status: CheckStatus;
  notes: string;
  verifiedBy?: string;
  verifiedAt?: string;
  externalUrl?: string; // Quick link to UK government / SIA check portal
  proofUrl?: string; // Uploaded proof screenshot or document
  proofName?: string;
}

export type ApplicationStage = 
  | 'applied'               // 2. Applicant Applies
  | 'under_review'          // 3. Admin Reviews Application
  | 'interview_scheduled'   // 4. Admin Schedules Interview
  | 'interview_completed'   // 5. Interview Completed
  | 'vetting_in_progress'   // 6 & 7. Admin checks
  | 'ready_for_contract'    // 8. When all required checks are approved
  | 'contract_sent'         // 9. Admin sends contract
  | 'hired'                 // 10. Applicant becomes Employee
  | 'rejected';

export interface BankDetails {
  bankName: string;
  accountHolderName: string;
  sortCode: string;
  accountNumber: string;
  docUrl?: string;
  docName?: string;
}

export interface ApplicantDocument {
  id: string;
  name: string;
  type: 'cv' | 'passport' | 'sia_badge' | 'proof_address' | 'proof_ni' | 'bank_details' | 'act_certificate' | 'reference_letter' | 'contract';
  fileUrl: string;
  uploadedAt: string;
  size: string;
}

export interface InterviewInfo {
  id: string;
  scheduledDate: string; // ISO format or YYYY-MM-DD
  scheduledTime: string; // e.g. "14:00"
  interviewerName: string;
  locationOrLink: string;
  interviewType: 'in_person' | 'video' | 'phone';
  completed: boolean;
  notes?: string;
  rating?: number; // 1 to 5
}

export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  nationalInsuranceNo: string;
  siaLicenceNo: string;
  siaLicenceSector: 'Door Supervision' | 'Security Guarding' | 'CCTV (PSS)' | 'Close Protection';
  siaLicenceExpiry: string;
  appliedJobId: string;
  appliedJobTitle: string;
  appliedDate: string;
  currentStage: ApplicationStage;
  avatarUrl?: string;
  dob?: string;
  rtwNationality?: 'british' | 'non_british';
  shareCode?: string;
  rtwDocUrl?: string;
  passportDocName?: string;
  passportDocUrl?: string;
  bankDetails?: BankDetails;
  actCertName?: string;
  actCertUrl?: string;
  approvedByAdmin?: boolean;
  approvedAt?: string;
  companyDocsSigned?: boolean;
  companyDocsSignedAt?: string;
  companyDocsSignerName?: string;
  _rawFormData?: any;
  
  // Workflow checklist & data
  vettingChecks: VettingCheckItem[];
  documents: ApplicantDocument[];
  interview?: InterviewInfo;
  adminNotes?: string;
  
  // Employee details once hired
  employeeId?: string;
  hiredDate?: string;
  hourlyRate?: number;
  assignedSite?: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  payRate: number; // e.g. 15.50 (£/hr)
  employmentType: 'Full-Time' | 'Part-Time' | 'Zero-Hours' | 'Shift-Based';
  siaRequired: boolean;
  drivingLicenceRequired: boolean;
  status: 'active' | 'draft' | 'closed';
  createdDate: string;
  description: string;
  applicantsCount: number;
}

export interface Employee {
  id: string;
  applicantId: string;
  employeeId: string; // e.g. "UG-9482"
  fullName: string;
  email: string;
  phone: string;
  roleTitle: string;
  siaLicenceNo: string;
  siaLicenceSector: string;
  siaLicenceExpiry: string;
  hiredDate: string;
  assignedSite: string;
  hourlyRate: number;
  status: 'active' | 'on_assignment' | 'offboarding';
}

export interface ActivityLog {
  id: string;
  applicantId: string;
  applicantName: string;
  action: string;
  timestamp: string;
  user: string;
}

export interface ChatMessage {
  id: string;
  applicationId: string;
  sender: 'admin' | 'user';
  body: string;
  editedAt?: string;
  createdAt: string;
  readByAdmin: boolean;
  readByUser: boolean;
}

export interface ScheduledInterview {
  id: string;
  applicationId: string;
  scheduledAt: string; // ISO
  durationMinutes: number;
  location: string;
  notes?: string;
  rating?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  completed: boolean;
}

export interface AppSettings {
  companyName: string;
  companyNumber: string;
  siaAcsApproved: boolean;
}

export type UserRole = 'admin' | 'auditor' | null;

export type ActivePage = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'jobs'
  | 'applicants'
  | 'interviews'
  | 'employees'
  | 'chat'
  | 'reports'
  | 'settings'
  | 'user-dashboard'
  | 'apply'
  | 'confirm'
  | 'forgot-password'
  | 'reset-password'
  | 'auditor-login'
  | 'privacy-policy'
  | 'terms';


import type { Applicant, Job, Employee, ActivityLog } from '../types/recruitment';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'SIA Door Supervisor — West End Venues',
    location: 'Central London (WC1)',
    payRate: 16.50,
    employmentType: 'Shift-Based',
    siaRequired: true,
    drivingLicenceRequired: false,
    status: 'active',
    createdDate: '2026-08-01',
    description: 'Seeking experienced SIA Door Supervisors for high-profile hospitality and nightlife venues in London’s West End. Crowd management, guest relations, and access verification.',
    applicantsCount: 14,
  },
  {
    id: 'job-2',
    title: 'Corporate Security Officer — Canary Wharf',
    location: 'Canary Wharf, London',
    payRate: 15.00,
    employmentType: 'Full-Time',
    siaRequired: true,
    drivingLicenceRequired: false,
    status: 'active',
    createdDate: '2026-07-28',
    description: 'Front-of-house security representation at premier financial institution headquarters. Duty includes access control, CCTV monitoring, visitor logs, and building patrols.',
    applicantsCount: 9,
  },
  {
    id: 'job-3',
    title: 'CCTV Control Room Specialist',
    location: 'Manchester City Centre',
    payRate: 14.80,
    employmentType: 'Full-Time',
    siaRequired: true,
    drivingLicenceRequired: false,
    status: 'active',
    createdDate: '2026-08-02',
    description: 'Monitoring multi-site PSS CCTV systems for retail and commercial premises. High attention to detail, incident logging, and radio communications with ground staff.',
    applicantsCount: 6,
  },
  {
    id: 'job-4',
    title: 'Mobile Patrol & Keyholding Officer',
    location: 'Birmingham & Solihull',
    payRate: 15.50,
    employmentType: 'Full-Time',
    siaRequired: true,
    drivingLicenceRequired: true,
    status: 'active',
    createdDate: '2026-08-10',
    description: 'Rapid alarm response and scheduled premises inspections across corporate business parks. Clean UK manual driving licence required.',
    applicantsCount: 5,
  }
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'app-101',
    fullName: 'Marcus Vance',
    email: 'm.vance@example.co.uk',
    phone: '+44 7700 900123',
    address: '42 Baker Street, Marylebone',
    postcode: 'NW1 6XE',
    nationalInsuranceNo: 'QQ 12 34 56 A',
    siaLicenceNo: '0102-4982-1102-9481',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2027-11-14',
    appliedJobId: 'job-1',
    appliedJobTitle: 'SIA Door Supervisor — West End Venues',
    appliedDate: '2026-08-02',
    currentStage: 'ready_for_contract',
    dob: '1994-04-12',
    rtwNationality: 'british',
    shareCode: '9W87Y65X4',
    approvedByAdmin: true,
    approvedAt: '2026-08-04T14:20:00Z',
    bankDetails: {
      bankName: 'Barclays Bank UK',
      accountHolderName: 'Marcus Vance',
      sortCode: '20-04-15',
      accountNumber: '83920184'
    },
    adminNotes: 'Candidate passed interview with flying colors. 6 years experience in Soho venues. All 5 vetting checks completed and verified on GOV/SIA portals.',
    documents: [
      { id: 'doc-1', name: 'Marcus_Vance_CV_2026.pdf', type: 'cv', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-08-02', size: '1.2 MB' },
      { id: 'doc-2', name: 'UK_Passport_Scan.pdf', type: 'passport', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-08-02', size: '2.4 MB' },
      { id: 'doc-3', name: 'SIA_Badge_Front_Back.jpg', type: 'sia_badge', fileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', uploadedAt: '2026-08-02', size: '980 KB' },
      { id: 'doc-4', name: 'Utility_Bill_ProofAddress.pdf', type: 'proof_address', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-08-02', size: '1.1 MB' }
    ],
    interview: {
      id: 'int-1',
      scheduledDate: '2026-08-04',
      scheduledTime: '11:00',
      interviewerName: 'Sarah Jenkins (Recruitment Lead)',
      locationOrLink: 'Uniguard HQ - Soho Office',
      interviewType: 'in_person',
      completed: true,
      notes: 'Exceptional communication, calm demeanor, deep understanding of UK licensing law and conflict de-escalation.',
      rating: 5
    },
    vettingChecks: [
      {
        id: 'chk-1',
        type: 'right_to_work',
        title: 'Right to Work (UK)',
        description: 'Verify UK Passport or Home Office Share Code on GOV.UK portal',
        isRequired: true,
        status: 'approved',
        notes: 'British Citizen Passport checked on GOV.UK online check tool. Valid indefinitely. Share code: 9W87Y65X4.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-04 14:20',
        externalUrl: 'https://www.gov.uk/check-job-applicant-right-to-work'
      },
      {
        id: 'chk-2',
        type: 'sia_licence',
        title: 'SIA Licence Verification',
        description: 'Check Home Office SIA Public Register for active license status',
        isRequired: true,
        status: 'approved',
        notes: 'Active Door Supervision licence 0102-4982-1102-9481 confirmed on SIA register. No cautions.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-04 14:35',
        externalUrl: 'https://www.gov.uk/check-a-private-security-licence',
        proofName: 'SIA_Register_Proof_Marcus.png',
        proofUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800'
      },
      {
        id: 'chk-3',
        type: 'references',
        title: '5-Year Reference Check',
        description: '5-year BS7858 career history audit (work, education, unemployment)',
        isRequired: true,
        status: 'approved',
        notes: 'Complete 5-year BS 7858 reference audit verified without gaps. Verified with Apex Security & Regent Club.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-05 10:15',
        externalUrl: '#'
      },
      {
        id: 'chk-4',
        type: 'credit_check',
        title: 'Credit Check (Mandatory BS 7858)',
        description: 'Financial history and credit score audit under BS 7858 standards',
        isRequired: true,
        status: 'approved',
        notes: 'Experian credit check clear. No CCJs, bankruptcies or insolvencies found.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-05 11:00',
        externalUrl: 'https://www.experian.co.uk'
      },
      {
        id: 'chk-5',
        type: 'companies_house',
        title: 'Companies House Search',
        description: 'Verify directorship listings and disqualifications',
        isRequired: false,
        status: 'approved',
        notes: 'Companies House check: No directorship conflicts or disqualifications.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-05 11:20',
        externalUrl: 'https://find-and-update.company-information.service.gov.uk'
      }
    ],
    _rawFormData: {
      dob: '1994-04-12',
      shareCode: '9W87Y65X4',
      rtwNationality: 'british',
      bankName: 'Barclays Bank UK',
      accountHolderName: 'Marcus Vance',
      sortCode: '20-04-15',
      accountNumber: '83920184',
      approvedByAdmin: true,
      approvedAt: '2026-08-04T14:20:00Z',
      activities: [
        {
          id: 'act-1',
          type: 'work',
          title: 'Senior Door Supervisor — Apex Venues',
          from: '2023-01',
          to: 'Present',
          email: 'hr@apexvenues.co.uk',
          mobile: '+44 20 7946 0991',
          evidence: 'Apex_Employment_Reference.pdf'
        },
        {
          id: 'act-2',
          type: 'work',
          title: 'Event Security Guard — Regent Security Ltd',
          from: '2021-06',
          to: '2022-12',
          email: 'vetting@regentsecurity.co.uk',
          mobile: '+44 20 7946 0882',
          evidence: 'Regent_Security_Letter.pdf'
        },
        {
          id: 'act-3',
          type: 'education',
          title: 'Advanced Conflict Management & Physical Intervention',
          from: '2021-01',
          to: '2021-05',
          email: 'courses@securitytraininguk.com',
          evidence: 'Certificate_Level3.pdf'
        },
        {
          id: 'act-4',
          type: 'work',
          title: 'Security Steward — West End Operations',
          from: '2019-08',
          to: '2020-12',
          email: 'stewards@westendops.com',
          evidence: 'Steward_Reference_Signed.pdf'
        }
      ]
    }
  },
  {
    id: 'app-102',
    fullName: 'Elena Rostova',
    email: 'elena.r@example.co.uk',
    phone: '+44 7700 955666',
    address: '109 Commercial Road, Tower Hamlets',
    postcode: 'E1 1RD',
    nationalInsuranceNo: 'ER 11 22 33 F',
    siaLicenceNo: '0209-9944-1188-3344',
    siaLicenceSector: 'Security Guarding',
    siaLicenceExpiry: '2027-09-01',
    appliedJobId: 'job-2',
    appliedJobTitle: 'Corporate Security Officer — Canary Wharf',
    appliedDate: '2026-07-20',
    currentStage: 'hired',
    employeeId: 'UG-4019',
    hiredDate: '2026-08-01',
    hourlyRate: 15.00,
    assignedSite: 'Canary Wharf Tower 1',
    dob: '1992-11-23',
    rtwNationality: 'non_british',
    shareCode: 'AB12CD34E',
    approvedByAdmin: true,
    companyDocsSigned: true,
    companyDocsSignedAt: '2026-08-01T09:00:00Z',
    companyDocsSignerName: 'Elena Rostova',
    bankDetails: {
      bankName: 'HSBC UK',
      accountHolderName: 'Elena Rostova',
      sortCode: '40-05-12',
      accountNumber: '11928472'
    },
    adminNotes: 'Hired and deployed to Canary Wharf site. Contract signed.',
    documents: [
      { id: 'doc-50', name: 'Signed_Contract_Elena.pdf', type: 'contract', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-08-01', size: '2.9 MB' }
    ],
    vettingChecks: [
      { id: 'chk-50', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verified share code on Home Office portal', isRequired: true, status: 'approved', notes: 'Settled Status verified. Share Code: AB12CD34E.', verifiedBy: 'Admin User', verifiedAt: '2026-07-22', externalUrl: 'https://www.gov.uk/check-job-applicant-right-to-work' },
      { id: 'chk-51', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Verified on SIA Register', isRequired: true, status: 'approved', notes: 'Security Guarding licence active until Sept 2027.', verifiedBy: 'Admin User', verifiedAt: '2026-07-22', externalUrl: 'https://www.gov.uk/check-a-private-security-licence' },
      { id: 'chk-52', type: 'references', title: '5-Year Reference Check', description: '5-Year BS 7858 history verified', isRequired: true, status: 'approved', notes: '5-year audit complete. Full continuous employment proof received.', verifiedBy: 'Admin User', verifiedAt: '2026-07-25', externalUrl: '#' },
      { id: 'chk-53', type: 'credit_check', title: 'Credit Check (Mandatory BS 7858)', description: 'Financial history check', isRequired: true, status: 'approved', notes: 'Experian score clean. No CCJ.', verifiedBy: 'Admin User', verifiedAt: '2026-07-25', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-54', type: 'companies_house', title: 'Companies House Check', description: 'Directorship check', isRequired: false, status: 'approved', notes: 'Passed.', verifiedBy: 'Admin User', verifiedAt: '2026-07-25', externalUrl: '#' }
    ],
    _rawFormData: {
      dob: '1992-11-23',
      shareCode: 'AB12CD34E',
      rtwNationality: 'non_british',
      bankName: 'HSBC UK',
      accountHolderName: 'Elena Rostova',
      sortCode: '40-05-12',
      accountNumber: '11928472',
      activities: [
        {
          id: 'act-e1',
          type: 'work',
          title: 'Corporate Security Concierge — Canary Towers',
          from: '2022-03',
          to: '2026-07',
          email: 'canary@towerops.co.uk',
          mobile: '+44 20 7946 0333',
          evidence: 'Canary_Reference.pdf'
        },
        {
          id: 'act-e2',
          type: 'work',
          title: 'Front of House Security — City Hall',
          from: '2020-01',
          to: '2022-02',
          email: 'facilities@cityhall.gov.uk',
          evidence: 'CityHall_Reference.pdf'
        }
      ]
    }
  },
  {
    id: 'app-103',
    fullName: 'Tariq Mahmood',
    email: 't.mahmood@example.co.uk',
    phone: '+44 7700 966777',
    address: '55 Corporation St, Birmingham',
    postcode: 'B4 6AF',
    nationalInsuranceNo: 'TM 44 55 66 G',
    siaLicenceNo: '0101-3344-5566-7788',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2026-12-01',
    appliedJobId: 'job-1',
    appliedJobTitle: 'SIA Door Supervisor — West End Venues',
    appliedDate: '2026-08-05',
    currentStage: 'vetting_in_progress',
    dob: '1996-03-15',
    rtwNationality: 'british',
    shareCode: 'TM998877K',
    documents: [
      { id: 'doc-60', name: 'Tariq_Mahmood_CV.pdf', type: 'cv', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-08-05', size: '1.4 MB' }
    ],
    vettingChecks: [
      { id: 'chk-60', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'approved', notes: 'UK passport verified via Home Office.', verifiedBy: 'Admin User', verifiedAt: '2026-08-06', externalUrl: 'https://www.gov.uk/check-job-applicant-right-to-work' },
      { id: 'chk-61', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'approved', notes: 'SIA licence valid through Dec 2026.', verifiedBy: 'Admin User', verifiedAt: '2026-08-06', externalUrl: 'https://www.gov.uk/check-a-private-security-licence' },
      { id: 'chk-62', type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: 'Awaiting 2nd employer verification letter.', externalUrl: '#' },
      { id: 'chk-63', type: 'credit_check', title: 'Credit Check (Mandatory BS 7858)', description: 'Financial history and credit audit under BS 7858 standards', isRequired: true, status: 'pending', notes: 'Credit check queued with Experian.', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-64', type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: '#' }
    ],
    _rawFormData: {
      dob: '1996-03-15',
      shareCode: 'TM998877K',
      rtwNationality: 'british',
      activities: [
        {
          id: 'act-t1',
          type: 'work',
          title: 'Door Supervisor — Birmingham Nightlife Group',
          from: '2022-01',
          to: 'Present',
          email: 'bham@nightlifeops.co.uk',
          mobile: '+44 121 496 0192',
          evidence: 'Bham_Door_Reference.pdf'
        }
      ]
    }
  },
  {
    id: 'app-104',
    fullName: 'Sarah Jenkins',
    email: 's.jenkins@example.co.uk',
    phone: '+44 7700 933444',
    address: '88 High Street, Croydon',
    postcode: 'CR0 1NA',
    nationalInsuranceNo: 'SJ 33 44 55 B',
    siaLicenceNo: '0105-7766-5544-3322',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2028-02-28',
    appliedJobId: 'job-1',
    appliedJobTitle: 'SIA Door Supervisor — West End Venues',
    appliedDate: '2026-08-08',
    currentStage: 'interview_scheduled',
    dob: '1995-07-19',
    rtwNationality: 'british',
    documents: [
      { id: 'doc-70', name: 'Sarah_Jenkins_CV.pdf', type: 'cv', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-08-08', size: '1.5 MB' }
    ],
    interview: {
      id: 'int-2',
      scheduledDate: '2026-08-15',
      scheduledTime: '14:30',
      interviewerName: 'David Miller',
      locationOrLink: 'Zoom Video Call (Link: https://zoom.us/j/uniguard-hire)',
      interviewType: 'video',
      completed: false
    },
    vettingChecks: [
      { id: 'chk-70', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-job-applicant-right-to-work' },
      { id: 'chk-71', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-a-private-security-licence' },
      { id: 'chk-72', type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
      { id: 'chk-73', type: 'credit_check', title: 'Credit Check (Mandatory BS 7858)', description: 'Financial history and credit audit under BS 7858 standards', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-74', type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: '#' }
    ]
  },
  {
    id: 'app-105',
    fullName: 'David O’Connor',
    email: 'd.oconnor@example.co.uk',
    phone: '+44 7700 922111',
    address: '14 Piccadilly, Manchester',
    postcode: 'M1 1PL',
    nationalInsuranceNo: 'DO 88 99 00 C',
    siaLicenceNo: '0301-8877-6655-4433',
    siaLicenceSector: 'CCTV (PSS)',
    siaLicenceExpiry: '2027-05-18',
    appliedJobId: 'job-3',
    appliedJobTitle: 'CCTV Control Room Specialist',
    appliedDate: '2026-08-11',
    currentStage: 'under_review',
    dob: '1991-09-05',
    rtwNationality: 'british',
    documents: [
      { id: 'doc-80', name: 'David_OConnor_CCTV_CV.pdf', type: 'cv', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-08-11', size: '1.1 MB' }
    ],
    vettingChecks: [
      { id: 'chk-80', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-job-applicant-right-to-work' },
      { id: 'chk-81', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/check-a-private-security-licence' },
      { id: 'chk-82', type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
      { id: 'chk-83', type: 'credit_check', title: 'Credit Check (Mandatory BS 7858)', description: 'Financial history and credit audit under BS 7858 standards', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-84', type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: '#' }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    applicantId: 'app-102',
    employeeId: 'UG-4019',
    fullName: 'Elena Rostova',
    email: 'elena.r@example.co.uk',
    phone: '+44 7700 955666',
    roleTitle: 'Corporate Security Officer',
    siaLicenceNo: '0209-9944-1188-3344',
    siaLicenceSector: 'Security Guarding',
    siaLicenceExpiry: '2027-09-01',
    hiredDate: '2026-08-01',
    assignedSite: 'Canary Wharf Tower 1',
    hourlyRate: 15.00,
    status: 'active'
  },
  {
    id: 'emp-2',
    applicantId: 'app-099',
    employeeId: 'UG-4018',
    fullName: 'Liam Thorne',
    email: 'l.thorne@example.co.uk',
    phone: '+44 7700 988777',
    roleTitle: 'Head Door Supervisor',
    siaLicenceNo: '0109-1234-5678-9012',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2026-09-15',
    hiredDate: '2026-05-10',
    assignedSite: 'Soho House & Venues',
    hourlyRate: 18.00,
    status: 'on_assignment'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    applicantId: 'app-101',
    applicantName: 'Marcus Vance',
    action: 'Approved Reference Check (5-Year Audit)',
    timestamp: 'Today at 09:15',
    user: 'Sarah Jenkins (Admin)'
  },
  {
    id: 'act-2',
    applicantId: 'app-101',
    applicantName: 'Marcus Vance',
    action: 'Moved to Ready for Contract (All checks passed)',
    timestamp: 'Today at 10:05',
    user: 'System'
  },
  {
    id: 'act-3',
    applicantId: 'app-102',
    applicantName: 'Elena Rostova',
    action: 'E-Contract Signed & Onboarded to Canary Wharf Tower 1',
    timestamp: 'Yesterday at 16:00',
    user: 'Admin User'
  }
];

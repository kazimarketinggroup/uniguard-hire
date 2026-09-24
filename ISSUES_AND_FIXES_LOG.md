# Uniguard Hire — Issues & Fixes Log

Comprehensive changelog and operational history tracking issues encountered, timestamps, root causes, and technical resolutions.

---

## Log Entries

### [2026-09-23 21:50:22 UTC+6] Mobile Stepper & Document Badge Overflow
* **Issue:** 
  * On mobile viewports (< 440px width), the 6-stage applicant progress tracker (`Application Sent` ➔ `Hired`) broke outside the white card boundaries. The 6th stage ("Hired" yellow icon) was pushed completely off-screen, and step circles were distorted into ovals on narrow viewports.
  * In the green "Hiring Complete" card, the 3 document badges had rigid `flex` with no wrapping, clipping the 3rd badge ("Safety & Operations") in half.
* **Component Affected:** [`src/components/public/UserDashboard.tsx`](file:///e:/Uniguard%20Hire/src/components/public/UserDashboard.tsx)
* **Root Cause:** 
  * Fixed widths (`w-16` labels + dividers) required 440px+ horizontal space without an `overflow-x-auto` wrapper.
  * Document badge container lacked `flex-wrap`.
* **Resolution / Fix:**
  1. Wrapped `StageFlow` stepper in an `overflow-x-auto no-scrollbar` touch-friendly container with `min-w-[460px] sm:min-w-0` to guarantee perfect circular icon geometry on all screen sizes.
  2. Added `overflow-hidden` to parent applicant cards to strictly contain all children.
  3. Added `activeStepRef` with auto-centering on mount (`scrollIntoView`) so candidates on mobile immediately see their current active stage.
  4. Added a mobile-only status badge pill (e.g. `Stage 6/6: Hired`) above the stepper for instant glanceability.
  5. Added `flex-wrap` and responsive column stacking (`flex-col sm:flex-row`) to the document badge row and card header in `CompanyDocumentsSection`.
  6. Rebuilt and deployed live to production.
* **Commit:** `f789246` & `f70ef1f`

---

### [2026-09-23 21:17:37 UTC+6] Sensitive Corporate Email Revealed in Input Placeholders
* **Issue:** 
  * Real corporate email addresses (such as `auditor@uniguard.co.uk`) were hardcoded as placeholder text in the administrator login form.
* **Component Affected:** [`src/components/admin/AdminLogin.tsx`](file:///e:/Uniguard%20Hire/src/components/admin/AdminLogin.tsx)
* **Root Cause:** Placeholder attributes in JSX retained development email strings.
* **Resolution / Fix:**
  * Replaced all corporate email references in placeholders with generic neutral examples (`e.g. admin@uniguard.co.uk` or `name@example.com`) to prevent reconnaissance and account enumeration by unauthorized visitors.
* **Commit:** `129345e`

---

### [2026-09-23 21:11:15 UTC+6] Security Hardening & Zero-Knowledge Authentication
* **Issue:** 
  * Security pentest identified critical client-side vulnerabilities:
    1. Plaintext fallback passwords (`SuperAdminSecure2026!`, `AuditorPass2026!`) bundled into the production JavaScript file.
    2. An exposed backdoor function `auditorDemoLogin()` callable from the browser DevTools console granting unauthenticated read access.
    3. Client-side fallback authentication accepting any password of 6+ characters.
    4. Missing critical HTTP security headers (HSTS, COOP, CORP, Anti-Clickjacking, Permissions Policy).
* **Components Affected:** 
  * [`src/context/RecruitmentContext.tsx`](file:///e:/Uniguard%20Hire/src/context/RecruitmentContext.tsx)
  * [`vercel.json`](file:///e:/Uniguard%20Hire/vercel.json)
  * [`supabase/018_security_hardening.sql`](file:///e:/Uniguard%20Hire/supabase/018_security_hardening.sql)
* **Root Cause:** Rapid prototyping fallbacks and demo bypass helpers remained in codebase.
* **Resolution / Fix:**
  1. Purged all hardcoded passwords, credentials, and demo bypasses from source code and bundles.
  2. Deleted `auditorDemoLogin()` completely.
  3. Enforced database-level authentication strictly via Supabase Auth and PostgreSQL RLS policies (`profiles.is_admin`, `profiles.is_auditor`).
  4. Created SQL migration `018_security_hardening.sql` implementing automated account lockouts (15-minute lock after 5 consecutive failed login attempts) and RLS triggers preventing privilege self-elevation.
  5. Configured 10 enterprise HTTP security headers in `vercel.json`:
     * `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
     * `X-Frame-Options: DENY`
     * `X-Content-Type-Options: nosniff`
     * `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
     * `Cross-Origin-Opener-Policy: same-origin`
     * `Cross-Origin-Resource-Policy: same-origin`
* **Commit:** `cdc169b`

---

### [2026-09-23 21:02:07 UTC+6] Administrative Portal Segregation & Super Admin Transition
* **Issue:** 
  * Auditor access was conflated with standard administration, and demo login buttons were visible on the public login page.
* **Components Affected:** 
  * [`src/App.tsx`](file:///e:/Uniguard%20Hire/src/App.tsx)
  * [`src/components/admin/AdminLogin.tsx`](file:///e:/Uniguard%20Hire/src/components/admin/AdminLogin.tsx)
  * [`src/context/RecruitmentContext.tsx`](file:///e:/Uniguard%20Hire/src/context/RecruitmentContext.tsx)
* **Root Cause:** Lack of strict route-level role separation between standard admins and compliance auditors.
* **Resolution / Fix:**
  1. Created dedicated `/super-admin` route.
  2. Rebranded auditor access to **Super Admin / Compliance Auditor (Read-Only)**.
  3. Removed demo credentials banner, sample buttons, and prefill actions from UI.
* **Commit:** `12a8325`

---

### [2026-09-23 20:48:40 UTC+6] Public Footer Admin & Portal Link Leakage
* **Issue:** 
  * Public footer displayed direct navigation links to the Candidate Portal and Admin Login, making them discoverable by automated scrapers and bots.
* **Component Affected:** [`src/components/layout/Footer.tsx`](file:///e:/Uniguard%20Hire/src/components/layout/Footer.tsx)
* **Root Cause:** Standard website footer included administrative navigation routes.
* **Resolution / Fix:**
  * Removed candidate portal and admin login links from public footer. Administrative pages are now obfuscated and accessible only by entering direct URLs (`/login`, `/super-admin`).
* **Commit:** `f89fcf5`

---

### [2026-09-23 20:33:47 UTC+6] Candidate Application Form Data Loss on Mobile Backgrounding
* **Issue:** 
  * When candidates switched apps (e.g. to camera/gallery to take photos of SIA licences/passports) or backgrounded the browser tab, the application form lost input state and reset to step 1.
* **Component Affected:** [`src/components/public/MultiStepApplyForm.tsx`](file:///e:/Uniguard%20Hire/src/components/public/MultiStepApplyForm.tsx)
* **Root Cause:** Form state lived solely in component memory without storage persistence across lifecycle unmounts.
* **Resolution / Fix:**
  * Implemented session auto-save and state recovery in `MultiStepApplyForm.tsx` using local storage keys keyed by job ID, restoring step index, text fields, and file upload progress upon return.
* **Commit:** `da982eb`

---

### [2026-09-23 19:55:24 UTC+6] Missing Legal & UK GDPR Disclosures
* **Issue:** 
  * Website lacked mandatory UK GDPR privacy notices, terms of engagement, and statutory registered office information.
* **Components Affected:** 
  * [`src/components/public/PrivacyPolicyPage.tsx`](file:///e:/Uniguard%20Hire/src/components/public/PrivacyPolicyPage.tsx)
  * [`src/components/public/TermsPage.tsx`](file:///e:/Uniguard%20Hire/src/components/public/TermsPage.tsx)
  * [`src/App.tsx`](file:///e:/Uniguard%20Hire/src/App.tsx)
* **Root Cause:** Legal pages had not yet been drafted or wired into the router.
* **Resolution / Fix:**
  * Created complete, legally compliant **Privacy Policy** and **Terms of Service** pages including registered office details (*71-75 Shelton Street, Covent Garden, London, WC2H 9JQ*), BS 7858 data handling disclosures, candidate rights, and footer links.
* **Commit:** `e9c8d32`

---

### [2026-09-17 22:38:29 UTC+6] BS 7858 5-Year Vetting Compliance & 1-Month Gap Waiver
* **Issue:** 
  * Vetting workflow did not adhere strictly to British Standard BS 7858:2019 regarding employment gap verification, bank account collection, and conditional onboarding before contract generation.
* **Components Affected:** 
  * [`src/components/common/BS7858Guidance.tsx`](file:///e:/Uniguard%20Hire/src/components/common/BS7858Guidance.tsx)
  * [`src/components/public/MultiStepApplyForm.tsx`](file:///e:/Uniguard%20Hire/src/components/public/MultiStepApplyForm.tsx)
  * [`src/components/applicants/ApplicantDrawer.tsx`](file:///e:/Uniguard%20Hire/src/components/applicants/ApplicantDrawer.tsx)
* **Root Cause:** Screening criteria treated all date gaps identically without applying the official 1-month statutory exemption rule.
* **Resolution / Fix:**
  1. Implemented BS 7858 5-year chronological check with automatic 1-month gap waiver calculation.
  2. Added candidate bank details collection for direct payroll integration.
  3. Added admin approval gateway requiring explicit compliance sign-off before candidate contract documents unlock.
* **Commit:** `80e0368`

---

### [2026-09-04 16:48:56 UTC+6] Document Previewer & Government Check Integration
* **Issue:** 
  * Admin team had to download every candidate proof document locally to review them, and lacked direct links to official UK verification registries.
* **Components Affected:** 
  * [`src/components/applicants/ApplicantDrawer.tsx`](file:///e:/Uniguard%20Hire/src/components/applicants/ApplicantDrawer.tsx)
* **Root Cause:** File links were rendered as plain anchor tags without in-app previewer modal.
* **Resolution / Fix:**
  * Built full in-app **Document Viewer Theater** with zoom, 90° rotation, full-screen mode, and direct smart download helpers.
  * Added direct gov.uk verification integration links (Home Office Right to Work share codes, SIA Licence Checker, DBS checking portal).
* **Commit:** `519650d`

---

### [2026-08-18 10:57:46 UTC+6] Bot Protection & Spam Submission Mitigation
* **Issue:** 
  * Candidate signup and job application submission endpoints were susceptible to automated bot spam and fake applications.
* **Components Affected:** 
  * [`src/components/common/TurnstileWidget.tsx`](file:///e:/Uniguard%20Hire/src/components/common/TurnstileWidget.tsx)
  * [`src/context/RecruitmentContext.tsx`](file:///e:/Uniguard%20Hire/src/context/RecruitmentContext.tsx)
* **Root Cause:** Forms submitted directly to Supabase Auth without bot verification challenges.
* **Resolution / Fix:**
  * Created Turnstile / bot protection challenge widget and wired `captchaToken` into Supabase Auth API options for server-side verification.
* **Commit:** `f8a746e` & `1b18599`

---

### [2026-08-17 21:13:42 UTC+6] Supabase Storage RLS File Upload Failure
* **Issue:** 
  * Candidate evidence document uploads failed with Supabase RLS error `new row violates row-level security policy for table "objects"`.
* **Components Affected:** 
  * [`supabase/004_storage_policies.sql`](file:///e:/Uniguard%20Hire/supabase/004_storage_policies.sql)
* **Root Cause:** The storage bucket policy mandated `auth.uid()` as the exact first segment of the storage path, whereas candidate uploads used application-keyed prefixes (`applications/{appId}/{fileName}`).
* **Resolution / Fix:**
  * Updated Supabase storage RLS policy to support both user ID and application-scoped folder patterns while verifying authenticated candidate ownership.
* **Commit:** `522d5d3`

---

### [2026-08-17 20:59:20 UTC+6] Interview Assessment & Setting Persistence Loss
* **Issue:** 
  * When an interviewer marked an applicant interview as Pass/Fail or updated company settings, refreshing the page reverted the state.
* **Components Affected:** 
  * [`supabase/012_employees_settings_sync.sql`](file:///e:/Uniguard%20Hire/supabase/012_employees_settings_sync.sql)
  * [`src/context/RecruitmentContext.tsx`](file:///e:/Uniguard%20Hire/src/context/RecruitmentContext.tsx)
* **Root Cause:** Interview assessment states and employee records were hydrated into local React state without corresponding PostgreSQL database sync calls.
* **Resolution / Fix:**
  * Created `012_employees_settings_sync.sql` migration adding dedicated columns for interview rating, notes, and outcome, with real-time bidirectional synchronization.
* **Commit:** `6192529`

import React, { useEffect } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { ShieldCheck, ArrowLeft, Mail, MapPin, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { setActivePage } = useRecruitment();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-page text-primary flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-page/90 backdrop-blur-md border-b border-line px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setActivePage('landing')} 
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button onClick={() => setActivePage('landing')} className="flex flex-col items-center cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard" className="h-8 w-auto object-contain" />
            <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('login')}
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-line text-secondary hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setActivePage('signup')}
              className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#AF7C28' }}
            >
              Apply Now
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Header Block */}
        <div className="mb-10 pb-8 border-b border-line">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: 'rgba(175,124,40,0.1)', color: '#AF7C28' }}>
            <ShieldCheck className="w-4 h-4" />
            <span>UK GDPR & BS 7858 Compliant Privacy Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-secondary">
            Last Updated: September 2026 • Applies to all candidates, staff, and visitors of <strong className="text-primary">uniguardrecruit.co.uk</strong>
          </p>
        </div>

        {/* Company Quick Summary Card */}
        <div className="mb-10 p-6 rounded-2xl bg-panel border border-line shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Data Controller Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-secondary leading-relaxed">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block font-semibold">Head Office Address</strong>
                <span>Uniguard, Virginia House, 56 Warwick Road, Solihull, Birmingham, B92 7HX, United Kingdom</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block font-semibold">Contact & Privacy Enquiries</strong>
                <a href="mailto:recruitment@uniguard.co.uk" className="text-primary underline hover:text-amber-500">recruitment@uniguard.co.uk</a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Text Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-secondary">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">1. Introduction</h2>
            <p>
              Uniguard ("we", "us", or "our") operates the recruitment and vetting portal at <strong className="text-primary">https://www.uniguardrecruit.co.uk</strong>. 
              We are committed to protecting and respecting your privacy in strict accordance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and British Standard BS 7858 (Screening of individuals working in a secure environment).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">2. The Information We Collect</h2>
            <p>To evaluate applications and conduct mandatory security screening, we collect and process the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-primary">Personal & Identification Details:</strong> Full legal name, date of birth, current residential address, 5-year address history, telephone numbers, and email address.</li>
              <li><strong className="text-primary">Security & Professional Licences:</strong> Security Industry Authority (SIA) licence number, sector badge category (Door Supervision, Security Guarding, CCTV), and licence validity.</li>
              <li><strong className="text-primary">Right to Work in the UK:</strong> Home Office Right to Work share codes, passport/BRP records, and nationality verification.</li>
              <li><strong className="text-primary">5-Year Vetting History (BS 7858):</strong> Full 5-year continuous employment, education, and gap records, including referee contact details (company names, referee names, telephone numbers, and emails).</li>
              <li><strong className="text-primary">Statutory Checks:</strong> Basic DBS criminal record declarations and financial history declarations required under BS 7858 standards.</li>
              <li><strong className="text-primary">Identification Documents:</strong> Scanned copies or photographs of your photo ID, utility bills for proof of address, and SIA licence cards.</li>
            </ul>
          </section>

          {/* Google OAuth Explicit Disclosure Section */}
          <section className="space-y-3 p-5 rounded-xl border border-line bg-panel">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              <span>3. Google User Data & Single Sign-On (OAuth)</span>
            </h2>
            <p>
              When you choose to sign in or register with Google ("Continue with Google"), Google provides us with your verified email address, your basic profile name, and your avatar image.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-primary">Limited Usage:</strong> We strictly use your Google profile information to authenticate your candidate portal session and link your job applications to your account.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-primary">No Sale of Data:</strong> We never sell, transfer, or distribute your Google account data or personal information to third-party data brokers or marketing platforms.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-primary">No Unsolicited Advertising:</strong> Google user data is not used for targeted advertisements.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">4. Lawful Basis for Processing</h2>
            <p>We process your personal information under the following legal bases recognized by the UK GDPR:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong className="text-primary">Contractual Necessity:</strong> Processing necessary to take steps at your request prior to entering into an employment contract.</li>
              <li><strong className="text-primary">Legal Obligation:</strong> Ensuring compliance with Home Office Right to Work regulations and SIA statutory licensing requirements.</li>
              <li><strong className="text-primary">Legitimate Interests:</strong> Fulfilling industry-standard security vetting requirements under British Standard BS 7858.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">5. How We Protect and Store Your Data</h2>
            <p>
              All candidate applications and evidence documents are protected with high-grade transport-layer encryption (HTTPS/TLS) and encrypted database storage with Row-Level Security (RLS). Access to candidate vetting files is restricted exclusively to authorized Uniguard vetting officers and certified read-only compliance auditors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">6. Data Retention</h2>
            <p>
              Under British Standard BS 7858 and UK employment regulations:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Vetting records and files for deployed security officers are retained for the duration of employment and for <strong className="text-primary">7 years</strong> following the termination of employment.</li>
              <li>Applications that do not proceed are securely retained for up to 6 months to handle candidate queries or statutory audit reviews, after which they are securely deleted.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">7. Your Rights Under UK GDPR</h2>
            <p>You have the right to request:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Access to the personal data we hold about you.</li>
              <li>Correction of any inaccurate or incomplete personal information.</li>
              <li>Erasure of your personal data (where retention is not legally required for BS 7858 or HMRC compliance).</li>
              <li>Restriction or objection to processing of your personal data.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please email our team at <a href="mailto:recruitment@uniguard.co.uk" className="text-primary font-semibold underline">recruitment@uniguard.co.uk</a>.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-line">
            <h2 className="text-lg font-bold text-primary">8. Supervisory Authority</h2>
            <p>
              If you have unresolved concerns regarding how your data is handled, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noreferrer" className="text-primary underline">ico.org.uk</a> or by telephone on 0303 123 1113.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-panel py-8 text-xs text-secondary text-center">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Uniguard. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActivePage('terms')} className="hover:text-primary transition-colors">Terms of Service</button>
            <span>•</span>
            <button onClick={() => setActivePage('privacy-policy')} className="text-primary font-bold">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setActivePage('landing')} className="hover:text-primary transition-colors">Careers</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

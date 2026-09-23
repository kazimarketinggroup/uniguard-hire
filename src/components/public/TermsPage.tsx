import React, { useEffect } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { ShieldCheck, ArrowLeft, Mail, MapPin, FileCheck, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            <FileCheck className="w-4 h-4" />
            <span>Official Candidate & Portal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Terms and Conditions of Use</h1>
          <p className="text-sm text-secondary">
            Effective Date: September 2026 • Governing website & portal access at <strong className="text-primary">uniguardrecruit.co.uk</strong>
          </p>
        </div>

        {/* Company Quick Summary Card */}
        <div className="mb-10 p-6 rounded-2xl bg-panel border border-line shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Company & Headquarters Details</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-secondary leading-relaxed">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block font-semibold">Registered Office</strong>
                <span>Uniguard, Virginia House, 56 Warwick Road, Solihull, Birmingham, B92 7HX, United Kingdom</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block font-semibold">Recruitment Support</strong>
                <a href="mailto:recruitment@uniguard.co.uk" className="text-primary underline hover:text-amber-500">recruitment@uniguard.co.uk</a>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-secondary">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or registering an account on <strong className="text-primary">https://www.uniguardrecruit.co.uk</strong>, submitting a job application, or using our candidate messaging facilities, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">2. Candidate Eligibility & Statutory Requirements</h2>
            <p>To use this recruitment platform and be considered for security roles with Uniguard, you must satisfy all of the following conditions:</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-primary">Age Requirement:</strong> You must be at least 18 years of age.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-primary">Right to Work in the UK:</strong> You must hold verified, legal Right to Work in the United Kingdom and agree to provide valid Home Office share codes or physical documentation upon request.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-primary">SIA Licensing:</strong> For security operative roles, you must hold a valid, active SIA Licence with no pending revocations or serious endorsements.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">3. BS 7858 Vetting & Pre-Employment Screening Consent</h2>
            <p>
              All security guarding deployments require mandatory pre-employment screening compliant with British Standard <strong className="text-primary">BS 7858</strong>. By submitting an application, you expressly authorise Uniguard to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Conduct a 5-year verifiable employment, education, and activity history check.</li>
              <li>Directly contact your listed past employers and personal referees.</li>
              <li>Verify your credentials with the Security Industry Authority (SIA).</li>
              <li>Verify address history via electoral roll and utility documentation.</li>
              <li>Perform basic Disclosure and Barring Service (DBS) criminal record and financial checks where mandated.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">4. Accuracy of Information & Integrity</h2>
            <p>
              You represent and warrant that all information, documents, CV records, and statements submitted are accurate, current, and truthful. Providing false, deceptive, or misleading documentation is a criminal offence under UK fraud statutes and will result in immediate disqualification, cancellation of assignments, and reporting to relevant statutory authorities including the SIA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">5. Account Security & Google Sign-In</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials (whether logging in via email password or Google Single Sign-On). You must notify Uniguard immediately of any unauthorised access to your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">6. No Guarantee of Employment</h2>
            <p>
              Submission of an application, completion of screening forms, or scheduling of an interview does not constitute an offer or guarantee of employment. Formal employment offers are subject to successful completion of all BS 7858 checks, client site verification, and signing of a formal Contract of Employment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-primary">7. Governing Law and Jurisdiction</h2>
            <p>
              These Terms and Conditions and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong className="text-primary">England and Wales</strong>. The courts of England and Wales have exclusive jurisdiction to settle any dispute.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-line">
            <h2 className="text-lg font-bold text-primary">8. Contact Information</h2>
            <p>
              For inquiries regarding these Terms and Conditions:
            </p>
            <p>
              <strong className="text-primary block">Uniguard</strong>
              Virginia House, 56 Warwick Road, Solihull, Birmingham, B92 7HX, United Kingdom<br />
              Email: <a href="mailto:recruitment@uniguard.co.uk" className="text-primary font-semibold underline">recruitment@uniguard.co.uk</a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-panel py-8 text-xs text-secondary text-center">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Uniguard. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActivePage('terms')} className="text-primary font-bold">Terms of Service</button>
            <span>•</span>
            <button onClick={() => setActivePage('privacy-policy')} className="hover:text-primary transition-colors">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setActivePage('landing')} className="hover:text-primary transition-colors">Careers</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

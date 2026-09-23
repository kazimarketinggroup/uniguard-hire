import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Shield, ArrowRight, MapPin, Users, Award, ChevronRight, Mail, FileText } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActivePage, publicUser } = useRecruitment();

  return (
    <div className="min-h-screen bg-page text-primary font-sans">
      {/* Navigation */}
      <nav className="border-b border-line bg-panel/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActivePage('landing')} className="flex flex-col items-center cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-9 w-auto object-contain" />
            <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
          </button>
          <div className="flex items-center gap-3">
            {publicUser ? (
              <button
                onClick={() => setActivePage('user-dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: '#AF7C28' }}
              >
                <span>My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActivePage('login')}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-secondary border border-line hover:border-line-strong transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActivePage('signup')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#AF7C28' }}
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-panel-2 via-page to-amber-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-6" style={{ borderColor: 'rgba(175,124,40,0.3)', color: '#8f6420', backgroundColor: 'rgba(175,124,40,0.06)' }}>
              <Award className="w-3.5 h-3.5" style={{ color: '#AF7C28' }} />
              <span>NOW HIRING: SIA SECURITY OFFICERS</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-primary tracking-tight leading-[1.1] mb-6">
              Build Your Career in{' '}
              <span style={{ color: '#AF7C28' }}>Professional Security</span>
            </h1>
            <p className="text-lg text-secondary leading-relaxed max-w-2xl mb-8">
              Join Uniguard, an established UK security contractor delivering static guarding, 
              mobile patrols, and event security for commercial and public-sector clients. 
              Create an account to browse live vacancies and submit your application for SIA-licensed roles.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActivePage(publicUser ? 'user-dashboard' : 'signup')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#AF7C28' }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActivePage(publicUser ? 'user-dashboard' : 'login')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-secondary border-2 border-line hover:border-line-strong transition-all"
              >
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-panel-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Why Join Uniguard?</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              We're committed to professional development, competitive pay, and rewarding careers in security.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-panel rounded-2xl p-8 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
                <Shield className="w-6 h-6" style={{ color: '#AF7C28' }} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">SIA-Licensed Roles</h3>
              <p className="text-secondary text-sm leading-relaxed">
                All positions require valid SIA licensing. We support licence renewal and sector training for Door Supervision, Security Guarding, CCTV, and Close Protection.
              </p>
            </div>
            <div className="bg-panel rounded-2xl p-8 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
                <MapPin className="w-6 h-6" style={{ color: '#AF7C28' }} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Nationwide Deployment</h3>
              <p className="text-secondary text-sm leading-relaxed">
                From corporate headquarters in London to events across the South East, we place security officers where they're needed most with reliable shift patterns.
              </p>
            </div>
            <div className="bg-panel rounded-2xl p-8 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
                <Users className="w-6 h-6" style={{ color: '#AF7C28' }} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Professional Growth</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Clear progression paths from Security Officer to Team Leader and Site Supervisor. We invest in first aid, conflict management, and specialist training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-page">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Getting started is simple. Create an account, select a vacancy, and complete your application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your details to access the careers portal.' },
              { step: '02', title: 'Choose a Role', desc: 'Browse active vacancies and select the position that suits you.' },
              { step: '03', title: 'Complete Application', desc: 'Fill in the multi-step form with your personal and professional details.' },
              { step: '04', title: 'Vetting & Interview', desc: 'Our team reviews your application and arranges the next steps.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold mb-4" style={{ color: 'rgba(175,124,40,0.15)' }}>{item.step}</div>
                <h3 className="text-base font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
                {item.step !== '04' && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
                    <ChevronRight className="w-5 h-5 text-faint" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-panel-2 border-y border-line">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Ready to Start Your Application?</h2>
          <p className="text-secondary mb-8 max-w-xl mx-auto">
            Create an account today and take the first step towards a rewarding career with Uniguard Security.
          </p>
          <button
            onClick={() => setActivePage(publicUser ? 'user-dashboard' : 'signup')}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#AF7C28' }}
          >
            <span>{publicUser ? 'Go to My Dashboard' : 'Create Free Account'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-panel border-t border-line pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-line">
            {/* Column 1: Company Brand */}
            <div className="space-y-4">
              <button onClick={() => setActivePage('landing')} className="flex flex-col items-start cursor-pointer">
                <img src="/uniguardlogo.png" alt="Uniguard" className="h-9 w-auto object-contain" />
                <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
              </button>
              <p className="text-xs text-secondary leading-relaxed">
                Specialist UK Security & SIA Personnel Recruitment. Providing vetted, BS 7858 compliant guarding solutions nationwide.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-secondary">
                <span className="px-2.5 py-1 rounded-md bg-page border border-line">ACS Approved</span>
                <span className="px-2.5 py-1 rounded-md bg-page border border-line">SIA Verified</span>
                <span className="px-2.5 py-1 rounded-md bg-page border border-line">BS 7858</span>
              </div>
            </div>

            {/* Column 2: Head Office */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Head Office</h3>
              <div className="space-y-2.5 text-xs text-secondary leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-primary block font-semibold">Uniguard</strong>
                    Virginia House, 56 Warwick Road<br />
                    Solihull, Birmingham<br />
                    B92 7HX, United Kingdom
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <a href="mailto:recruitment@uniguard.co.uk" className="hover:text-primary transition-colors underline">
                    recruitment@uniguard.co.uk
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Legal & Policies */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Legal & Compliance</h3>
              <ul className="space-y-2 text-xs text-secondary">
                <li>
                  <button onClick={() => setActivePage('privacy-policy')} className="hover:text-primary transition-colors text-left flex items-center gap-1.5 font-medium text-primary">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('terms')} className="hover:text-primary transition-colors text-left flex items-center gap-1.5 font-medium text-primary">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Terms and Conditions</span>
                  </button>
                </li>
                <li className="pt-2 text-[11px] text-faint leading-normal">
                  Our vetting and candidate screening adheres to British Standard BS 7858 and the UK Data Protection Act 2018.
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
            <p>© 2026 Uniguard. All Rights Reserved.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setActivePage('privacy-policy')} className="hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => setActivePage('terms')} className="hover:text-primary transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

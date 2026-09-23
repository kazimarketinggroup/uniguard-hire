import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Shield, ShieldCheck, LockKeyhole, User, ArrowRight, Eye, KeyRound } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, auditorLogin, auditorDemoLogin, setActivePage, activePage } = useRecruitment();
  const [portalMode, setPortalMode] = useState<'admin' | 'auditor'>(() => activePage === 'auditor-login' ? 'auditor' : 'admin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handlePortalSwitch = (mode: 'admin' | 'auditor') => {
    setPortalMode(mode);
    setError('');
    if (mode === 'auditor') {
      setEmail('auditor@uniguard.co.uk');
      setPassword('AuditorPass2026!');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);

    let ok = false;
    if (portalMode === 'auditor') {
      ok = await auditorLogin(email, password);
    } else {
      ok = await login(email, password);
    }
    setBusy(false);
    if (!ok) {
      if (portalMode === 'auditor') {
        setError('Invalid credentials for Auditor portal. Use default: auditor@uniguard.co.uk / AuditorPass2026!');
      } else {
        setError('Invalid email or password, or this account has no admin access.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <button onClick={() => setActivePage('landing')} className="flex flex-col items-center mx-auto mb-6 cursor-pointer">
          <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-9 w-auto object-contain mx-auto" />
          <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
        </button>

        {/* Portal Mode Switcher */}
        <div className="flex rounded-xl bg-panel border border-line p-1 mb-4 shadow-sm">
          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'admin'
                ? 'bg-[#AF7C28] text-white shadow-md'
                : 'text-secondary hover:text-primary hover:bg-panel-2'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('auditor')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'auditor'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-secondary hover:text-primary hover:bg-panel-2'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Auditor Portal (Read-Only)</span>
          </button>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-8 shadow-xl">
          <div className="text-center mb-6">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" 
              style={{ backgroundColor: portalMode === 'auditor' ? 'rgba(79,70,229,0.1)' : 'rgba(175,124,40,0.1)' }}
            >
              {portalMode === 'auditor' ? (
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
              ) : (
                <Shield className="w-7 h-7" style={{ color: '#AF7C28' }} />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-primary mb-1">
              {portalMode === 'auditor' ? 'Vetting Auditor Login' : 'Admin Login'}
            </h2>
            <p className="text-xs text-secondary">
              {portalMode === 'auditor' 
                ? 'BS 7858 Compliance & SIA Verification Audit (Read-Only)' 
                : 'Uniguard recruitment, vetting & hiring management'}
            </p>
          </div>

          {/* Auditor Explanation Notice */}
          {portalMode === 'auditor' && (
            <div className="mb-5 p-4 rounded-xl bg-[#0F172A] border border-slate-700 text-xs space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Eye className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Auditor Access Protocol</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Auditors can review 5-point UK BS 7858 vetting files, Right to Work share codes, SIA credentials, and candidate documents in <strong className="text-white">strict read-only mode</strong>. Approving, rejecting, or altering records is disabled.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-800 font-mono">
                <span className="text-slate-400">Default Login:</span>
                <span className="text-amber-400 font-bold">auditor@uniguard.co.uk</span>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                {portalMode === 'auditor' ? 'Auditor Email Address' : 'Admin Email Address'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder={portalMode === 'auditor' ? 'auditor@uniguard.co.uk' : 'admin@uniguard.co.uk'}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-page"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Password</label>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-page"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 animate-pop-in">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: portalMode === 'auditor' ? '#4f46e5' : '#AF7C28' }}
            >
              {busy 
                ? 'Signing in…' 
                : portalMode === 'auditor' 
                ? 'Enter Auditor Panel (Read-Only)' 
                : 'Enter Admin Dashboard'} 
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Auditor Access Button */}
          {portalMode === 'auditor' && (
            <div className="mt-4 pt-4 border-t border-line text-center">
              <button
                type="button"
                onClick={auditorDemoLogin}
                className="w-full py-2 px-3 rounded-lg border border-slate-700 bg-[#0F172A] hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>One-Click Demo Auditor Access</span>
              </button>
            </div>
          )}

          <p className="text-[11px] text-tertiary text-center mt-5">
            {portalMode === 'auditor'
              ? 'Auditor sessions are monitored and logged for compliance assurance.'
              : 'Access is restricted to authorised recruitment staff.'}
          </p>
        </div>

        <p className="text-center mt-6">
          <button onClick={() => setActivePage('landing')} className="text-xs text-faint hover:text-primary transition-colors">← Back to website</button>
        </p>
      </div>
    </div>
  );
};

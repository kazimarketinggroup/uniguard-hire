import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Shield, ArrowRight, Eye, EyeOff, MailCheck } from 'lucide-react';
import { GoogleIcon } from '../common/GoogleIcon';
import { SecurityCaptcha } from '../common/SecurityCaptcha';

export const SignupPage: React.FC = () => {
  const { publicSignup, googleLogin, setActivePage } = useRecruitment();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    const result = await publicSignup(name, email, password, captchaToken ?? undefined);
    if (result.ok) {
      if (result.needsConfirm) {
        setPendingConfirm(email);
      } else {
        setActivePage('user-dashboard');
      }
    } else {
      setError('Signup failed. If this email was just registered, a confirmation link has already been sent — check your inbox. Otherwise try again in a few minutes.');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    const ok = await googleLogin();
    setGoogleBusy(false);
    if (!ok) setError('Google sign-in could not be started. Please try again.');
  };

  if (pendingConfirm) {
    return (
      <div className="min-h-screen bg-page flex flex-col">
        <nav className="border-b border-line bg-panel/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button onClick={() => setActivePage('landing')} className="flex flex-col items-center cursor-pointer">
              <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-9 w-auto object-contain" />
              <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
            </button>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(62,142,99,0.12)' }}>
              <MailCheck className="w-7 h-7" style={{ color: '#3E8E63' }} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Confirm your email</h2>
            <p className="text-secondary mb-8">
              We sent a confirmation link to <span className="font-semibold text-primary">{pendingConfirm}</span>.
              Click it to activate your account, then sign in to get started.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActivePage('login')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: '#AF7C28' }}
              >
                Go to sign in <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPendingConfirm(null)}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-secondary border border-line hover:border-line-strong hover:text-primary transition-colors"
              >
                Use a different email
              </button>
            </div>
            <p className="text-xs text-faint mt-6">
              Didn't get the email? Check your spam folder or try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Nav */}
      <nav className="border-b border-line bg-panel/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActivePage('landing')} className="flex flex-col items-center cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-9 w-auto object-contain" />
            <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
          </button>
          <button
            onClick={() => setActivePage('login')}
            className="text-sm font-medium text-secondary hover:text-primary transition-colors"
          >
            Already have an account? Sign in
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
              <Shield className="w-7 h-7" style={{ color: '#AF7C28' }} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Create Your Account</h2>
            <p className="text-sm text-secondary">Join Uniguard's careers portal to apply for security roles.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                autoComplete="name"
                className="w-full px-4 py-3 rounded-lg border border-line text-primary placeholder:text-faint focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.morgan@example.co.uk"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg border border-line text-primary placeholder:text-faint focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-line text-primary placeholder:text-faint focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-black/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-secondary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg border border-line text-primary placeholder:text-faint focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>

            <SecurityCaptcha onVerify={token => setCaptchaToken(token)} />

            <button
              type="submit"
              disabled={!captchaToken}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#AF7C28' }}
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line"></div>
            <span className="text-xs text-faint uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-line"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg border border-line bg-white text-sm font-semibold text-primary hover:border-line-strong hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            <span>{googleBusy ? 'Redirecting to Google…' : 'Sign up with Google'}</span>
          </button>

          <p className="mt-4 text-[11px] text-faint text-center leading-relaxed">
            By creating an account, you agree to Uniguard's{' '}
            <button type="button" onClick={() => setActivePage('terms')} className="text-secondary hover:text-primary underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" onClick={() => setActivePage('privacy-policy')} className="text-secondary hover:text-primary underline">Privacy Policy</button>.
          </p>

          <div className="mt-6 text-center">
            <button
              onClick={() => setActivePage('login')}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

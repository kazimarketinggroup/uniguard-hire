import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleIcon } from '../common/GoogleIcon';
import { SecurityCaptcha } from '../common/SecurityCaptcha';

export const LoginPage: React.FC = () => {
  const { publicLogin, googleLogin, setActivePage } = useRecruitment();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    const success = await publicLogin(email, password, captchaToken ?? undefined);
    if (success) {
      setActivePage('user-dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    const ok = await googleLogin();
    setGoogleBusy(false);
    if (!ok) setError('Google sign-in could not be started. Please try again.');
  };

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
            onClick={() => setActivePage('signup')}
            className="text-sm font-medium text-secondary hover:text-primary transition-colors"
          >
            Create an account
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
              <Shield className="w-7 h-7" style={{ color: '#AF7C28' }} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Welcome Back</h2>
            <p className="text-sm text-secondary">Sign in to your Uniguard careers account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-secondary">Password</label>
                <button
                  type="button"
                  onClick={() => setActivePage('forgot-password')}
                  className="text-xs font-medium text-[#AF7C28] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <SecurityCaptcha onVerify={token => setCaptchaToken(token)} />

            <button
              type="submit"
              disabled={!captchaToken}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#AF7C28' }}
            >
              <span>Sign In</span>
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
            <span>{googleBusy ? 'Redirecting to Google…' : 'Continue with Google'}</span>
          </button>

          <p className="mt-4 text-[11px] text-faint text-center leading-relaxed">
            By signing in, you agree to Uniguard's{' '}
            <button type="button" onClick={() => setActivePage('terms')} className="text-secondary hover:text-primary underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" onClick={() => setActivePage('privacy-policy')} className="text-secondary hover:text-primary underline">Privacy Policy</button>.
          </p>

          <div className="mt-6 text-center">
            <button
              onClick={() => setActivePage('signup')}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              Don't have an account? Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

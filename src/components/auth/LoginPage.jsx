import React, { useState } from 'react';
import { Vault, Lock, Mail, User, ArrowRight, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export const LoginPage = () => {
  const { login, register, addToast } = useAuth();
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('demo@homevault.app');
  const [password, setPassword] = useState('password123');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const handleDemoSignIn = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail || 'demo@homevault.app', 'password123');
    } catch (err) {
      try {
        await login('alex@homevault.io', 'password123');
      } catch (err2) {
        setError(err2.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo('');
    setLoading(true);

    try {
      if (viewMode === 'register') {
        if (!fullName.trim()) throw new Error('Please enter your full name');
        await register(fullName.trim(), email.trim(), password);
      } else if (viewMode === 'login') {
        await login(email.trim(), password);
      } else if (viewMode === 'forgot') {
        const res = await api.forgotPassword(email.trim());
        setSuccessInfo(res.message);
        if (res.devResetToken) {
          setResetToken(res.devResetToken);
          setViewMode('reset');
        }
      } else if (viewMode === 'reset') {
        const res = await api.resetPassword({ token: resetToken.trim(), newPassword });
        setSuccessInfo(res.message || 'Password reset successfully!');
        setPassword('');
        setTimeout(() => {
          setViewMode('login');
          setSuccessInfo('Password updated. You can now sign in with your new credentials.');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-slate-300/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-8 rounded-3xl border border-slate-200/80 bg-white shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 mb-1">
            <Vault className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">HomeVault</h1>
          <p className="text-xs text-indigo-600 font-bold tracking-wider uppercase">
            Smart Home Inventory & Asset Organizer
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {successInfo && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* View Mode: Forgot Password */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="text-center space-y-1">
              <h2 className="font-extrabold text-sm text-slate-900">Reset Password</h2>
              <p className="text-slate-500 text-[11px]">Enter your account email to receive a recovery token</p>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Generating Token...' : 'Generate Reset Token'}
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setViewMode('login'); setError(''); }}
              className="w-full text-center text-xs text-slate-500 hover:text-indigo-600 font-semibold pt-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}

        {/* View Mode: Enter Reset Token & New Password */}
        {viewMode === 'reset' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="text-center space-y-1">
              <h2 className="font-extrabold text-sm text-slate-900">Enter New Password</h2>
              <p className="text-slate-500 text-[11px]">Provide your recovery token and new password</p>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Reset Token</label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste 64-character token"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Password (min 8 chars, 1 letter, 1 number)</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setViewMode('login'); setError(''); }}
              className="w-full text-center text-xs text-slate-500 hover:text-indigo-600 font-semibold pt-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}

        {/* View Mode: Login / Register */}
        {(viewMode === 'login' || viewMode === 'register') && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {viewMode === 'register' && (
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500">
                  Password {viewMode === 'register' && '(min 8 chars, 1 letter, 1 number)'}
                </label>
                {viewMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setViewMode('forgot'); setError(''); setSuccessInfo(''); }}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={viewMode === 'register' ? 8 : 1}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : viewMode === 'register' ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {viewMode === 'login' && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('demo@homevault.app')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  ⚡ Demo User: Demo Member (Kitchen & Living Room)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('alex@homevault.io')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  ⚡ Demo User: Alex Vance (Full Multi-Room Vault)
                </button>
              </div>
            )}
          </form>
        )}

        {(viewMode === 'login' || viewMode === 'register') && (
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setViewMode(viewMode === 'register' ? 'login' : 'register');
                setError('');
                setSuccessInfo('');
              }}
              className="text-xs text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
            >
              {viewMode === 'register' ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Bell, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { changePassword } from '../services/authService';

// ── tiny reusable password input ───────────────────────────────────────────
const PasswordInput = ({ id, label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <KeyRound className="h-4 w-4" />
        </div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder-slate-400 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

// ── main page ───────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { user } = useAuth();

  // Password form state
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | { error: string }

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (form.newPw !== form.confirm) {
      setStatus({ error: 'New passwords do not match.' });
      return;
    }
    if (form.newPw.length < 6) {
      setStatus({ error: 'New password must be at least 6 characters.' });
      return;
    }

    setStatus('loading');
    try {
      await changePassword(form.current, form.newPw);
      setStatus('success');
      setForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setStatus({ error: err.response?.data?.message || 'Failed to change password. Please try again.' });
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-semibold text-sm mt-1">Manage your security and account preferences</p>
        </div>
      </div>

      {/* Account card */}
      <div className="space-y-3 mb-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Account</h2>
        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary-900 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-base">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div>
              <p className="font-black text-slate-900">{user?.name}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>
          {user?.verified && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200 shadow-sm flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-3 mb-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Preferences</h2>
        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Notifications</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Match alerts, welcome messages, and updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Enabled</span>
            <div className="h-5 w-9 bg-emerald-500 rounded-full flex items-center px-0.5 cursor-pointer">
              <div className="h-4 w-4 bg-white rounded-full ml-auto shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Security / Change Password ── */}
      <div className="space-y-3 mb-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Security</h2>

        {/* Change Password card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-4 p-5 border-b border-slate-50">
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Change Password</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Update your login credentials</p>
            </div>
          </div>

          {/* Change password form */}
          <div className="p-5">
            {/* Success banner */}
            {status === 'success' && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                Password changed successfully!
              </div>
            )}

            {/* Error banner */}
            {status?.error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                {status.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                id="current-password"
                label="Current Password"
                value={form.current}
                onChange={handleChange('current')}
                placeholder="Enter your current password"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput
                  id="new-password"
                  label="New Password"
                  value={form.newPw}
                  onChange={handleChange('newPw')}
                  placeholder="Min. 6 characters"
                />
                <PasswordInput
                  id="confirm-password"
                  label="Confirm New Password"
                  value={form.confirm}
                  onChange={handleChange('confirm')}
                  placeholder="Repeat new password"
                />
              </div>

              {/* Strength hint */}
              {form.newPw.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        form.newPw.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : i === 3 ? 'bg-blue-400' : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {form.newPw.length < 4 ? 'Weak' : form.newPw.length < 7 ? 'Fair' : form.newPw.length < 10 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-2 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-900 hover:bg-slate-900 text-white font-black rounded-xl shadow-lg shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Lock className="h-4 w-4" /> Update Password</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Account Security row */}
        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Account Security</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Role: {user?.role || 'Employee'}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-100">
            {user?.role || 'Employee'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

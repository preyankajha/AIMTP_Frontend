import { useState, useEffect } from 'react';
import { Mail, Key, Loader2, Save } from 'lucide-react';
import api from '../../services/api';

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: ''
  });

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      setSettings(data);
    } catch (error) {
      setErrorMsg('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data } = await api.put('/admin/settings', settings);
      setSuccessMsg(data.message || 'Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">
          Configure site-wide parameters like SMTP server credentials for outgoing emails.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Mail className="h-5 w-5 text-slate-400" />
            Email (SMTP) Configuration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMTP Host */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  SMTP Host
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="smtpHost"
                    value={settings.smtpHost}
                    onChange={handleChange}
                    placeholder="e.g., smtp.gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* SMTP Port */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  SMTP Port
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="smtpPort"
                    value={settings.smtpPort}
                    onChange={handleChange}
                    placeholder="e.g., 587"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SMTP User */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                SMTP User / Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="smtpUser"
                  value={settings.smtpUser}
                  onChange={handleChange}
                  placeholder="e.g., noreply@aimtp.in"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-sm"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* SMTP Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                SMTP Password / App Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="smtpPass"
                  value={settings.smtpPass}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-sm"
                />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 ml-1">
                Leave blank if no password is required. It is recommended to use App Passwords instead of your primary account password.
              </p>
            </div>

            {/* Messages */}
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold border border-emerald-200/50 animate-fade-in">
                {successMsg}
              </div>
            )}
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-200/50 animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-black text-sm shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              )}
              {saving ? 'Saving configuration...' : 'Save Config'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;

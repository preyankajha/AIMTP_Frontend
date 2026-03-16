import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Eye, EyeOff, Loader2, PartyPopper, ArrowLeft, ShieldCheck } from 'lucide-react';
import { forgotPassword, resetPassword } from '../services/authService';

const PasswordInput = ({ label, id, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-sm placeholder-slate-400"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (error) {
      // In a real app we might still show step 2 to prevent email enumeration,
      // but the backend handles that by returning success anyway.
      setErrorMsg(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      return setErrorMsg('Password must be at least 6 characters long');
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await resetPassword(email, otp, newPassword);
      setStep(3);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password. Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-primary-500/30">
      <div className="w-full max-w-[440px] animate-fade-in-up">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
          {/* Header Banner */}
          <div className="h-28 bg-slate-900 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 80%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)'}} />
            <ShieldCheck className="h-10 w-10 text-white z-10" />
          </div>

          <div className="p-8 md:p-10 -mt-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative z-20 mb-6 text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {step === 1 && "Reset Password"}
                {step === 2 && "Enter OTP"}
                {step === 3 && "Password Reset"}
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                {step === 1 && "Enter your registered email to receive an OTP."}
                {step === 2 && `OTP sent to ${email}`}
                {step === 3 && "You can now log in securely."}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3 mb-6 animate-shake shadow-sm">
                <span className="text-red-500 bg-white shadow-sm h-6 w-6 rounded-lg flex items-center justify-center shrink-0">!</span>
                {errorMsg}
              </div>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. employee@aimtp.in"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-sm placeholder-slate-400"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-black text-sm shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />}
                  {loading ? 'Sending Request...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* Step 2: Validate OTP & Set New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} // Numeric only
                    placeholder="••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 text-center tracking-[0.5em] text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-black placeholder-slate-300"
                  />
                </div>

                <div className="h-px w-full bg-slate-100 my-4" />

                <PasswordInput
                  id="new-password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a strong new password"
                />

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || newPassword.length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-black text-sm shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Verifying...' : 'Reset My Password'}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    Didn't receive the email? Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {step === 3 && (
              <div className="text-center animate-fade-in-up py-4">
                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100/50 shadow-inner">
                  <PartyPopper className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">All Set!</h3>
                <p className="text-slate-500 font-medium text-sm mb-8 px-4">
                  Your password has been successfully reset. You can now access your account with your new credentials.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-black text-sm shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98]"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

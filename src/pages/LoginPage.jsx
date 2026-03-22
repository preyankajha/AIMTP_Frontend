import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';
import { Repeat, ArrowRight, Eye, EyeOff, ShieldCheck, Zap, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        await googleLogin(tokenResponse.access_token);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to login with Google.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed')
  });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ ...formData, rememberMe });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Panel — Branding (Deep Blue) */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#002B5B] flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{backgroundImage: 'radial-gradient(circle at 10% 10%, #10b981 0%, transparent 40%), radial-gradient(circle at 90% 90%, #3b82f6 0%, transparent 40%)'}} 
        />
        
        {/* Header Branding */}
        <Link to="/" className="relative z-10 flex items-center gap-3 group/logo">
          <div className="h-10 w-10 flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-lg shadow-white/10 transition-transform group-hover/logo:scale-105 bg-white">
            <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">All India Mutual Transfer Portal</span>
        </Link>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg mb-20 animate-fade-in-up">
          <h1 className="text-5xl font-black text-white leading-[1.15] tracking-tight mb-8">
            Find your perfect transfer match across India
          </h1>
          <p className="text-blue-100/70 text-lg font-medium leading-relaxed mb-10 max-w-md">
            Connect with employees across all regions and divisions for a seamless mutual transfer experience.
          </p>

          <div className="space-y-6">
            {[
              { icon: UserCheck, text: "Verified employee profiles" },
              { icon: Zap, text: "Smart matching algorithm" },
              { icon: ShieldCheck, text: "Real-time notifications" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-white/50 group-hover:bg-[#05D38A] group-hover:border-[#05D38A] group-hover:text-[#002B5B] transition-all duration-300">
                  <span className="text-[10px] font-black italic">O</span>
                </div>
                <span className="text-white/80 font-semibold">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section Removed */}
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white lg:p-16">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile Header */}
          <Link to="/" className="mb-12 lg:hidden flex items-center gap-3 group/logo">
            <div className="h-9 w-9 bg-white rounded-full shadow-sm transition-transform group-hover/logo:scale-105 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
            </div>
            <span className="font-black text-[#002B5B] text-lg tracking-tight">All India Mutual Transfer Portal</span>
          </Link>

          <div className="text-center lg:text-left mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back</h1>
            <p className="text-slate-500 font-medium">Sign in to manage your transfer requests and find matches.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-3 mb-8 animate-shake">
              <span className="text-red-500 bg-white shadow-sm h-6 w-6 rounded-lg flex items-center justify-center font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#002B5B]/10 focus:border-[#002B5B] placeholder-slate-400 transition-all"
                placeholder="name@railnet.gov.in"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="block text-sm font-bold text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-black text-[#002B5B] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#002B5B]/10 focus:border-[#002B5B] placeholder-slate-400 transition-all pr-14"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 rounded-lg border-slate-300 text-[#002B5B] focus:ring-[#002B5B] transition-all cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#002B5B] hover:bg-[#003B7B] text-white font-black rounded-2xl shadow-xl shadow-[#002B5B]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or sign in with</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <button
              type="button"
              onClick={() => handleGoogleAuth()}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
              Google
            </button>
          </form>

          <div className="mt-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100" />
            NEW TO AIMTP?
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-bold mb-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#002B5B] font-black hover:underline underline-offset-4 decoration-2">
                Create one now
              </Link>
            </p>

            <div className="flex items-center justify-center gap-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" /> 256-bit SSL
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <UserCheck className="h-4 w-4" /> Verified Platform
              </div>
            </div>

            {/* Legal Links Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100/50 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Link to="/terms" className="hover:text-[#002B5B] transition-colors">Terms of Service</Link>
              <span className="text-slate-200">•</span>
              <Link to="/terms" className="hover:text-[#002B5B] transition-colors">Privacy Policy</Link>
              <span className="text-slate-200">•</span>
              <Link to="/terms" className="hover:text-[#002B5B] transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

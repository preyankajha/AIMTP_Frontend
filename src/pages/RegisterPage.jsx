import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';
import { Repeat, ArrowRight, ShieldCheck, UserCheck, Mail, Lock, User, Phone, Eye, EyeOff, Briefcase, MapPin, Building, Globe, ChevronRight } from 'lucide-react';

const InputField = ({ name, label, value, onChange, type = 'text', placeholder = '', icon: Icon }) => (
  <div>
    <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2" htmlFor={name}>
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        required
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder-slate-400 transition-all"
        style={Icon ? { paddingLeft: '2.5rem' } : {}}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [triggeredByGoogle, setTriggeredByGoogle] = useState(false);
  const [language, setLanguage] = useState('en');
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        await googleLogin(tokenResponse.access_token);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to sign up with Google.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Signup Failed')
  });

  const termsContent = {
    en: {
      title: "Terms and Conditions",
      content: "I confirm that I am an official employee of the respective sector. I understand that this platform is a facilitate for mutual transfers and the final approval depends on departmental authorities. I agree to provide accurate information and maintain the decorum of the portal.",
      accept: "I Accept and Agree",
      langSwitch: "हिंदी में पढ़ें"
    },
    hi: {
      title: "नियम और शर्तें",
      content: "मैं पुष्टि करता हूँ कि मैं संबंधित क्षेत्र का एक आधिकारिक कर्मचारी हूँ। मैं समझता हूँ कि यह मंच आपसी स्थानान्तरण के लिए एक सुविधा है और अंतिम अनुमोदन विभागीय अधिकारियों पर निर्भर करता है। मैं सटीक जानकारी प्रदान करने और पोर्टल की गरिमा बनाए रखने के लिए सहमत हूँ।",
      accept: "मैं स्वीकार करता हूँ",
      langSwitch: "Read in English"
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedDeclaration) {
      setError('Please accept the terms and conditions to proceed.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{termsContent[language].title}</h3>
                <button 
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                >
                  {termsContent[language].langSwitch}
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 max-h-[40vh] overflow-y-auto">
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {termsContent[language].content}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setAcceptedDeclaration(true);
                    setShowTermsModal(false);
                    if (triggeredByGoogle) {
                      setTriggeredByGoogle(false);
                      handleGoogleAuth();
                    }
                  }}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
                >
                  {termsContent[language].accept}
                </button>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Close without accepting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 20% 80%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)'}} />
        
        <Link to="/" className="relative z-10 flex items-center gap-3 group/logo">
          <div className="h-10 w-10 flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-lg shadow-white/10 transition-transform group-hover/logo:scale-105 bg-white">
            <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">All India Mutual Transfer Portal</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white leading-tight mb-4">Join thousands of employees finding their ideal transfer partner.</h2>
          <p className="text-white/50 font-medium leading-relaxed">Create an account to post your transfer request and instantly get matched with compatible employees across India.</p>
        </div>

        {/* Stats Section Removed */}
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-100 rounded-full blur-[120px] opacity-40 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-100 rounded-full blur-[100px] opacity-30 pointer-events-none -translate-x-1/2 translate-y-1/2" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          <Link to="/" className="mb-8 lg:hidden flex items-center gap-3 group/logo">
            <div className="h-9 w-9 bg-white rounded-full shadow-sm transition-transform group-hover/logo:scale-105 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
              <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
            </div>
            <span className="font-black text-primary-900 text-base">All India Mutual Transfer Portal</span>
          </Link>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Create an account</h1>
          <p className="text-slate-500 font-medium mb-8">Join the All India Mutual Transfer Portal to get started.</p>

          <div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 mb-6">
                <span className="shrink-0 text-red-500">⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <InputField name="name" label="Full Name" value={formData.name} onChange={handleChange} placeholder="John Doe" icon={User} />
                <InputField name="mobile" label="Mobile Number" value={formData.mobile} onChange={handleChange} type="tel" placeholder="9876543210" icon={Phone} />
                <div>
                  <InputField name="email" label="Email Address" value={formData.email} onChange={handleChange} type="email" placeholder="name@railnet.gov.in" icon={Mail} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      name="password" type={showPassword ? 'text' : 'password'} required
                      className="w-full px-4 py-3 pl-10 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder-slate-400 transition-all"
                      placeholder="••••••••" value={formData.password} onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2 group">
                <input 
                  type="checkbox" 
                  id="reg-declaration"
                  checked={acceptedDeclaration}
                  readOnly
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                />
                <label 
                  htmlFor="reg-declaration" 
                  onClick={() => setShowTermsModal(true)}
                  className="text-[11px] font-medium text-slate-500 leading-normal cursor-pointer select-none group-hover:text-slate-700 transition-colors"
                >
                  I confirm my official status and agree to the <span className="font-bold text-red-500 hover:text-red-700 underline decoration-2 underline-offset-2">Read Terms & Conditions</span>.
                </label>
              </div>

              <button
                type="submit" disabled={loading || !acceptedDeclaration}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary-900 hover:bg-slate-900 text-white font-black rounded-xl shadow-lg shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Create Account</>}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or sign up with</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!acceptedDeclaration) {
                    setTriggeredByGoogle(true);
                    setShowTermsModal(true);
                    return;
                  }
                  handleGoogleAuth();
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Google
              </button>

              <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100 font-medium mt-6">
                Already have an account?{' '}
                <Link to="/login" className="font-black text-primary-700 hover:text-primary-900 hover:underline">Sign in</Link>
              </p>

              {/* Legal Links Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100/50 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Link to="/terms" className="hover:text-primary-800 transition-colors">Terms</Link>
                <span className="text-slate-200">•</span>
                <Link to="/terms" className="hover:text-primary-800 transition-colors">Privacy</Link>
                <span className="text-slate-200">•</span>
                <Link to="/terms" className="hover:text-primary-800 transition-colors">Disclaimer</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

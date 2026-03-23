import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, MapPin, Building, Briefcase, Info, Phone, Mail, 
  ArrowRight, ShieldCheck, Calendar, User, UserCheck, 
  MessageCircle, Copy, Check, ExternalLink, Loader2, AlertCircle
} from 'lucide-react';
import { getTransferDetails } from '../services/transferService';
import { useAuth } from '../hooks/useAuth';
import { useMasterData } from '../context/MasterDataContext';
import { format } from 'date-fns';

const TransferDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { regionData } = useMasterData();
  
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getTransferDetails(id);
        setTransfer(data);
      } catch (err) {
        console.error('Error fetching transfer details:', err);
        setError(err.response?.data?.message || 'Failed to load transfer details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const zoneCode = (z) => z && regionData?.[z]?.code ? `(${regionData[z].code})` : '';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Loading Details...</p>
      </div>
    );
  }

  // Handle Unauthenticated View
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto my-12 animate-fade-in p-2 md:p-0">
         <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-900/5">
            <div className="flex flex-col lg:flex-row">
               <div className="flex-1 p-10 md:p-14 lg:p-20 text-center lg:text-left flex flex-col justify-center">
                  <div className="h-16 w-16 bg-primary-900/5 rounded-2xl flex items-center justify-center mb-8 mx-auto lg:mx-0">
                     <ShieldCheck className="h-8 w-8 text-primary-900" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 leading-tight">Authentication Required</h2>
                  <p className="text-lg text-slate-500 font-medium mb-10 max-w-md mx-auto lg:mx-0">
                     Please sign in to your mutual transfer portal account to view full request details, including secure contact information and professional credentials.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                     <Link 
                        to={`/login?returnTo=/transfers/${id}`}
                        className="px-10 py-4 bg-primary-900 text-white font-black rounded-2xl hover:bg-slate-900 transition-all uppercase text-sm tracking-widest shadow-xl shadow-primary-900/10"
                     >
                        Sign in to Account
                     </Link>
                     <Link 
                        to="/register"
                        className="px-10 py-4 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-sm tracking-widest border border-slate-200"
                     >
                        Create Account
                     </Link>
                  </div>
               </div>
               
               <div className="lg:w-[40%] bg-slate-50 p-10 md:p-14 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none transform translate-x-1/2 translate-y-1/2">
                     <Building className="h-64 w-64" />
                  </div>
                  <div className="h-24 w-24 bg-white rounded-3xl mb-6 shadow-xl flex items-center justify-center">
                     <Lock className="h-10 w-10 text-slate-300" />
                  </div>
                  <div className="space-y-3 w-full max-w-[240px]">
                     <div className="h-2 w-full bg-slate-200 rounded-full animate-pulse"></div>
                     <div className="h-2 w-3/4 bg-slate-200/60 rounded-full animate-pulse mx-auto"></div>
                     <div className="h-2 w-1/2 bg-slate-200/30 rounded-full animate-pulse mx-auto"></div>
                  </div>
                  <p className="mt-8 text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Secure Member Access Only</p>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-red-100 shadow-xl shadow-red-900/5 text-center">
        <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Error Loading Request</h2>
        <p className="text-slate-500 font-medium mb-8">{error || 'The requested transfer details are no longer available.'}</p>
        <button 
          onClick={() => navigate('/transfers/search')}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all uppercase text-sm tracking-widest"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Search
        </button>
      </div>
    );
  }

  const isMatched = transfer.status === 'matched';
  const employee = transfer.userId || {};
  const initials = employee.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      {/* ── Top Header and Navigation ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors group"
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Back to List
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Status:</span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest shadow-sm ${
            isMatched ? 'bg-green-500 text-white border-green-600' : 'bg-[#05D38A] text-white border-green-600'
          }`}>
            {transfer.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT COLUMN: Core Details ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Hero Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 bg-primary-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-primary-900/20">
                    {initials}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                      {employee.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                       <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-100">
                         <Building className="h-3.5 w-3.5" /> {transfer.sector}
                       </span>
                       <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-black uppercase tracking-widest border border-primary-100">
                         <Briefcase className="h-3.5 w-3.5" /> {transfer.designation}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end text-center md:text-right px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Request Posted On</p>
                   <div className="flex items-center gap-2 text-slate-900 overflow-hidden">
                      <Calendar className="h-4 w-4 text-primary-600" />
                      <p className="font-extrabold text-sm">{format(new Date(transfer.createdAt), 'dd MMMM, yyyy')}</p>
                   </div>
                </div>
              </div>

              {/* Transfer Flow */}
              <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                   <MapPin className="h-64 w-64" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-10 relative z-10">
                  {/* Current Location */}
                  <div className="flex-1 w-full text-center sm:text-left">
                     <span className="inline-block text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 px-3 py-1 bg-red-50 rounded-full border border-red-100">Current Posting</span>
                     <p className="text-3xl font-black text-slate-900 mb-2 leading-none">{transfer.currentStation}</p>
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                           <Building className="h-3.5 w-3.5 opacity-60" /> {transfer.currentDivision} Division
                        </p>
                        <p className="text-sm font-bold text-slate-400">{transfer.currentZone} {zoneCode(transfer.currentZone)}</p>
                     </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="shrink-0 h-14 w-14 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center text-primary-600">
                     <ArrowRight className="h-8 w-8 stroke-[3]" />
                  </div>

                  {/* Top Desired Choice */}
                  <div className="flex-1 w-full text-center sm:text-right">
                     <span className="inline-block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">Preferred Destination</span>
                     <p className="text-3xl font-black text-slate-900 mb-2 leading-none">
                        {transfer.desiredLocations?.[0]?.station || transfer.desiredStation}
                     </p>
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-500 flex items-center justify-center sm:justify-end gap-1.5">
                           {transfer.desiredLocations?.[0]?.division || transfer.desiredDivision} Division <Building className="h-3.5 w-3.5 opacity-60" />
                        </p>
                        <p className="text-sm font-bold text-slate-400">
                           {transfer.desiredLocations?.[0]?.zone || transfer.desiredZone} {zoneCode(transfer.desiredLocations?.[0]?.zone || transfer.desiredZone)}
                        </p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Working Condition Remarks */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary-600" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Working Condition Remarks</h3>
                 </div>
                 <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 relative group transition-all">
                    <div className="absolute -top-3 -left-3 bg-white p-2 rounded-xl border border-amber-100 shadow-sm text-amber-500">
                       <MessageCircle className="h-5 w-5" />
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed italic text-lg">
                       "{transfer.workplaceRemark}"
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Desired Postings Waterfall */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                      <MapPin className="h-5 w-5" />
                   </div>
                   <h2 className="text-xl font-black text-slate-800">All Desired Locations</h2>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {transfer.desiredLocations?.length || 1} Choices
                </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(transfer.desiredLocations || [{ 
                   station: transfer.desiredStation, 
                   division: transfer.desiredDivision, 
                   zone: transfer.desiredZone,
                   priority: 1 
                }]).map((loc, idx) => (
                  <div key={idx} className="bg-slate-50/80 p-5 rounded-[1.75rem] border border-slate-100 flex items-start gap-4 hover:border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300">
                     <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center font-black text-primary-600 shadow-sm border border-slate-50 shrink-0">
                        {loc.priority || idx + 1}
                     </div>
                     <div className="min-w-0">
                        <p className="font-black text-slate-900 text-lg leading-tight truncate">{loc.station}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1 truncate">{loc.division} Division</p>
                        <p className="text-xs font-bold text-slate-400 truncate">{loc.zone} {zoneCode(loc.zone)}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Actions and Professional Info ── */}
        <div className="space-y-8">
          {/* Contact Card (THE BIG ONE) */}
          <div className="bg-[#002B5B] dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary-900/30 relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
             
             <div className="h-16 w-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-6 relative z-10 backdrop-blur-md border border-white/10">
                <Phone className="h-7 w-7 text-emerald-400" />
             </div>
             
             <h3 className="text-xl font-black mb-1 relative z-10">Contact Details</h3>
             <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest mb-8 relative z-10">Available for matches</p>
             
             <div className="w-full space-y-4 relative z-10">
                {/* Email Row */}
                <div className="group bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-start text-left hover:bg-white/10 transition-all">
                   <div className="flex items-center gap-2 mb-1 w-full justify-between">
                      <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400/80">Email Address</span>
                      <button 
                         onClick={() => copyToClipboard(transfer.contactOptions?.email || employee.email, 'email')}
                         className="text-white/20 hover:text-white transition-colors"
                      >
                         {copied === 'email' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                   </div>
                   <div className="flex items-center gap-3 w-full">
                      <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                         <Mail className="h-4 w-4 text-white" />
                      </div>
                      <a href={`mailto:${transfer.contactOptions?.email || employee.email}`} className="text-sm font-black truncate hover:text-emerald-400 transition-colors">
                         {transfer.contactOptions?.email || employee.email || '—'}
                      </a>
                   </div>
                </div>

                {/* Phone Row */}
                <div className="group bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-start text-left hover:bg-white/10 transition-all">
                   <div className="flex items-center gap-2 mb-1 w-full justify-between">
                      <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400/80">Phone Number</span>
                      <button 
                         onClick={() => copyToClipboard(transfer.contactOptions?.phone || employee.mobile, 'phone')}
                         className="text-white/20 hover:text-white transition-colors"
                      >
                         {copied === 'phone' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                   </div>
                   <div className="flex items-center gap-3 w-full">
                      <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                         <Phone className="h-4 w-4 text-white" />
                      </div>
                      <a href={`tel:${transfer.contactOptions?.phone || employee.mobile}`} className="text-sm font-black truncate hover:text-emerald-400 transition-colors">
                         {transfer.contactOptions?.phone || employee.mobile || '—'}
                      </a>
                   </div>
                </div>

                {/* WhatsApp Row */}
                <div className="group bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl p-4 flex flex-col items-start text-left hover:bg-[#25D366]/20 transition-all">
                   <div className="flex items-center gap-2 mb-1 w-full justify-between">
                      <span className="text-[9px] uppercase font-black tracking-widest text-[#25D366]">WhatsApp</span>
                      <button 
                         onClick={() => copyToClipboard(transfer.contactOptions?.whatsapp || employee.whatsapp || employee.mobile, 'wa')}
                         className="text-[#25D366]/40 hover:text-[#25D366] transition-colors"
                      >
                         {copied === 'wa' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                   </div>
                   <div className="flex items-center gap-3 w-full">
                      <div className="h-8 w-8 bg-[#25D366] rounded-lg flex items-center justify-center shrink-0">
                         <MessageCircle className="h-4 w-4 text-white fill-white" />
                      </div>
                      <a 
                        href={`https://wa.me/${(transfer.contactOptions?.whatsapp || employee.whatsapp || employee.mobile || '').replace(/[^0-9]/g, '')}`} 
                        className="text-sm font-black truncate text-[#25D366] hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                         {transfer.contactOptions?.whatsapp || employee.whatsapp || employee.mobile || 'Connect' }
                         <ExternalLink className="inline h-3 w-3 ml-1.5" />
                      </a>
                   </div>
                </div>
             </div>

             <div className="mt-8 pt-8 border-t border-white/5 w-full flex items-center gap-3 opacity-60">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <p className="text-[10px] font-bold text-left leading-tight">These details are shared securely as per data privacy guidelines.</p>
             </div>
          </div>

          {/* Professional Credentials Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                   <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Professional Proof</h3>
             </div>

             <div className="space-y-5">
                <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</span>
                   <span className="text-sm font-black text-slate-900">{transfer.department}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</span>
                   <span className="text-sm font-black text-slate-900 text-right">{transfer.designation}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pay Level</span>
                   <span className="text-sm font-black text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100 tracking-tighter">{transfer.payLevel}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic Pay</span>
                   <span className="text-sm font-black text-slate-900">₹ {Number(transfer.basicPay).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                   <span className="text-sm font-black text-slate-900">{transfer.category}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selection Mode</span>
                   <span className="text-sm font-black text-slate-900">{transfer.modeOfSelection}</span>
                </div>
             </div>

             <div className="pt-4 flex items-center justify-center">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                   <Building className="h-3 w-3" />
                   Official Identity Verified
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDetailsPage;

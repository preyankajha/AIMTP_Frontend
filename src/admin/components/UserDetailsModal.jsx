import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, MapPin, Briefcase, 
  Calendar, ShieldCheck, ShieldAlert, Loader2, 
  ExternalLink, MessageSquare, Clock, ArrowRight,
  Shield, CheckCircle2, XCircle
} from 'lucide-react';
import { getUserDetails } from '../services/adminService';

const UserDetailsModal = ({ isOpen, onClose, userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await getUserDetails(userId);
          setData(result);
        } catch (err) {
          setError('Failed to load user details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col relative z-[100002] animate-fade-in-up overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-7 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">Member Profile</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Registration Record</span>
                <span className="text-[10px] font-black text-slate-300">•</span>
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-0.5">UID: {userId?.slice(-6).toUpperCase() || 'REF-ID'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-2xl transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-primary-400 animate-spin mb-4" />
              <p className="text-slate-500 font-bold">Fetching secure profile...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-8 text-center">
              <XCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
              <p className="text-rose-600 font-black">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-200 transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : data && (
            <>
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Shield className="h-32 w-32 text-slate-900" />
                </div>

                <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                  <div className="relative shrink-0 mx-auto sm:mx-0">
                    <div className="h-28 w-28 rounded-3xl bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=f1f5f9&color=475569&bold=true&size=256`} 
                        className="h-full w-full object-cover"
                        alt={data.user.name}
                      />
                    </div>
                    <div className={`absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg ${data.user.verified ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {data.user.verified ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-2">
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${data.user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-primary-50 text-primary-600 border-primary-200'}`}>
                         {data.user.role}
                       </span>
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${data.user.verified ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                         {data.user.verified ? 'Verified Active' : 'Account Suspended'}
                       </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">{data.user.name}</h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-y-2 gap-x-4 text-sm font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-300" /> {data.user.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-300" /> {data.user.mobile}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <Briefcase className="h-4 w-4" /> Work Profile
                   </h3>
                   <div className="space-y-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Department</span>
                        <span className="text-sm font-black text-slate-800">{data.user.department || 'Not Assigned'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Sub-Department</span>
                        <span className="text-sm font-black text-slate-800">{data.user.subDepartment || 'Not Assigned'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Designation</span>
                        <span className="text-sm font-black text-slate-800">{data.user.designation || 'Not Assigned'}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <MapPin className="h-4 w-4" /> Posting Context
                   </h3>
                   <div className="space-y-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Zone / Region</span>
                        <span className="text-sm font-black text-slate-800">{data.user.zone || 'Not Assigned'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Division</span>
                        <span className="text-sm font-black text-slate-800">{data.user.division || 'Not Assigned'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Station/Working In</span>
                        <span className="text-sm font-black text-slate-800">{data.user.station || 'Not Assigned'}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Activity Overview */}
              <div className="bg-white border border-slate-200 border-l-4 border-l-primary-500 rounded-[2rem] p-7 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="h-4 w-4" /> System Activity
                    </h3>
                    <div className="flex items-center gap-6">
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Transfers</p>
                          <p className="text-lg font-black text-slate-900">{data.transfers?.length || 0}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Matches</p>
                          <p className="text-lg font-black text-slate-900">{data.matches?.length || 0}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Member Since</p>
                      <p className="text-xs font-black text-slate-700">{new Date(data.user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                 </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black shadow-xl shadow-slate-900/10 transition-all active:scale-95 flex items-center gap-2"
          >
            Acknowledge Profile
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserDetailsModal;

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  MessageSquare, CheckCircle2, XCircle, Clock, 
  User, Calendar, MapPin, Briefcase, ChevronRight,
  Filter, Edit3, Trash2, Loader2, Search, ArrowRight,
  Check, X, AlertCircle, Database, ShieldCheck, FileCheck
} from 'lucide-react';
import api from '../../services/api';
import UserDetailsModal from '../components/UserDetailsModal';

const AdminSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'accepted' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [remark, setRemark] = useState('');

  // User details modal state
  const [userProfileModal, setUserProfileModal] = useState(false);
  const [profilesUserId, setProfilesUserId] = useState(null);

  const openUserProfile = (e, userId) => {
    e.stopPropagation();
    setProfilesUserId(userId);
    setUserProfileModal(true);
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/master-data/suggestions');
      setSuggestions(res.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      setProcessing(status);
      await api.patch(`/master-data/suggestions/${id}`, { 
        status, 
        adminRemark: remark 
      });
      fetchSuggestions();
      setReviewModal(false);
      setSelectedSuggestion(null);
      setRemark('');
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setProcessing('updating');
      await api.put(`/master-data/suggestions/${selectedSuggestion._id}`, {
        type: selectedSuggestion.type,
        details: selectedSuggestion.details
      });
      alert('Suggestion details updated successfully');
      fetchSuggestions();
    } catch (error) {
       alert('Error updating details: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const filtered = suggestions.filter(s => {
    const matchesTab = s.status === activeTab;
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = 
      s.details?.name?.toLowerCase().includes(searchLow) ||
      s.userId?.name?.toLowerCase().includes(searchLow) ||
      s.type.toLowerCase().includes(searchLow);
    return matchesTab && matchesSearch;
  });

  const getBadgeColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'accepted': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary-600" />
            Data Suggestions
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Review and process data entries suggested by platform users to improve our dataset.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 grow-0">
          {[
            { id: 'pending', label: 'Pending', icon: Clock, count: suggestions.filter(s => s.status === 'pending').length },
            { id: 'accepted', label: 'Accepted', icon: ShieldCheck, count: suggestions.filter(s => s.status === 'accepted').length },
            { id: 'approved', label: 'Merged', icon: Database, count: suggestions.filter(s => s.status === 'approved').length },
            { id: 'rejected', label: 'Rejected', icon: XCircle, count: suggestions.filter(s => s.status === 'rejected').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-600' : 'opacity-50'}`} />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, user or type..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
          <Loader2 className="h-10 w-10 text-primary-300 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Loading suggestions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-16 text-center shadow-sm">
          <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No suggestions found</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
            There are no {activeTab} suggestions that match your current search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(s => (
            <div 
              key={s._id}
              onClick={() => { setSelectedSuggestion(s); setReviewModal(true); }}
              className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md hover:border-primary-200 cursor-pointer transition-all group animate-slide-up"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getBadgeColor(s.status)}`}>
                  {s.type.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>

              <h2 className="text-lg font-black text-slate-900 mb-1 leading-tight group-hover:text-primary-600 transition-colors">
                {s.details?.name}
              </h2>
              
              <div className="flex flex-col gap-2 mt-4">
                <div 
                  className="flex items-center gap-2.5 text-slate-500 hover:text-primary-600 transition-colors group/user"
                  onClick={e => openUserProfile(e, s.userId?._id)}
                >
                  <div className="h-7 w-7 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover/user:border-primary-200 group-hover/user:bg-primary-50">
                    <User className="h-3.5 w-3.5 text-slate-400 group-hover/user:text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Suggested By</p>
                    <p className="text-xs font-black text-slate-700 truncate group-hover/user:text-primary-600">{s.userId?.name || 'Unknown User'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="h-7 w-7 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Location Context</p>
                    <p className="text-xs font-bold text-slate-600 truncate">
                      {s.details?.zone ? `${s.details.zone} → ${s.details.division}` : 'No Region Provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-primary-600">
                <span className="text-xs font-black uppercase tracking-widest">Review Record</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal using Portal */}
      {reviewModal && selectedSuggestion && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setReviewModal(false)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col relative z-[100000] animate-fade-in-up overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-7 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">Review Suggestion</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-sm ${getBadgeColor(selectedSuggestion.status)}`}>
                      {selectedSuggestion.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• RID: {selectedSuggestion._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setReviewModal(false)}
                className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-2xl transition-all active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-7 space-y-6 bg-slate-50/30">
               {/* User Context Card */}
               <div 
                  className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group/userc"
                  onClick={e => openUserProfile(e, selectedSuggestion.userId?._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover/userc:border-primary-100 transition-colors">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSuggestion.userId?.name || 'U')}&background=f1f5f9&color=475569&bold=true&size=128`} 
                        className="h-full w-full object-cover group-hover/userc:scale-110 transition-transform"
                        alt="Avatar"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">SUBMITTED BY</span>
                        {selectedSuggestion.userId?.role === 'admin' && <span className="bg-primary-50 text-primary-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Admin</span>}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight truncate group-hover/userc:text-primary-600 transition-colors">{selectedSuggestion.userId?.name}</h3>
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Posted {new Date(selectedSuggestion.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Sug. Type</p>
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                         <p className="text-xs font-black text-slate-700">{selectedSuggestion.type.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Contact Port</p>
                      <p className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <User className="h-3 w-3 text-slate-400" />
                        {selectedSuggestion.userId?.mobile || 'No Mobile Linked'}
                      </p>
                    </div>
                  </div>
               </div>

               {/* Editable Details Card */}
               <div className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                    <Edit3 className="h-20 w-20 text-slate-900" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2.5">
                       <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-black text-sm">
                          ID
                       </div>
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Proposed Attributes</h3>
                    </div>
                    <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest">Review & Edit</span>
                  </div>

                  <form onSubmit={handleUpdateDetails} className="space-y-5 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {['Location', 'Division'].includes(selectedSuggestion.type) && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1">Zone / Region</label>
                          <input 
                            type="text" 
                            value={selectedSuggestion.details?.zone || ''}
                            onChange={e => setSelectedSuggestion({ ...selectedSuggestion, details: { ...selectedSuggestion.details, zone: e.target.value }})}
                            className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all shadow-sm"
                          />
                        </div>
                      )}

                      {selectedSuggestion.type === 'Location' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1">Division</label>
                            <input 
                              type="text" 
                              value={selectedSuggestion.details?.division || ''}
                              onChange={e => setSelectedSuggestion({ ...selectedSuggestion, details: { ...selectedSuggestion.details, division: e.target.value }})}
                              className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1">Workstation Type</label>
                            <input 
                              type="text" 
                              value={selectedSuggestion.details?.workstationType || ''}
                              onChange={e => setSelectedSuggestion({ ...selectedSuggestion, details: { ...selectedSuggestion.details, workstationType: e.target.value }})}
                              className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all shadow-sm"
                            />
                          </div>
                        </>
                      )}

                      {['Department', 'SubDepartment', 'Designation'].includes(selectedSuggestion.type) && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1">Parent Dept. (Context)</label>
                          <input 
                            type="text" 
                            value={selectedSuggestion.details?.department || ''}
                            onChange={e => setSelectedSuggestion({ ...selectedSuggestion, details: { ...selectedSuggestion.details, department: e.target.value }})}
                            className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all shadow-sm"
                          />
                        </div>
                      )}

                      {['SubDepartment', 'Designation', 'Department'].some(t => t === selectedSuggestion.type) && selectedSuggestion.details?.subDepartment && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1">Sub-Department (Context)</label>
                          <input 
                            type="text" 
                            value={selectedSuggestion.details?.subDepartment || ''}
                            onChange={e => setSelectedSuggestion({ ...selectedSuggestion, details: { ...selectedSuggestion.details, subDepartment: e.target.value }})}
                            className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all shadow-sm"
                          />
                        </div>
                      )}

                      <div className="col-span-full space-y-2 pt-2">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
                          Proposed {
                            selectedSuggestion.type === 'Location' ? 'Station Name' : 
                            ['Department', 'SubDepartment', 'Designation'].includes(selectedSuggestion.type) ? 'Designation' :
                            selectedSuggestion.type.replace(/([A-Z])/g, ' $1').trim()
                          }
                        </label>
                        <input 
                          type="text" 
                          placeholder="Final name or designation..."
                          value={selectedSuggestion.details?.name || ''}
                          onChange={e => setSelectedSuggestion({ ...selectedSuggestion, details: { ...selectedSuggestion.details, name: e.target.value }})}
                          className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button 
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black shadow-xl shadow-slate-900/10 flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processing === 'updating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                        {processing === 'updating' ? 'Syncing...' : 'SAVE DATA CHANGES'}
                      </button>
                    </div>
                  </form>
               </div>

               {/* Remarks Card */}
               <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black shadow-sm">
                        <AlertCircle className="h-5 w-5" />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Resolution Remark</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Feedback sent to the user upon processing</p>
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Admin Remark / Feedback</label>
                    <textarea 
                      placeholder="Add a remark about this entry... e.g. Data added to master list."
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all min-h-[110px] resize-none shadow-inner"
                    />
                  </div>
               </div>

            </div>

            <div className="p-5 sm:p-7 border-t border-slate-100 bg-white/80 backdrop-blur-md rounded-b-[2.5rem] sticky bottom-0 z-20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleStatusUpdate(selectedSuggestion._id, 'accepted')}
                  disabled={processing}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-black text-xs sm:text-sm border-2 border-indigo-200 transition-all active:scale-95 disabled:opacity-50 group/acc"
                >
                  {processing === 'accepted' ? <Loader2 className="h-5 w-5 animate-spin mb-1" /> : <ShieldCheck className="h-5 w-5 mb-1 group-hover/acc:scale-110 transition-transform" />}
                  <span>Accept Only</span>
                  <span className="text-[9px] font-bold text-indigo-400 mt-1 uppercase tracking-widest hidden sm:block">Acknowledge</span>
                </button>

                <button 
                  onClick={() => handleStatusUpdate(selectedSuggestion._id, 'approved')}
                  disabled={processing}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 group/app"
                >
                  {processing === 'approved' ? <Loader2 className="h-5 w-5 animate-spin mb-1" /> : <Database className="h-5 w-5 mb-1 group-hover/app:scale-110 transition-transform" />}
                  <span>Approve & Write</span>
                  <span className="text-[9px] font-bold text-emerald-200 mt-1 uppercase tracking-widest hidden sm:block">Merge to DB</span>
                </button>
                
                <button 
                  onClick={() => handleStatusUpdate(selectedSuggestion._id, 'rejected')}
                  disabled={processing}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white hover:bg-rose-50 text-rose-500 rounded-2xl font-black text-xs sm:text-sm border-2 border-rose-100 hover:border-rose-200 transition-all active:scale-95 disabled:opacity-50 group/rej"
                >
                  {processing === 'rejected' ? <Loader2 className="h-5 w-5 animate-spin mb-1" /> : <XCircle className="h-5 w-5 mb-1 group-hover/rej:scale-110 transition-transform" />}
                  <span>Reject</span>
                  <span className="text-[9px] font-bold text-rose-300 mt-1 uppercase tracking-widest hidden sm:block">Discard</span>
                </button>
              </div>
              
              <div className="mt-4 flex gap-3 items-center text-[10px] sm:text-[11px] font-bold text-slate-500 p-4 bg-primary-50/40 rounded-xl border border-primary-100/50">
                <div className="h-5 w-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 shrink-0 font-black text-[10px]">i</div>
                <p>Registration entry will be strictly indexed immediately upon &quot;Approve & Write&quot;.</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* User Quick Profile Modal */}
      <UserDetailsModal 
        isOpen={userProfileModal}
        onClose={() => setUserProfileModal(false)}
        userId={profilesUserId}
      />
    </div>
  );
};

const SaveIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

export default AdminSuggestionsPage;

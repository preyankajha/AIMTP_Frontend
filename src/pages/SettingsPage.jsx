import { useState, useEffect } from 'react';
import { Settings, Bell, Lock, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Building2, Briefcase, MapPin, User, Save, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { changePassword, updateProfile } from '../services/authService';
import { useMasterData } from '../context/MasterDataContext';

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
  const { user, updateUserProfile, isProfileComplete } = useAuth();

  // Password form state
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | { error: string }

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    sector: user?.sector || '',
    department: user?.department || '',
    subDepartment: user?.subDepartment || '',
    designation: user?.designation || '',
    currentZone: user?.currentZone || '',
    currentDivision: user?.currentDivision || '',
    currentStation: user?.currentStation || '',
    payLevel: user?.payLevel || '',
    gradePay: user?.gradePay || '',
    basicPay: user?.basicPay || '',
    category: user?.category || '',
    workplaceRemark: user?.workplaceRemark || ''
  });

  const [otherValues, setOtherValues] = useState({
    department: '',
    subDepartment: '',
    designation: '',
    currentZone: '',
    currentDivision: '',
    currentStation: '',
    category: ''
  });

  const { 
    loading: loadingMaster, 
    regionData, 
    departments, 
    sectors, 
    categories, 
    payLevels, 
    getZoneList 
  } = useMasterData();

  const [profileStatus, setProfileStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && !isProfileComplete) {
      setIsEditing(true);
    }
  }, [user, isProfileComplete]);

  // Initialize "Other" logic when user data is available
  useEffect(() => {
    // Only run if master data is actually loaded and user exists
    if (!loadingMaster && user && sectors?.length > 0) {
      const updates = {};
      const formUpdates = {};

      const checkOther = (field, value, options) => {
        if (value && options && options.length > 0 && !options.includes(value)) {
          updates[field] = value;
          formUpdates[field] = 'Other';
        }
      };

      // Zone
      const zones = Object.keys(regionData || {});
      checkOther('currentZone', user.currentZone, zones);

      // Division
      if (user.currentZone && regionData[user.currentZone]?.divisions) {
        const divisions = Object.keys(regionData[user.currentZone].divisions || {});
        checkOther('currentDivision', user.currentDivision, divisions);
      }

      // Station
      if (user.currentZone && user.currentDivision && regionData[user.currentZone]?.divisions?.[user.currentDivision]) {
        const stations = regionData[user.currentZone].divisions[user.currentDivision];
        checkOther('currentStation', user.currentStation, stations);
      }

      // Department
      const depts = Object.keys(departments || {});
      checkOther('department', user.department, depts);

      // Sub-department
      if (user.department && departments[user.department]?.subDepartments) {
        const subDepts = Object.keys(departments[user.department].subDepartments || {});
        checkOther('subDepartment', user.subDepartment, subDepts);
      }

      // Designation
      if (user.department && user.subDepartment && departments[user.department]?.subDepartments?.[user.subDepartment]) {
        const designations = departments[user.department].subDepartments[user.subDepartment];
        checkOther('designation', user.designation, designations);
      }

      // Category
      checkOther('category', user.category, categories);

      if (Object.keys(formUpdates).length > 0) {
        setOtherValues(prev => ({ ...prev, ...updates }));
        setProfileForm(prev => ({ ...prev, ...formUpdates }));
      }
    }
  }, [user, regionData, departments, sectors, categories, loadingMaster]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'sector') { next.currentZone = ''; next.currentDivision = ''; next.currentStation = ''; }
      if (name === 'department') { next.subDepartment = ''; next.designation = ''; }
      if (name === 'currentZone') { next.currentDivision = ''; next.currentStation = ''; }
      if (name === 'currentDivision') { next.currentStation = ''; }
      return next;
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus('loading');
    
    // Prepare data by replacing 'Other' with actual custom text
    const finalData = { ...profileForm };
    Object.keys(otherValues).forEach(key => {
      if (finalData[key] === 'Other' && otherValues[key]) {
        finalData[key] = otherValues[key];
      }
    });

    try {
      const res = await updateProfile(finalData);
      updateUserProfile(res.user);
      setProfileStatus('success');
      setIsEditing(false);
      setTimeout(() => setProfileStatus(null), 3000);
    } catch (err) {
      setProfileStatus({ error: err.response?.data?.message || 'Failed to update profile.' });
    }
  };

  const handleCancelProfile = () => {
    setProfileForm({
      sector: user?.sector || '',
      department: user?.department || '',
      subDepartment: user?.subDepartment || '',
      designation: user?.designation || '',
      currentZone: user?.currentZone || '',
      currentDivision: user?.currentDivision || '',
      currentStation: user?.currentStation || '',
      payLevel: user?.payLevel || '',
      gradePay: user?.gradePay || '',
      basicPay: user?.basicPay || '',
      category: user?.category || '',
      workplaceRemark: user?.workplaceRemark || ''
    });
    setIsEditing(false);
    setProfileStatus(null);
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage your account preferences</p>
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

      {/* Preferences */}
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

      {/* Working Profile */}
      <div className="space-y-3 mb-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Working Profile</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-5 border-b border-slate-50">
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Employee Details</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Keep your work details updated for faster transfer requests</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white font-black rounded-lg text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 transition-all active:scale-95"
              >
                <Settings className="h-3 w-3" /> Edit Profile
              </button>
            )}
          </div>

          <div className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-10">
              {profileStatus === 'success' && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-2 text-sm font-medium animate-fade-in text-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> profile updated successfully!
                </div>
              )}
              {profileStatus?.error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-2 text-sm font-medium animate-fade-in text-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-500" /> {profileStatus.error}
                </div>
              )}

              {/* Step 1: Sector Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                   <div className="h-1.5 w-4 bg-primary-600 rounded-full" />
                   <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Step 1: Primary Sector</h3>
                </div>
                <div className="max-w-md">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Sector</label>
                    <div className="relative">
                      <select 
                        name="sector" value={profileForm.sector} onChange={handleProfileChange} title={profileForm.sector}
                        disabled={!isEditing}
                        className={`w-full pl-4 pr-10 py-3 ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed font-medium' : 'bg-primary-50/30 border-primary-100 text-slate-800 font-black focus:ring-4 focus:ring-primary-500/10'} border rounded-xl text-sm appearance-none whitespace-normal shadow-sm transition-all`}
                      >
                        <option value="">Choose your primary sector</option>
                        {sectors?.map(group => (
                          <optgroup key={group.group} label={group.group}>
                            {group.options.map(opt => (
                              <option 
                                key={opt.value} 
                                value={opt.value}
                                className={!opt.active ? 'text-slate-400 font-normal italic' : ''}
                                style={!opt.active ? { color: '#94a3b8' } : {}}
                              >
                                {opt.label} {!opt.active ? '(Coming Soon)' : ''}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-600 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Handle Profile Fields visibility based on Sector Integration */}
              {!profileForm.sector ? (
                <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                    <User className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Please select a sector to complete your profile</p>
                </div>
              ) : (() => {
                  const flatSectors = sectors?.flatMap(g => g.options || []) || [];
                  const selectedSectorObj = flatSectors.find(o => o.value === profileForm.sector);
                  const isIntegrated = selectedSectorObj?.active === true;

                  if (!isIntegrated) {
                    return (
                      <div className="py-12 px-6 text-center bg-slate-50 rounded-3xl border border-slate-100 animate-slide-up">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                          <Shield className="h-6 w-6 opacity-20" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-widest">Coming Soon</h4>
                        <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                          Detailed profile options for <span className="font-bold text-slate-700 underline">{selectedSectorObj?.label || profileForm.sector}</span> are launching soon. 
                          You can still save your sector preference to receive updates.
                        </p>
                        <div className="mt-8">
                           <button 
                             type="submit" disabled={profileStatus === 'loading'}
                             className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
                           >
                             Save Selection
                           </button>
                           {isEditing && (
                             <button 
                               type="button" onClick={handleCancelProfile}
                               className="px-8 py-3 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
                             >
                               Cancel
                             </button>
                           )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-12 animate-slide-up">
                      {/* Section 1: Workplace Location */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                           <div className="h-1 w-4 bg-primary-600 rounded-full" />
                           <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Workplace Location</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Zone / Region</label>
                            <div className="relative">
                              <select 
                                name="currentZone" value={profileForm.currentZone} onChange={handleProfileChange} title={profileForm.currentZone}
                                disabled={!isEditing}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-700'} border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Zone</option>
                                {getZoneList().map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {profileForm.currentZone === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Zone Name" value={otherValues.currentZone}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, currentZone: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Division</label>
                            <div className="relative">
                              <select 
                                name="currentDivision" value={profileForm.currentDivision} onChange={handleProfileChange} disabled={!profileForm.currentZone || !isEditing} title={profileForm.currentDivision}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Division</option>
                                {profileForm.currentZone && regionData?.[profileForm.currentZone] ? 
                                  Object.keys(regionData[profileForm.currentZone].divisions).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  )) : null
                                }
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {profileForm.currentDivision === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Division Name" value={otherValues.currentDivision}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, currentDivision: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Station / Unit</label>
                            <div className="relative">
                              <select 
                                name="currentStation" value={profileForm.currentStation} onChange={handleProfileChange} disabled={!profileForm.currentDivision || !isEditing} title={profileForm.currentStation}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Station</option>
                                {profileForm.currentZone && profileForm.currentDivision && regionData?.[profileForm.currentZone]?.divisions[profileForm.currentDivision] ? 
                                  regionData[profileForm.currentZone].divisions[profileForm.currentDivision].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  )) : null
                                }
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {profileForm.currentStation === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Station Name" value={otherValues.currentStation}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, currentStation: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Workplace Remark Section */}
                        <div className="mt-6 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Condition Remarks <span className="text-red-500">*</span></label>
                          <textarea 
                            name="workplaceRemark" 
                            value={profileForm.workplaceRemark} 
                            onChange={handleProfileChange}
                            required
                            disabled={!isEditing}
                            maxLength={300}
                            placeholder="Briefly describe the working conditions, duty type, or any other relevant details about your current posting..."
                            className={`w-full px-4 py-3 ${!isEditing ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 resize-none h-24`}
                          />
                          <p className="text-[10px] text-slate-400 font-bold ml-1 text-right">{profileForm.workplaceRemark?.length || 0}/300 characters</p>
                        </div>
                      </div>

                      {/* Section 2: Professional Details */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                           <div className="h-1 w-4 bg-primary-600 rounded-full" />
                           <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Job Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                            <div className="relative">
                              <select 
                                name="department" value={profileForm.department} onChange={handleProfileChange} title={profileForm.department}
                                disabled={!isEditing}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Department</option>
                                {Object.keys(departments || {}).map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {profileForm.department === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Department Name" value={otherValues.department}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, department: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-department</label>
                            <div className="relative">
                              <select 
                                name="subDepartment" value={profileForm.subDepartment} onChange={handleProfileChange} disabled={!profileForm.department || !isEditing} title={profileForm.subDepartment}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Sub-department</option>
                                {profileForm.department && departments?.[profileForm.department] ? 
                                  Object.keys(departments[profileForm.department].subDepartments).map(sd => (
                                    <option key={sd} value={sd}>{sd}</option>
                                  )) : null
                                }
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {profileForm.subDepartment === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Sub-department Name" value={otherValues.subDepartment}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, subDepartment: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                            <div className="relative">
                              <select 
                                name="designation" value={profileForm.designation} onChange={handleProfileChange} disabled={!profileForm.subDepartment || !isEditing} title={profileForm.designation}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Designation</option>
                                {(profileForm.department && profileForm.subDepartment && departments?.[profileForm.department]?.subDepartments[profileForm.subDepartment]) ? 
                                  departments[profileForm.department].subDepartments[profileForm.subDepartment].map(design => (
                                    <option key={design} value={design}>{design}</option>
                                  )) : null
                                }
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {profileForm.designation === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Designation" value={otherValues.designation}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, designation: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Pay and Category */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                           <div className="h-1 w-4 bg-primary-600 rounded-full" />
                           <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pay & Personal</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pay Level (7th CPC)</label>
                            <div className="relative">
                              <select 
                                name="payLevel" value={profileForm.payLevel} onChange={handleProfileChange}
                                disabled={!isEditing}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Level</option>
                                {payLevels?.map(level => (
                                  <option key={level} value={level}>{level}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Pay / Level Pay</label>
                            <input 
                              type="number" name="gradePay" value={profileForm.gradePay} onChange={handleProfileChange}
                              disabled={!isEditing}
                              placeholder="e.g. 4200"
                              className={`w-full px-4 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20`}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Basic Pay</label>
                            <input 
                              type="number" name="basicPay" value={profileForm.basicPay} onChange={handleProfileChange}
                              min="18000"
                              disabled={!isEditing}
                              placeholder="Min. 18000"
                              className={`w-full px-4 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20`}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <div className="relative">
                              <select 
                                name="category" value={profileForm.category} onChange={handleProfileChange} title={profileForm.category}
                                disabled={!isEditing}
                                className={`w-full pl-4 pr-10 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 appearance-none whitespace-normal`}
                              >
                                <option value="">Select Category</option>
                                {categories?.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {profileForm.category === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Category" value={otherValues.category}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, category: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-50">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={handleCancelProfile}
                              className="px-8 py-3.5 text-slate-400 hover:text-slate-600 font-black rounded-xl text-sm uppercase tracking-widest transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit" disabled={profileStatus === 'loading'}
                              className="flex items-center justify-center gap-2 px-10 py-3.5 bg-primary-900 hover:bg-slate-900 text-white font-black rounded-xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-60 text-sm uppercase tracking-widest"
                            >
                              {profileStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 px-10 py-3.5 bg-primary-900 hover:bg-slate-900 text-white font-black rounded-xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
                          >
                            <Settings className="h-4 w-4" /> Edit Profile Details
                          </button>
                        )}
                      </div>
                    </div>
                  );
              })()}
            </form>
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

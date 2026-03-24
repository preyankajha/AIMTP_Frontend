import { useState, useEffect, useRef } from 'react';
import { Settings, Bell, Lock, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Building2, Briefcase, MapPin, User, Save, Loader2, ChevronDown, CheckCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { changePassword, updateProfile } from '../services/authService';
import { useMasterData } from '../context/MasterDataContext';
import SearchableSelect from '../components/SearchableSelect';

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
    currentWorkstation: user?.currentWorkstation || '',
    currentLocation: user?.currentLocation || '',
    currentStation: user?.currentStation || '',
    payLevel: user?.payLevel || '',
    gradePay: user?.gradePay || '',
    basicPay: user?.basicPay || '',
    category: user?.category || '',
    modeOfSelection: user?.modeOfSelection || '',
    workplaceRemark: user?.workplaceRemark || '',
    appointmentDate: user?.appointmentDate ? user.appointmentDate.split('T')[0] : '',
    mobile: user?.mobile || '',
    whatsapp: user?.whatsapp || ''
  });

  const [otherValues, setOtherValues] = useState({
    department: '',
    subDepartment: '',
    designation: '',
    currentZone: '',
    currentDivision: '',
    currentWorkstation: '',
    currentLocation: '',
    category: '',
    modeOfSelection: ''
  });

  const { 
    loading: loadingMaster, 
    regionData, 
    departments, 
    sectors, 
    categories, 
    payLevels, 
    modeOfSelection,
    getZoneList,
    workstationTypes 
  } = useMasterData();

  const [profileStatus, setProfileStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef(null);

  const triggerToast = () => {
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 3000);
  };

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

      // Workstation & Location
      if (user.currentZone && user.currentDivision && regionData[user.currentZone]?.divisions?.[user.currentDivision]) {
        const workstations = Object.keys(regionData[user.currentZone].divisions[user.currentDivision]);
        checkOther('currentWorkstation', user.currentWorkstation, workstations);
        const locations = user.currentWorkstation ? regionData[user.currentZone].divisions[user.currentDivision][user.currentWorkstation] || [] : [];
        checkOther('currentLocation', user.currentLocation, locations);
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
      
      // Mode of Selection — modeOfSelection is [{value, label}], so check by value
      if (user.modeOfSelection && Array.isArray(modeOfSelection) && modeOfSelection.length > 0) {
        const found = modeOfSelection.some(m => m.value === user.modeOfSelection);
        if (!found) {
          updates['modeOfSelection'] = user.modeOfSelection;
          formUpdates['modeOfSelection'] = 'Other';
        }
      }

      if (Object.keys(formUpdates).length > 0) {
        setOtherValues(prev => ({ ...prev, ...updates }));
        setProfileForm(prev => ({ ...prev, ...formUpdates }));
      }
    }
  }, [user, regionData, departments, sectors, categories, loadingMaster]);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleProfileChange = (e) => {
    // Check if e is a standard event or a direct value from SearchableSelect
    const name = e.target ? e.target.name : null;
    const value = e.target ? e.target.value : e;
    
    // If it's a SearchableSelect call, we need the name manually or use a wrapper
    // But since I'm calling it like handleProfileSelect('fieldName', val), I'll add that helper
    setProfileForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'sector') { next.currentZone = ''; next.currentDivision = ''; next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'department') { next.subDepartment = ''; next.designation = ''; }
      if (name === 'currentZone') { next.currentDivision = ''; next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'currentDivision') { next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'currentWorkstation') { next.currentLocation = ''; }
      return next;
    });
  };

  const handleProfileSelect = (name, value) => {
    setProfileForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'sector') { next.currentZone = ''; next.currentDivision = ''; next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'department') { next.subDepartment = ''; next.designation = ''; }
      if (name === 'currentZone') { next.currentDivision = ''; next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'currentDivision') { next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'currentWorkstation') { next.currentLocation = ''; }
      return next;
    });
    
    // Clear custom "Other" input if "Other" is selected
    if (value === 'Other') {
      setOtherValues(prev => ({ ...prev, [name]: '' }));
    }
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

    // Ensure currentStation is synced with currentLocation for completeness check
    if (finalData.currentLocation) {
      finalData.currentStation = finalData.currentLocation;
    }

    try {
      const res = await updateProfile(finalData);
      updateUserProfile(res.user);
      triggerToast();
      setProfileStatus(null);
      setIsEditing(false);
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
      modeOfSelection: user?.modeOfSelection || '',
      currentZone: user?.currentZone || '',
      currentDivision: user?.currentDivision || '',
      currentWorkstation: user?.currentWorkstation || '',
      currentLocation: user?.currentLocation || '',
      payLevel: user?.payLevel || '',
      gradePay: user?.gradePay || '',
      basicPay: user?.basicPay || '',
      category: user?.category || '',
      workplaceRemark: user?.workplaceRemark || '',
      appointmentDate: user?.appointmentDate ? user.appointmentDate.split('T')[0] : '',
      mobile: user?.mobile || '',
      whatsapp: user?.whatsapp || ''
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

      {/* ── Auto-dismiss success toast ── */}
      <div
        style={{ transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        className={`fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none`}
      >
        <div
          style={{ transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          className={`flex flex-col items-center gap-4 bg-white px-10 py-8 rounded-3xl shadow-2xl border border-emerald-100 relative overflow-hidden ${
            showToast ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          }`}
        >
          <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <CheckCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="text-center">
            <p className="font-black text-xl text-slate-900 mb-1">Profile Updated!</p>
            <p className="text-slate-500 text-sm font-medium">Your changes have been saved successfully.</p>
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-full"
            style={{
              width: showToast ? '0%' : '100%',
              transition: showToast ? 'width 3s linear' : 'none',
            }}
          />
        </div>
      </div>
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
                    <SearchableSelect
                      id="sector"
                      value={profileForm.sector}
                      onChange={(val) => handleProfileSelect('sector', val)}
                      disabled={!isEditing}
                      placeholder="Choose your primary sector"
                      options={sectors?.map(group => ({
                        group: group.group,
                        options: group.options.map(opt => ({
                          value: opt.value,
                          label: `${opt.label} ${!opt.active ? '(Coming Soon)' : ''}`,
                          disabled: !opt.active
                        }))
                      })) || []}
                    />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Zone / Region</label>
                            <SearchableSelect
                              id="currentZone"
                              value={profileForm.currentZone}
                              onChange={(val) => handleProfileSelect('currentZone', val)}
                              disabled={!isEditing}
                              placeholder="Select Zone"
                              options={[
                                ...getZoneList().filter(z => z.value?.toLowerCase() !== 'other'),
                                { value: 'Other', label: 'Other (Not in list)' }
                              ]}
                            />
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
                            <SearchableSelect
                              id="currentDivision"
                              value={profileForm.currentDivision}
                              onChange={(val) => handleProfileSelect('currentDivision', val)}
                              disabled={!profileForm.currentZone || !isEditing}
                              placeholder="Select Division"
                              options={
                                profileForm.currentZone && regionData?.[profileForm.currentZone]?.divisions 
                                  ? [
                                      ...Object.keys(regionData[profileForm.currentZone].divisions)
                                        .filter(d => d.toLowerCase() !== 'other')
                                        .map(d => ({ value: d, label: d })),
                                      { value: 'Other', label: 'Other (Not in list)' }
                                    ]
                                  : []
                              }
                            />
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Workstation Type</label>
                            <SearchableSelect
                              id="currentWorkstation"
                              value={profileForm.currentWorkstation}
                              onChange={(val) => handleProfileSelect('currentWorkstation', val)}
                              disabled={!profileForm.currentDivision || !isEditing}
                              placeholder="Select Workstation"
                              options={[
                                ...(workstationTypes?.filter(w => w.toLowerCase() !== 'other').map(w => ({ value: w, label: w })) || []),
                                { value: 'Other', label: 'Other (Not in list)' }
                              ]}
                            />
                            {profileForm.currentWorkstation === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Workstation Name" value={otherValues.currentWorkstation}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, currentWorkstation: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Location / Unit</label>
                            <SearchableSelect
                              id="currentLocation"
                              value={profileForm.currentLocation}
                              onChange={(val) => handleProfileSelect('currentLocation', val)}
                              disabled={!profileForm.currentWorkstation || !isEditing}
                              placeholder="Select Details"
                              options={
                                profileForm.currentZone && profileForm.currentDivision && profileForm.currentWorkstation && regionData?.[profileForm.currentZone]?.divisions?.[profileForm.currentDivision]?.[profileForm.currentWorkstation]
                                  ? [
                                      ...regionData[profileForm.currentZone].divisions[profileForm.currentDivision][profileForm.currentWorkstation]
                                        .filter(l => l.toLowerCase() !== 'other')
                                        .map(l => ({ value: l, label: l })),
                                      { value: 'Other', label: 'Other (Not in list)' }
                                    ]
                                  : []
                              }
                            />
                            {profileForm.currentLocation === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Location Name" value={otherValues.currentLocation}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, currentLocation: e.target.value})}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                            <SearchableSelect
                              id="department"
                              value={profileForm.department}
                              onChange={(val) => handleProfileSelect('department', val)}
                              disabled={!isEditing}
                              placeholder="Select Department"
                              options={[
                                ...Object.keys(departments || {}).filter(d => d.toLowerCase() !== 'other').map(d => ({ value: d, label: d })),
                                { value: 'Other', label: 'Other (Not in list)' }
                              ]}
                            />
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
                            <SearchableSelect
                              id="subDepartment"
                              value={profileForm.subDepartment}
                              onChange={(val) => handleProfileSelect('subDepartment', val)}
                              disabled={!profileForm.department || !isEditing}
                              placeholder="Select Sub-department"
                              options={
                                profileForm.department && departments?.[profileForm.department]
                                  ? [
                                      ...Object.keys(departments[profileForm.department].subDepartments)
                                        .filter(sd => sd.toLowerCase() !== 'other')
                                        .map(sd => ({ value: sd, label: sd })),
                                      { value: 'Other', label: 'Other (Not in list)' }
                                    ]
                                  : []
                              }
                            />
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
                            <SearchableSelect
                              id="designation"
                              value={profileForm.designation}
                              onChange={(val) => handleProfileSelect('designation', val)}
                              disabled={!profileForm.subDepartment || !isEditing}
                              placeholder="Select Designation"
                              options={
                                (profileForm.department && profileForm.subDepartment && departments?.[profileForm.department]?.subDepartments[profileForm.subDepartment])
                                  ? [
                                      ...departments[profileForm.department].subDepartments[profileForm.subDepartment]
                                        .filter(design => design.toLowerCase() !== 'other')
                                        .map(design => ({ value: design, label: design })),
                                      { value: 'Other', label: 'Other (Not in list)' }
                                    ]
                                  : []
                              }
                            />
                            {profileForm.designation === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Designation" value={otherValues.designation}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, designation: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mode of Selection</label>
                             <SearchableSelect
                               id="modeOfSelection"
                               value={profileForm.modeOfSelection}
                               onChange={(val) => handleProfileSelect('modeOfSelection', val)}
                               disabled={!isEditing}
                               placeholder="Select Mode"
                               options={[
                                 ...(modeOfSelection?.filter(m => m.value?.toLowerCase() !== 'other' && m.label?.toLowerCase() !== 'other') || []),
                                 { value: 'Other', label: 'Other (Not in list)' }
                               ]}
                             />
                             {profileForm.modeOfSelection === 'Other' && (
                               <input 
                                 type="text" placeholder="Enter Mode of Selection" value={otherValues.modeOfSelection}
                                 disabled={!isEditing}
                                 onChange={(e) => setOtherValues({...otherValues, modeOfSelection: e.target.value})}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pay Level (7th CPC)</label>
                            <SearchableSelect
                              id="payLevel"
                              value={profileForm.payLevel}
                              onChange={(val) => handleProfileSelect('payLevel', val)}
                              disabled={!isEditing}
                              placeholder="Select Level"
                              options={payLevels?.map(level => ({ value: level, label: level })) || []}
                            />
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
                            <SearchableSelect
                              id="category"
                              value={profileForm.category}
                              onChange={(val) => handleProfileSelect('category', val)}
                              disabled={!isEditing}
                              placeholder="Select Category"
                              options={[
                                ...(categories?.map(c => ({ value: c, label: c })) || []),
                                { value: 'Other', label: 'Other (Not in list)' }
                              ]}
                            />
                            {profileForm.category === 'Other' && (
                              <input 
                                type="text" placeholder="Enter Category" value={otherValues.category}
                                disabled={!isEditing}
                                onChange={(e) => setOtherValues({...otherValues, category: e.target.value})}
                                className={`w-full px-4 py-2 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-primary-900'} border border-primary-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500/20 mt-1 animate-slide-up`}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Appointment</label>
                             <input 
                               type="date" name="appointmentDate" value={profileForm.appointmentDate} onChange={handleProfileChange}
                               disabled={!isEditing}
                               className={`w-full px-4 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20`}
                             />
                          </div>
                        </div>
                      </div>
                      
                      {/* Section 4: Contact Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                           <div className="h-1 w-4 bg-emerald-600 rounded-full" />
                           <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Contact Options</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number (Primary)</label>
                            <input 
                              type="text" name="mobile" value={profileForm.mobile} onChange={handleProfileChange}
                              disabled={!isEditing}
                              placeholder="10-digit mobile number"
                              className={`w-full px-4 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                            <input 
                              type="text" name="whatsapp" value={profileForm.whatsapp} onChange={handleProfileChange}
                              disabled={!isEditing}
                              placeholder="10-digit whatsapp number"
                              className={`w-full px-4 py-2.5 ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20`}
                            />
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

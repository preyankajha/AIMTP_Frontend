import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMasterData } from '../context/MasterDataContext';
import { User, Mail, Phone, Clock, ShieldCheck, ShieldAlert, Building, Edit3, Loader2, PartyPopper, Camera, Briefcase, MapPin, Settings } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { sendVerificationOtp, verifyEmailOtp, uploadProfileImage, updateProfileImageUrl, updateProfile } from '../services/authService';
import UserAvatar from '../components/UserAvatar';
import SearchableSelect from '../components/SearchableSelect';

const InfoRow = ({ icon: Icon, label, value, href }) => {
  const content = (
    <div className="flex items-start gap-4">
      <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-slate-900 font-bold text-sm mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );

  if (href && value) {
    return (
      <a href={href} className="group block" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
        {content}
      </a>
    );
  }

  return content;
};

const ProfilePage = () => {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  // Verification state
  const [isVerified, setIsVerified] = useState(user?.verified || false);
  const [otpStep, setOtpStep] = useState('idle'); // idle | sending | sent | verifying | success | error
  const [otpValue, setOtpValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchParams] = useSearchParams();
  const shouldEdit = searchParams.get('edit') === 'true';

  const [uploadingImg, setUploadingImg] = useState(false);
  const [isEditing, setIsEditing] = useState(shouldEdit);

  useEffect(() => {
    if (shouldEdit) setIsEditing(true);
  }, [shouldEdit]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
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
    departments: masterDepartments, 
    sectors, 
    categories, 
    payLevels, 
    modeOfSelection,
    getZoneList,
    workstationTypes 
  } = useMasterData();

  const [profileStatus, setProfileStatus] = useState(null);

  const zoneCode = user?.currentZone && regionData?.[user.currentZone]?.code 
    ? `(${regionData[user.currentZone].code})` 
    : '';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently Joined';

  // Initialize "Other" logic when user data is available
  useEffect(() => {
    if (!loadingMaster && user && sectors?.length > 0) {
      const updates = {};
      const formUpdates = {};

      const checkOther = (field, value, options) => {
        if (value && options && options.length > 0 && !options.includes(value)) {
          updates[field] = value;
          formUpdates[field] = 'Other';
        }
      };

      const zones = Object.keys(regionData || {});
      checkOther('currentZone', user.currentZone, zones);

      if (user.currentZone && regionData[user.currentZone]?.divisions) {
        const divisions = Object.keys(regionData[user.currentZone].divisions || {});
        checkOther('currentDivision', user.currentDivision, divisions);
      }

      if (user.currentZone && user.currentDivision && regionData[user.currentZone]?.divisions?.[user.currentDivision]) {
        const workstations = Object.keys(regionData[user.currentZone].divisions[user.currentDivision]);
        checkOther('currentWorkstation', user.currentWorkstation, workstations);
        const locs = user.currentWorkstation ? regionData[user.currentZone].divisions[user.currentDivision][user.currentWorkstation] || [] : [];
        checkOther('currentLocation', user.currentLocation, locs);
      }

      const depts = Object.keys(masterDepartments || {});
      checkOther('department', user.department, depts);

      if (user.department && masterDepartments[user.department]?.subDepartments) {
        const subDepts = Object.keys(masterDepartments[user.department].subDepartments || {});
        checkOther('subDepartment', user.subDepartment, subDepts);
      }

      if (user.department && user.subDepartment && masterDepartments[user.department]?.subDepartments?.[user.subDepartment]) {
        const designations = masterDepartments[user.department].subDepartments[user.subDepartment];
        checkOther('designation', user.designation, designations);
      }

      checkOther('category', user.category, categories);
      
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
  }, [user, regionData, masterDepartments, sectors, categories, loadingMaster]);

  const handleProfileChange = (e) => {
    const name = e.target ? e.target.name : null;
    const value = e.target ? e.target.value : e;
    setProfileForm(prev => {
      const next = { ...prev, [name]: value };
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
      if (name === 'department') { next.subDepartment = ''; next.designation = ''; }
      if (name === 'currentZone') { next.currentDivision = ''; next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'currentDivision') { next.currentWorkstation = ''; next.currentLocation = ''; }
      if (name === 'currentWorkstation') { next.currentLocation = ''; }
      return next;
    });
    if (value === 'Other') setOtherValues(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus('loading');
    const finalData = { ...profileForm };
    Object.keys(otherValues).forEach(key => {
      if (finalData[key] === 'Other' && otherValues[key]) finalData[key] = otherValues[key];
    });
    if (finalData.currentLocation) finalData.currentStation = finalData.currentLocation;

    try {
      const res = await updateProfile(finalData);
      window.location.reload(); // Refresh to sync everything
    } catch (err) {
      setProfileStatus({ error: err.response?.data?.message || 'Failed to update profile.' });
    }
  };

  const handleCancelProfile = () => {
    setIsEditing(false);
    setProfileStatus(null);
  };

  // Resolve full URL for the image intelligently
  const profileImageUrl = user?.profileImage
    ? (user.profileImage.startsWith('http') || user.profileImage.startsWith('/avatars')
        ? user.profileImage 
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`)
    : null;

  const defaultAvatars = [
    "/avatars/loco_pilot.png",
    "/avatars/goods_guard.png",
    "/avatars/station_master.png",
    "/avatars/tte.png",
    "/avatars/trackman.png",
    "/avatars/rpf.png",
    "/avatars/doctor.png",
    "/avatars/clerk.png",
    "/avatars/chef.png",
    "/avatars/mechanic.png",
    `https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Maya&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Harry&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Charlie&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=George&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Noah&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Thomas&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Grace&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Ivy&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Evie&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Isla&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Lily&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=William&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=James&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Lucas&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Henry&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Benjamin&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Alexander&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Michael&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Daniel&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Matthew&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Andrew&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Emily&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Abigail&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Harper&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Ella&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Scarlett&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Madison&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Victoria&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Aria&backgroundColor=f8fafc`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=Luna&backgroundColor=f8fafc`,
  ];

  // Sync state if context updates later
  useEffect(() => {
    if (user && user.verified !== undefined) {
      setIsVerified(user.verified);
    }
  }, [user]);

  const handleSendOtp = async () => {
    setOtpStep('sending');
    setErrorMsg('');
    try {
      await sendVerificationOtp();
      setOtpStep('sent');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send OTP.');
      setOtpStep('error');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpStep('verifying');
    setErrorMsg('');
    try {
      await verifyEmailOtp(otpValue);
      setOtpStep('success');
      setIsVerified(true);
      setTimeout(() => setOtpStep('idle'), 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Invalid OTP.');
      setOtpStep('error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    try {
      setUploadingImg(true);
      await uploadProfileImage(file);
      // Wait a moment and then hard-reload since context won't immediately pick up the nested object update across all components without advanced context lifting, though simple reload works well for profile updates.
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSelectAvatar = async (url) => {
    try {
      setUploadingImg(true);
      await updateProfileImageUrl(url);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update avatar.");
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage your account and personal details.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border shadow-sm ${
              isEditing 
                ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/10' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {isEditing ? <User className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            {isEditing ? 'View Mode' : 'Edit Profile'}
          </button>
          <Link
            to="/settings"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-900 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-900/20 transition-all active:scale-95 border border-primary-900"
          >
            <Settings className="h-3.5 w-3.5" />
            Security
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-40 bg-primary-950 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 80%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)'}} />
          
          {/* Superimposed background text */}
          <h1 className="text-white/[0.07] font-black text-4xl sm:text-5xl md:text-6xl text-center select-none absolute tracking-tighter w-full px-4 leading-[0.85] flex flex-col">
            <span>ALL INDIA MUTUAL</span>
            <span>TRANSFER PORTAL</span>
          </h1>
        </div>

        {/* Avatar & Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex items-end justify-between -mt-10 mb-6 relative">
            
            <div className="p-1 bg-white rounded-[1.25rem] shadow-lg border-4 border-white relative group">
              <div className="h-24 w-24 rounded-xl flex items-center justify-center overflow-hidden relative">
                <UserAvatar 
                  user={user} 
                  className="h-full w-full"
                />
                
                {/* Upload Overlay */}
                <div 
                  onClick={() => setIsAvatarModalOpen(true)}
                  className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300 ${uploadingImg ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  {uploadingImg ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-white mb-1" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Update</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Hidden File Input */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/webp"
                className="hidden" 
              />
            </div>

            {/* Verification Badge */}
            {isVerified ? (
              <span className="mb-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <span className="mb-2 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200 flex items-center gap-1.5 shadow-sm">
                <ShieldAlert className="h-3.5 w-3.5" />
                Unverified
              </span>
            )}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {user?.name}
                {isVerified && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
              </h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Employee</p>
            </div>
          </div>
        </div>
      </div>
      {/* Profile Edit Form (Only in Edit Mode) */}
      {isEditing && (
        <>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 mb-6 animate-slide-up">
            <form onSubmit={handleProfileSubmit} className="space-y-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900">Update Working Profile</h3>
                {profileStatus?.error && (
                  <p className="text-red-500 text-xs font-bold">{profileStatus.error}</p>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={profileForm.name} 
                  onChange={handleProfileChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder-slate-400"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Sector Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Sector</label>
                <SearchableSelect
                  value={profileForm.sector}
                  onChange={(val) => handleProfileSelect('sector', val)}
                  options={sectors?.map(g => ({
                    group: g.group,
                    options: g.options.map(o => ({ value: o.value, label: o.label, disabled: !o.active }))
                  })) || []}
                />
              </div>

              {profileForm.sector === 'Railway' ? (
                <div className="space-y-10">
                  {/* Location Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone</label>
                      <SearchableSelect
                        value={profileForm.currentZone}
                        onChange={(val) => handleProfileSelect('currentZone', val)}
                        options={[...getZoneList().filter(z => z.value !== 'Other'), { value: 'Other', label: 'Other' }]}
                      />
                      {profileForm.currentZone === 'Other' && (
                        <input type="text" placeholder="Enter Zone" value={otherValues.currentZone} onChange={e => setOtherValues({...otherValues, currentZone: e.target.value})} className="w-full mt-2 px-4 py-2 border rounded-xl" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                      <SearchableSelect
                        value={profileForm.currentDivision}
                        onChange={(val) => handleProfileSelect('currentDivision', val)}
                        options={profileForm.currentZone && regionData[profileForm.currentZone] ? [...Object.keys(regionData[profileForm.currentZone].divisions).map(d => ({ value: d, label: d })), { value: 'Other', label: 'Other' }] : []}
                      />
                      {profileForm.currentDivision === 'Other' && (
                        <input type="text" placeholder="Enter Division" value={otherValues.currentDivision} onChange={e => setOtherValues({...otherValues, currentDivision: e.target.value})} className="w-full mt-2 px-4 py-2 border rounded-xl" />
                      )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workstation</label>
                       <SearchableSelect
                        value={profileForm.currentWorkstation}
                        onChange={(val) => handleProfileSelect('currentWorkstation', val)}
                        options={[...workstationTypes.map(w => ({ value: w, label: w })), { value: 'Other', label: 'Other' }]}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                       <SearchableSelect
                        value={profileForm.currentLocation}
                        onChange={(val) => handleProfileSelect('currentLocation', val)}
                        options={profileForm.currentZone && profileForm.currentDivision && profileForm.currentWorkstation ? [...(regionData[profileForm.currentZone].divisions[profileForm.currentDivision][profileForm.currentWorkstation] || []).map(l => ({ value: l, label: l })), { value: 'Other', label: 'Other' }] : []}
                       />
                       {profileForm.currentLocation === 'Other' && (
                         <input type="text" placeholder="Enter Location" value={otherValues.currentLocation} onChange={e => setOtherValues({...otherValues, currentLocation: e.target.value})} className="w-full mt-2 px-4 py-2 border rounded-xl" />
                       )}
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                      <SearchableSelect
                        value={profileForm.department}
                        onChange={(val) => handleProfileSelect('department', val)}
                        options={[...Object.keys(masterDepartments || {}).map(d => ({ value: d, label: d })), { value: 'Other', label: 'Other' }]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-Department</label>
                      <SearchableSelect
                        value={profileForm.subDepartment}
                        onChange={(val) => handleProfileSelect('subDepartment', val)}
                        options={profileForm.department && masterDepartments[profileForm.department] ? [...Object.keys(masterDepartments[profileForm.department].subDepartments || {}).map(sd => ({ value: sd, label: sd })), { value: 'Other', label: 'Other' }] : []}
                      />
                      {profileForm.subDepartment === 'Other' && (
                        <input type="text" placeholder="Enter Sub-Dept" value={otherValues.subDepartment} onChange={e => setOtherValues({...otherValues, subDepartment: e.target.value})} className="w-full mt-2 px-4 py-2 border rounded-xl" />
                      )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                       <SearchableSelect
                        value={profileForm.designation}
                        onChange={(val) => handleProfileSelect('designation', val)}
                        options={profileForm.department && profileForm.subDepartment && masterDepartments[profileForm.department]?.subDepartments?.[profileForm.subDepartment] ? [...masterDepartments[profileForm.department].subDepartments[profileForm.subDepartment].map(d => ({ value: d, label: d })), { value: 'Other', label: 'Other' }] : []}
                       />
                       {profileForm.designation === 'Other' && (
                         <input type="text" placeholder="Enter Designation" value={otherValues.designation} onChange={e => setOtherValues({...otherValues, designation: e.target.value})} className="w-full mt-2 px-4 py-2 border rounded-xl" />
                       )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <SearchableSelect
                        value={profileForm.category}
                        onChange={(val) => handleProfileSelect('category', val)}
                        options={categories.map(c => ({ value: c, label: c }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" disabled={profileStatus === 'loading'} className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">
                       {profileStatus === 'loading' ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 border border-slate-200 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-400">Please select 'Railway' sector to edit detailed profile. Other sectors coming soon.</p>
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {/* OTP Verification UI (Only shows if NOT verified) */}
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-[1.75rem] p-6 pr-8 mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-amber-900 font-black text-lg mb-1">Verify Your Email Address</h3>
            <p className="text-amber-700/80 font-medium text-sm">
              Your email <span className="font-bold">{user?.email}</span> is currently unverified. Verifying ensures your profile is marked as trusted, giving peace of mind to potential transfer matches.
            </p>
            
            {/* OTP Flow UI */}
            <div className="mt-5">
              {otpStep === 'idle' || otpStep === 'sending' ? (
                <button
                  onClick={handleSendOtp}
                  disabled={otpStep === 'sending'}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {otpStep === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {otpStep === 'sending' ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              ) : otpStep === 'sent' || otpStep === 'verifying' || otpStep === 'error' ? (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-48 px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 placeholder-slate-300 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpValue.length !== 6 || otpStep === 'verifying'}
                    className="bg-primary-900 hover:bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl shadow-lg shadow-primary-900/20 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {otpStep === 'verifying' && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify Code
                  </button>
                  {otpStep === 'error' && (
                    <button onClick={handleSendOtp} className="text-xs font-bold text-amber-700 hover:text-amber-900 underline ml-2">Resend</button>
                  )}
                </div>
              ) : otpStep === 'success' ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-black animate-fade-in border border-emerald-200">
                  <PartyPopper className="h-4 w-4 text-emerald-600" />
                  Successfully Verified!
                </div>
              ) : null}

              {errorMsg && otpStep === 'error' && (
                <p className="text-red-500 text-xs font-bold mt-3 animate-shake">{errorMsg}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-7">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" /> Contact Information
          </h3>
          <div className="space-y-5">
            <InfoRow icon={Mail} label="Email Address" value={user?.email} href={`mailto:${user?.email}`} />
            <InfoRow icon={Phone} label="Mobile Number" value={user?.mobile} href={`tel:${user?.mobile}`} />
            <InfoRow icon={Phone} label="WhatsApp Number" value={user?.whatsapp} href={`https://wa.me/${user?.whatsapp?.replace(/\D/g, '')}`} />
          </div>
        </div>

        <div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-7">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Building className="h-3.5 w-3.5" /> Account Details
          </h3>
          <div className="space-y-5">
            <InfoRow icon={User} label="Account Role" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Employee'} />
            <InfoRow icon={Clock} label="Member Since" value={memberSince} />
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-7 mb-6 mt-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5" /> Professional Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <InfoRow icon={Briefcase} label="Working Sector" value={user?.sector} />
          <InfoRow icon={Building} label="Department" value={user?.department} />
          <InfoRow icon={Building} label="Sub-Department" value={user?.subDepartment} />
          <InfoRow icon={User} label="Designation" value={user?.designation} />
          <InfoRow icon={MapPin} label="Current Region/Zone" value={user?.currentZone ? `${user.currentZone} ${zoneCode}` : null} />
          <InfoRow icon={MapPin} label="Current Division" value={user?.currentDivision} />
          <InfoRow icon={MapPin} label="Current Station" value={user?.currentStation} />
          <InfoRow icon={Briefcase} label="Grade Pay / Level" value={user?.gradePay} />
          <InfoRow icon={Briefcase} label="Basic Pay" value={user?.basicPay ? `₹${user.basicPay}` : null} />
          <InfoRow icon={User} label="Category" value={user?.category} />
        </div>
      </div>

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6">
        <p className="text-sm text-primary-800 font-medium leading-relaxed">
          <span className="font-black">Note:</span> Job details like Designation, Zone, and Station are provided when creating a Transfer Request. This keeps your profile flexible and accurate per request.
        </p>
      </div>
    </div>

    {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAvatarModalOpen(false)} />
          
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Update Profile Photo</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Choose an Avatar or Upload Photo</p>
              </div>
              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all hover:rotate-90 active:scale-90"
              >
                <span className="text-xl font-black line-height-1">&times;</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 flex-1">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-4 pb-4">
                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImg}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-primary-400 hover:text-primary-600 transition-all hover:bg-primary-50 active:scale-95 group"
                >
                  <Camera className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-tight">Upload</span>
                </button>

                {defaultAvatars.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAvatar(url)}
                    disabled={uploadingImg}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 bg-white ${
                      user?.profileImage === url ? 'border-primary-500 ring-4 ring-primary-500/10 scale-105 shadow-lg' : 'border-slate-100 hover:border-primary-200'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover bg-slate-50" />
                  </button>
                ))}
              </div>

              {uploadingImg && (
                <div className="mt-8 p-4 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center gap-3 sticky bottom-0">
                  <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                  <span className="text-sm font-black text-primary-900 tracking-tight uppercase tracking-widest">Uploading Profile Photo...</span>
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
               <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;

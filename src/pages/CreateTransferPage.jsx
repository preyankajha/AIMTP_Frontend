import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createTransfer, getTransferById, updateTransfer } from '../services/transferService';
import { useAuth } from '../hooks/useAuth';
import { useMasterData } from '../context/MasterDataContext';
import SearchableSelect from '../components/SearchableSelect';
import { ArrowRight, MapPin, Send, Building2, Briefcase, Loader2, Plus, Trash2, ChevronDown, UserCheck, AlertCircle, Settings, Phone } from 'lucide-react';


/**
 * SelectInput — wraps SearchableSelect and handles the "Other" custom-text fallback.
 * Passes options as {value,label} and appends "Other" when needed.
 */
const SelectInput = ({ label, name, value, options, placeholder, onChange, otherValue, onOtherChange, suggestLink }) => {
  const isOtherSelected = value === 'Other' || value === 'OTHER';

  // Normalise to {value, label}
  const normOpts = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  // Filter out any existing "Other" options to avoid case-insensitive duplicates, 
  // then append a single standard "Other" at the bottom (except for modeOfSelection).
  const filteredOpts = normOpts.filter(o => o.value?.toLowerCase() !== 'other');
  const finalOpts = (name !== 'modeOfSelection')
    ? [...filteredOpts, { value: 'Other', label: 'Other (Not in list)' }]
    : normOpts;

  const handleChange = (val) => {
    // Simulate a synthetic event so existing handlers (handleChange / handleOtherChange) work
    onChange({ target: { name, value: val } });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between mb-1">
        <label className="block text-sm font-bold text-slate-700">{label}</label>
        {suggestLink}
      </div>
      <SearchableSelect
        value={value}
        onChange={handleChange}
        options={finalOpts}
        placeholder={placeholder || `Select ${label}`}
      />
      {isOtherSelected && (
        <div className="animate-slide-down">
          <input
            type="text"
            name={name}
            value={otherValue || ''}
            onChange={onOtherChange}
            required
            placeholder={`Enter specific ${label.toLowerCase()}`}
            className="mt-2 block w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      )}
    </div>
  );
};

const CreateTransferPage = () => {
  const { user, updateUserProfile, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    sector: 'Railway',
    department: '',
    subDepartment: '',
    designation: '',
    modeOfSelection: '',
    currentZone: '',
    currentDivision: '',
    currentWorkstation: '',
    currentLocation: '',
    currentStation: '',
    desiredLocations: [
      { zone: '', division: '', workstation: '', location: '', priority: 1 }
    ],
    payLevel: '',
    gradePay: '',
    basicPay: '',
    category: '',
    category: '',
    workplaceRemark: '',
    appointmentDate: '',
    contactOptions: {
      email: user?.email || '',
      phone: user?.mobile || '',
      whatsapp: user?.whatsapp || ''
    }
  });

  // States for "Other" custom inputs
  const [otherInputs, setOtherInputs] = useState({
    department: '',
    subDepartment: '',
    designation: '',
    currentZone: '',
    currentDivision: '',
    currentStation: '',
    desiredLocations: [
      { zone: '', division: '', station: '' }
    ]
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [language, setLanguage] = useState('en');
  
  const { 
    loading: masterLoading, 
    regionData, 
    departments, 
    sectors, 
    categories, 
    payLevels, 
    modeOfSelection,
    getZoneList 
  } = useMasterData();

  const [fetching, setFetching] = useState(isEditMode);
  
  // Prefill profile data if NOT in edit mode
  useEffect(() => {
    if (!isEditMode && user && !masterLoading) {
      setFormData(prev => ({
        ...prev,
        sector: user.sector || prev.sector,
        department: user.department || prev.department,
        subDepartment: user.subDepartment || prev.subDepartment,
        designation: user.designation || prev.designation,
        modeOfSelection: user.modeOfSelection || prev.modeOfSelection,
        currentZone: user.currentZone || prev.currentZone,
        currentDivision: user.currentDivision || prev.currentDivision,
        currentWorkstation: user.currentWorkstation || prev.currentWorkstation,
        currentLocation: user.currentLocation || prev.currentLocation,
        currentStation: user.currentStation || prev.currentStation,
        category: user.category || prev.category,
        payLevel: user.payLevel || prev.payLevel,
        gradePay: user.gradePay || prev.gradePay,
        basicPay: user.basicPay || prev.basicPay,
        workplaceRemark: user.workplaceRemark || prev.workplaceRemark,
        appointmentDate: user.appointmentDate ? user.appointmentDate.split('T')[0] : prev.appointmentDate,
        contactOptions: {
          email: user.email || prev.contactOptions.email,
          phone: user.mobile || prev.contactOptions.phone,
          whatsapp: user.whatsapp || prev.contactOptions.whatsapp,
        }
      }));
    }
  }, [user, isEditMode, masterLoading]);

  // Derived options for cascading dropdowns
  const deptList = [
    ...Object.keys(departments || {}).filter(d => d.toLowerCase() !== 'other').map(d => ({ value: d, label: d })),
    { value: 'Other', label: 'Other (Not in list)' }
  ];
  
  const subDeptList = (formData.department && departments?.[formData.department]) 
    ? [
        ...Object.keys(departments[formData.department].subDepartments).filter(sd => sd.toLowerCase() !== 'other').map(sd => ({ value: sd, label: sd })),
        { value: 'Other', label: 'Other (Not in list)' }
      ]
    : formData.department === 'Other' ? [{ value: 'Other', label: 'Other (Not in list)' }] : [];

  const designationList = (formData.department && formData.subDepartment && departments?.[formData.department]?.subDepartments[formData.subDepartment])
    ? [
        ...departments[formData.department].subDepartments[formData.subDepartment].filter(design => design.toLowerCase() !== 'other').map(design => ({ value: design, label: design })),
        { value: 'Other', label: 'Other (Not in list)' }
      ]
    : formData.subDepartment === 'Other' ? [{ value: 'Other', label: 'Other (Not in list)' }] : [];

  // Zone list as objects {label, value} with CODE shown
  const zoneList = getZoneList();
  const currentDivList = formData.currentZone && regionData[formData.currentZone]
    ? Object.keys(regionData[formData.currentZone].divisions)
    : [];
  const currentStationList = formData.currentZone && formData.currentDivision && regionData[formData.currentZone]?.divisions[formData.currentDivision]
    ? regionData[formData.currentZone].divisions[formData.currentDivision]
    : [];

  const { workstationTypes } = useMasterData();

  const getLocOptions = (zone, division, workstationType) => {
    let divs = (zone && regionData?.[zone]) ? Object.keys(regionData[zone].divisions) : [];
    // Ensure "Other" is available even if the list is empty (so "Other" zone can have an "Other" division)
    divs = divs.filter(d => d.toLowerCase() !== 'other')
      .map(d => ({ value: d, label: d }));
    divs.push({ value: 'Other', label: 'Other (Not in list)' });
    
    let workstations = (workstationTypes || [])
      .filter(w => w.toLowerCase() !== 'other')
      .map(w => ({ value: w, label: w }));
    workstations.push({ value: 'Other', label: 'Other (Not in list)' });
    
    let locations = (zone && division && workstationType && regionData?.[zone]?.divisions?.[division]?.[workstationType])
      ? regionData[zone].divisions[division][workstationType]
      : [];
    locations = locations.filter(l => l.toLowerCase() !== 'other')
      .map(l => ({ value: l, label: l }));
    locations.push({ value: 'Other', label: 'Other (Not in list)' });
    
    return { divs, workstations, locations };
  };

  const handleLocationChange = (index, field, value) => {
    const newDesired = [...formData.desiredLocations];
    newDesired[index][field] = value;
    
    // Clear and reset child dropdowns when parent changes
    if (field === 'zone') {
      newDesired[index].division = '';
      newDesired[index].workstation = '';
      newDesired[index].location = '';
    }
    if (field === 'division') {
      newDesired[index].workstation = '';
      newDesired[index].location = '';
    }
    if (field === 'workstation') {
      newDesired[index].location = '';
    }
    
    // If selecting "Other", clear the corresponding custom input field
    if (value === 'Other' || (typeof value === 'string' && value.toLowerCase() === 'other')) {
      const newOther = [...otherInputs.desiredLocations];
      const fieldInOther = field === 'location' ? 'station' : field;
      if (!newOther[index]) newOther[index] = { zone: '', division: '', workstation: '', station: '' };
      newOther[index][fieldInOther] = '';
      setOtherInputs({ ...otherInputs, desiredLocations: newOther });
    }
    
    setFormData({ ...formData, desiredLocations: newDesired });
  };

  const handleOtherLocationChange = (index, field, value) => {
    const newOther = [...otherInputs.desiredLocations];
    if (!newOther[index]) newOther[index] = { zone: '', division: '', station: '' };
    newOther[index][field] = value;
    setOtherInputs({ ...otherInputs, desiredLocations: newOther });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      desiredLocations: [...formData.desiredLocations, { zone: '', division: '', workstation: '', location: '', priority: formData.desiredLocations.length + 1 }]
    });
    setOtherInputs({
      ...otherInputs,
      desiredLocations: [...otherInputs.desiredLocations, { zone: '', division: '', workstation: '', location: '' }]
    });
  };

  const removeLocation = (index) => {
    if (formData.desiredLocations.length <= 1) return;
    const newDesired = formData.desiredLocations.filter((_, i) => i !== index);
    const newOther = otherInputs.desiredLocations.filter((_, i) => i !== index);
    setFormData({ ...formData, desiredLocations: newDesired });
    setOtherInputs({ ...otherInputs, desiredLocations: newOther });
  };

  useEffect(() => {
    if (isEditMode && !masterLoading && Object.keys(regionData).length > 0 && Object.keys(departments).length > 0) {
      const fetchTransfer = async () => {
        try {
          console.log('Fetching transfer ID:', id);
          const data = await getTransferById(id);
          console.log('Data received:', data);
          if (!data) throw new Error('No data returned from server');
          
          // Reconstruct form state and handle "Other" logic
          const newFormData = { ...formData };
          const newOtherInputs = { ...otherInputs };
          
          const deptOptions = Object.keys(departments || {});
          if (deptOptions.includes(data.department)) {
            newFormData.department = data.department;
          } else {
            newFormData.department = 'Other';
            newOtherInputs.department = data.department;
          }

          // Trigger logic for sub-department
          const subDepts = (newFormData.department !== 'Other' && departments[newFormData.department])
            ? Object.keys(departments[newFormData.department].subDepartments || {})
            : [];
          if (subDepts.includes(data.subDepartment)) {
            newFormData.subDepartment = data.subDepartment;
          } else {
            newFormData.subDepartment = 'Other';
            newOtherInputs.subDepartment = data.subDepartment;
          }

          // Trigger logic for designation
          const desigs = (newFormData.department !== 'Other' && newFormData.subDepartment !== 'Other' && departments[newFormData.department]?.subDepartments?.[newFormData.subDepartment])
            ? departments[newFormData.department].subDepartments[newFormData.subDepartment]
            : [];
          if (desigs.includes(data.designation)) {
            newFormData.designation = data.designation;
          } else {
            newFormData.designation = 'Other';
            newOtherInputs.designation = data.designation;
          }

          // Handle Locations in similar way
          const zoneOptions = Object.keys(regionData);
          
          // Current
          if (zoneOptions.includes(data.currentZone)) {
            newFormData.currentZone = data.currentZone;
            const divs = Object.keys(regionData[data.currentZone]?.divisions || {});
            if (divs.includes(data.currentDivision)) {
              newFormData.currentDivision = data.currentDivision;
              const workstationMap = regionData[data.currentZone]?.divisions?.[data.currentDivision] || {};
              // Flatten all stations from all workstation types to check if existing station exists
              const allStations = Object.values(workstationMap).flat();
              
              if (allStations.includes(data.currentStation)) {
                newFormData.currentStation = data.currentStation;
              } else {
                newFormData.currentStation = 'Other';
                newOtherInputs.currentStation = data.currentStation;
              }
            } else {
              newFormData.currentDivision = 'Other';
              newOtherInputs.currentDivision = data.currentDivision;
              newFormData.currentStation = 'Other';
              newOtherInputs.currentStation = data.currentStation;
            }
          } else {
            newFormData.currentZone = 'Other';
            newOtherInputs.currentZone = data.currentZone;
            newFormData.currentDivision = 'Other';
            newOtherInputs.currentDivision = data.currentDivision;
            newFormData.currentStation = 'Other';
            newOtherInputs.currentStation = data.currentStation;
          }

          // Handle Desired Locations
          if (data.desiredLocations && data.desiredLocations.length > 0) {
            const locs = data.desiredLocations.map(loc => {
              const zoneOptions = Object.keys(regionData);
              const result = { zone: '', division: '', workstation: '', location: '', priority: loc.priority || 1 };
              const otherRes = { zone: '', division: '', workstation: '', station: '' };
              
              if (zoneOptions.includes(loc.zone)) {
                result.zone = loc.zone;
                const divs = Object.keys(regionData[loc.zone]?.divisions || {});
                if (divs.includes(loc.division)) {
                  result.division = loc.division;
                  const workstationMap = regionData[loc.zone]?.divisions?.[loc.division] || {};
                  
                  if (workstationMap[loc.workstation]) {
                    result.workstation = loc.workstation;
                    const stations = workstationMap[loc.workstation] || [];
                    if (stations.includes(loc.location)) {
                      result.location = loc.location;
                    } else {
                      result.location = 'Other';
                      otherRes.station = loc.location;
                    }
                  } else {
                    result.workstation = 'Other';
                    otherRes.workstation = loc.workstation;
                    result.location = 'Other';
                    otherRes.station = loc.location;
                  }
                } else {
                  result.division = 'Other';
                  otherRes.division = loc.division;
                  result.workstation = 'Other';
                  otherRes.workstation = loc.workstation;
                  result.location = 'Other';
                  otherRes.station = loc.location;
                }
              } else {
                result.zone = 'Other';
                otherRes.zone = loc.zone;
                result.division = 'Other';
                otherRes.division = loc.division;
                result.workstation = 'Other';
                otherRes.workstation = loc.workstation;
                result.location = 'Other';
                otherRes.station = loc.location;
              }
              return { result, otherRes };
            });
            newFormData.desiredLocations = locs.map(l => l.result);
            newOtherInputs.desiredLocations = locs.map(l => l.otherRes);
          }

          newFormData.modeOfSelection = data.modeOfSelection;
          newFormData.payLevel = data.payLevel || '';
          newFormData.basicPay = data.basicPay || '';
          newFormData.category = data.category || '';
          newFormData.workplaceRemark = data.workplaceRemark || '';
          newFormData.appointmentDate = data.appointmentDate ? data.appointmentDate.split('T')[0] : '';

          if (data.contactOptions) {
            newFormData.contactOptions = {
              email: data.contactOptions.email || '',
              phone: data.contactOptions.phone || '',
              whatsapp: data.contactOptions.whatsapp || ''
            };
          }

          setFormData(newFormData);
          setOtherInputs(newOtherInputs);
          setFetching(false);
        } catch (err) {
          console.error('Detailed fetch error:', err);
          const errMsg = err.response?.data?.message || err.message || 'Unknown processing error';
          setError(`Diagnostic Error: ${errMsg}`);
          setFetching(false);
        }
      };
      fetchTransfer();
    }
  }, [id, isEditMode, masterLoading, regionData, departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear custom "Other" input if "Other" is selected in the main dropdown
    if (value === 'Other' || (typeof value === 'string' && value.toLowerCase() === 'other')) {
      setOtherInputs(prev => ({ ...prev, [name]: '' }));
    }
    
    // Auto-fill from profile if user selects their working sector
    if (name === 'sector' && value === user?.sector && isProfileComplete) {
      setFormData(prev => ({
        ...prev,
        department: user.department,
        subDepartment: user.subDepartment,
        designation: user.designation,
        currentZone: user.currentZone,
        currentDivision: user.currentDivision,
        currentStation: user.currentStation,
        category: user.category,
        payLevel: user.payLevel,
        gradePay: user.gradePay,
        basicPay: user.basicPay,
        category: user.category,
        workplaceRemark: user.workplaceRemark,
      }));
      return; // Skip the reset logic below
    }

    // Reset child dropdowns when parent changes
    if (name === 'sector') {
      setFormData(prev => ({ ...prev, department: '', subDepartment: '', designation: '' }));
    }
    if (name === 'department') setFormData(prev => ({ ...prev, subDepartment: '', designation: '' }));
    if (name === 'subDepartment') setFormData(prev => ({ ...prev, designation: '' }));
    
    if (name === 'currentZone') setFormData(prev => ({ ...prev, currentDivision: '', currentStation: '' }));
    if (name === 'currentDivision') setFormData(prev => ({ ...prev, currentStation: '' }));

    if (name.startsWith('contact_')) {
      const field = name.replace('contact_', '');
      setFormData(prev => ({
        ...prev,
        contactOptions: {
          ...prev.contactOptions,
          [field]: value
        }
      }));
    }
  };

  const handleOtherChange = (e) => {
    setOtherInputs({ ...otherInputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.sector !== 'Railway') {
      setError(`Sector integration for ${formData.sector} is pending. Coming soon!`);
      return;
    }
    
    setLoading(true);

    // Prepare final data by checking for "Other" values
    const finalData = { ...formData };
    
    // Top-level fields
    Object.keys(finalData).forEach(key => {
      if (key !== 'desiredLocations' && (finalData[key] === 'Other' || finalData[key] === 'OTHER')) {
        finalData[key] = otherInputs[key];
      }
    });

    // Desired locations — ensure 'station' field is populated for backend validation
    finalData.desiredLocations = finalData.desiredLocations.map((loc, idx) => {
      const processed = { ...loc };
      const others = otherInputs.desiredLocations[idx] || {};
      
      if (processed.zone === 'Other') processed.zone = others.zone;
      if (processed.division === 'Other') processed.division = others.division;
      if (processed.workstation === 'Other') processed.workstation = others.workstation;
      
      // Map the UI's "location" field to the backend's "station" field
      const finalStationValue = processed.location === 'Other' ? others.station : processed.location;
      processed.location = finalStationValue;
      processed.station = finalStationValue;
      
      return processed;
    });

    try {
      let result;
      if (isEditMode) {
        result = await updateTransfer(id, finalData);
        setSuccess(`Request updated successfully!`);
      } else {
        result = await createTransfer(finalData);
        setSuccess(`Request created successfully! ${result.matchesFound > 0 ? `Good news: ${result.matchesFound} matches found instantly!` : 'We will notify you when a match is found.'}`);
      }
      
      // Update local profile context so it reflects the new linked data
      const profileFields = ['sector', 'department', 'subDepartment', 'designation', 'currentZone', 'currentDivision', 'currentStation', 'payLevel', 'gradePay', 'basicPay', 'category', 'workplaceRemark'];
      const profileUpdates = {};
      profileFields.forEach(f => {
        if (finalData[f] !== undefined) profileUpdates[f] = finalData[f];
      });
      updateUserProfile(profileUpdates);

      setTimeout(() => navigate('/transfers/my'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} transfer request.`);
      setLoading(false);
    }
  };

  const SuggestLink = ({ type, initialData }) => (
    <button
      type="button"
      onClick={() => navigate(`/suggest-data?type=${type}`)}
      className="text-[9px] font-black text-primary-600 hover:text-white hover:bg-primary-600 flex items-center gap-1 transition-all uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-md focus:outline-none"
    >
      <Plus className="h-3 w-3 -ml-0.5" />
      Missing?
    </button>
  );

  const termsContent = {
    en: {
      title: "Declaration of Authenticity",
      content: "I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that this platform is a Mutual Transfer Facilitator and my request will be visible to potential partners. I acknowledge that finding a partner through this portal is the first step, and the final transfer depends on departmental approval.",
      accept: "I Accept and Declare",
      langSwitch: "हिंदी में पढ़ें"
    },
    hi: {
      title: "प्रमाणिकता की घोषणा",
      content: "मैं एतद्द्वारा घोषित करता हूं कि ऊपर प्रदान की गई जानकारी मेरे सर्वोत्तम ज्ञान के अनुसार सत्य और सही है। मैं समझता हूं कि यह मंच एक आपसी स्थानांतरण सुविधा है और मेरा अनुरोध संभावित भागीदारों को दिखाई देगा। मैं स्वीकार करता हूं कि इस पोर्टल के माध्यम से साथी ढूंढना पहला कदम है, और अंतिम स्थानांतरण विभागीय अनुमोदन पर निर्भर करता है।",
      accept: "मैं स्वीकार और घोषित करता हूँ",
      langSwitch: "Read in English"
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
          <p className="text-slate-500 font-medium">Loading parameters...</p>
        </div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="h-24 w-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-red-100 relative">
           <AlertCircle className="h-12 w-12 text-red-500" />
           <div className="absolute -top-2 -right-2 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <Briefcase className="h-4 w-4 text-slate-400" />
           </div>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Access Locked</h1>
        <p className="text-slate-600 font-medium leading-relaxed mb-12 text-lg max-w-lg mx-auto">
           You must complete your <span className="text-slate-900 font-black">Official Working Information</span> in profile settings before you can create any transfer requests.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link
             to="/settings"
             className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-primary-900/20 hover:bg-slate-900 transition-all active:scale-95"
           >
             <Settings className="h-5 w-5" />
             Complete Profile Now
           </Link>
           <Link
             to="/dashboard"
             className="w-full sm:w-auto px-10 py-4 text-slate-500 font-black text-sm hover:text-slate-900 transition-colors"
           >
             Back to Dashboard
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in pb-32">
      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-hidden">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-8 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{termsContent[language].title}</h3>
                <button 
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                >
                  {termsContent[language].langSwitch}
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 font-medium italic">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {termsContent[language].content}
                </p>
              </div>

              <div className="flex flex-col gap-3 sticky bottom-0 bg-white pt-4">
                <button
                  onClick={() => {
                    setAcceptedDeclaration(true);
                    setShowTermsModal(false);
                  }}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98]"
                >
                  {termsContent[language].accept}
                </button>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full py-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isEditMode ? 'Edit Transfer Request' : 'New Transfer Request'}
        </h1>
        <p className="text-slate-600 mt-2">
          {isEditMode ? 'Update your preferences to find the best match.' : 'Provide your details to find your ideal mutual transfer partner.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 mb-0 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6 mb-0 rounded-lg">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-12">
          
          {/* Sector Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Working Sector</h2>
            </div>
            
            <div className="max-w-md">
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Sector</label>
              <SearchableSelect
                id="sector"
                value={formData.sector}
                onChange={(val) => handleChange({ target: { name: 'sector', value: val } })}
                placeholder="Select Sector"
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

          {formData.sector !== 'Railway' ? (
            <div className="bg-slate-50/50 rounded-[2rem] border border-slate-200 p-16 text-center shadow-inner mt-8">
              <div className="h-16 w-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Building2 className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Coming Soon!</h3>
              <p className="text-slate-500 max-w-md mx-auto font-medium">
                The <span className="font-bold text-slate-700">{formData.sector}</span> sector is currently under active development. You will be able to submit transfer requests for this sector soon.
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Professional Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Professional Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SelectInput 
                    label="Department" 
                    name="department" 
                    value={formData.department} 
                    options={deptList} 
                    onChange={handleChange}
                    otherValue={otherInputs.department}
                    onOtherChange={handleOtherChange}
                    suggestLink={<SuggestLink type="Department" />}
                  />
                  <SelectInput 
                    label="Sub-Department" 
                    name="subDepartment" 
                    value={formData.subDepartment} 
                    options={subDeptList} 
                    onChange={handleChange}
                    otherValue={otherInputs.subDepartment}
                    onOtherChange={handleOtherChange}
                  />
                  <SelectInput 
                    label="Designation" 
                    name="designation" 
                    value={formData.designation} 
                    options={designationList} 
                    onChange={handleChange}
                    otherValue={otherInputs.designation}
                    onOtherChange={handleOtherChange}
                  />
                  <SelectInput 
                    label="Mode of Selection" 
                    name="modeOfSelection" 
                    value={formData.modeOfSelection} 
                    options={modeOfSelection} 
                    onChange={handleChange}
                    otherValue={otherInputs.modeOfSelection}
                    onOtherChange={handleOtherChange}
                  />
                  <SelectInput 
                    label="Pay Level" 
                    name="payLevel" 
                    value={formData.payLevel} 
                    options={payLevels || []} 
                    onChange={handleChange}
                    placeholder="Select Level"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-slate-700">Grade Pay / Level Pay</label>
                    <input
                      type="number"
                      name="gradePay"
                      value={formData.gradePay}
                      onChange={handleChange}
                      placeholder="e.g. 4200"
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-slate-700">Basic Pay (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        name="basicPay"
                        value={formData.basicPay}
                        onChange={handleChange}
                        required
                        min="18000"
                        placeholder="Min. 18000"
                        className="block w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all font-medium"
                      />
                    </div>
                  </div>
                  <SelectInput 
                    label="Category" 
                    name="category" 
                    value={formData.category} 
                    options={categories} 
                    onChange={handleChange}
                    placeholder="Select Category"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-slate-700">Date of Appointment</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Identification / Current Posting Block */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center gap-5">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-50 text-emerald-600">
                         <UserCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Profile Verified</h4>
                        <p className="text-sm font-bold text-slate-700">Submit request as: {user?.designation || 'Staff'}</p>
                        <p className="text-[11px] text-slate-500 font-medium">Auto-prefilled from your official profile.</p>
                      </div>
                   </div>

                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-center gap-5">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                         <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Posting</h4>
                        <p className="text-sm font-bold text-slate-700">{formData.currentStation} ({formData.currentZone})</p>
                        <p className="text-[11px] text-slate-500 font-medium">{formData.currentDivision} Division</p>
                      </div>
                   </div>
                </div>
              </div>
              
              {/* Contact Information Section moved here */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Contact Information</h2>
                    <p className="text-xs text-slate-500 font-medium">How should potential matches reach out to you?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Display Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contactOptions.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Display Phone</label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={formData.contactOptions.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Display WhatsApp</label>
                    <input
                      type="text"
                      name="contact_whatsapp"
                      value={formData.contactOptions.whatsapp}
                      onChange={handleChange}
                      placeholder="WhatsApp number"
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium italic">
                  Note: These contact details will ONLY be visible to potential partners once a mutual match is found or you manually reveal it.
                </p>
              </div>

              {/* Working Condition Remarks moved here */}
              <div className="space-y-2 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-700">Working Condition Remarks <span className="text-red-500">*</span></label>
                <textarea 
                  name="workplaceRemark" 
                  value={formData.workplaceRemark} 
                  onChange={handleChange}
                  required
                  maxLength={300}
                  placeholder="Briefly describe the working conditions, duty type, or any other relevant details about your current posting..."
                  className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none h-24"
                />
                <p className="text-[10px] text-slate-400 font-bold text-right">{formData.workplaceRemark?.length || 0}/300 characters</p>
              </div>

              {/* Section 2: Location Choices */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Desired Postings</h2>
                      <p className="text-xs text-slate-500 font-medium">Add multiple choices and set priority</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {formData.desiredLocations.map((loc, index) => {
                    const { divs, workstations, locations } = getLocOptions(loc.zone, loc.division, loc.workstation);
                    return (
                      <div key={index} className="relative bg-slate-50/50 p-6 rounded-3xl border border-slate-200 group animate-slide-in">
                        <div className="absolute -left-3 top-6 h-8 w-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm z-10">
                          <span className="text-xs font-black text-primary-600">{index + 1}</span>
                        </div>

                          <div className="space-y-4 md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-bold text-slate-700">Region/Zone</label>
                                <SuggestLink type="Zone" />
                              </div>
                              <SearchableSelect
                                value={loc.zone}
                                onChange={v => handleLocationChange(index, 'zone', v)}
                                options={[
                                  ...zoneList.filter(z => z.value?.toLowerCase() !== 'other'), 
                                  { value: 'Other', label: 'Other (Not in list)' }
                                ]}
                                placeholder="Select Zone"
                              />
                              {(loc.zone === 'Other' || (loc.zone && loc.zone.toLowerCase() === 'other')) && (
                                <input
                                  type="text"
                                  value={otherInputs.desiredLocations[index]?.zone || ''}
                                  onChange={(e) => handleOtherLocationChange(index, 'zone', e.target.value)}
                                  placeholder="Enter Zone Name"
                                  className="mt-2 block w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm"
                                  required
                                />
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700">Division</label>
                              <SearchableSelect
                                value={loc.division}
                                onChange={v => handleLocationChange(index, 'division', v)}
                                options={divs}
                                placeholder="Select Division"
                                disabled={!loc.zone}
                              />
                              {(loc.division === 'Other' || (loc.division && loc.division.toLowerCase() === 'other')) && (
                                <input
                                  type="text"
                                  value={otherInputs.desiredLocations[index]?.division || ''}
                                  onChange={(e) => handleOtherLocationChange(index, 'division', e.target.value)}
                                  placeholder="Enter Division Name"
                                  className="mt-2 block w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm"
                                  required
                                />
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700">Workstation Type</label>
                              <SearchableSelect
                                value={loc.workstation}
                                onChange={v => handleLocationChange(index, 'workstation', v)}
                                options={workstations || []}
                                placeholder="Select Workstation"
                                disabled={!loc.division}
                              />
                              {(loc.workstation === 'Other' || (loc.workstation && loc.workstation.toLowerCase() === 'other')) && (
                                <input
                                  type="text"
                                  value={otherInputs.desiredLocations[index]?.workstation || ''}
                                  onChange={(e) => handleOtherLocationChange(index, 'workstation', e.target.value)}
                                  placeholder="Enter Workstation Type"
                                  className="mt-2 block w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm"
                                  required
                                />
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-bold text-slate-700">Location</label>
                                <SuggestLink type="Location" initialData={{ zone: loc.zone, division: loc.division, workstationType: loc.workstation }} />
                              </div>
                              <SearchableSelect
                                value={loc.location}
                                onChange={v => handleLocationChange(index, 'location', v)}
                                options={locations || []}
                                placeholder="Select Location"
                                disabled={!loc.workstation}
                              />
                              {(loc.location === 'Other' || (loc.location && loc.location.toLowerCase() === 'other')) && (
                                <input
                                  type="text"
                                  value={otherInputs.desiredLocations[index]?.station || ''}
                                  onChange={(e) => handleOtherLocationChange(index, 'station', e.target.value)}
                                  placeholder="Enter Location/Station"
                                  className="mt-2 block w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm"
                                  required
                                />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-2">
                              <label className="block text-sm font-bold text-slate-700">Priority</label>
                              <div className="flex flex-wrap items-center gap-2 w-full">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => handleLocationChange(index, 'priority', p)}
                                    className={`flex-1 min-w-[3.5rem] h-11 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${
                                      Number(loc.priority) === p 
                                        ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/30 scale-[1.02]' 
                                        : 'bg-white text-slate-400 border border-slate-200 hover:border-primary-300 hover:text-primary-600 shadow-sm'
                                    }`}
                                  >
                                    P{p}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {formData.desiredLocations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLocation(index)}
                                className="p-3 mt-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                      </div>
                    );
                  })}

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={addLocation}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Add More Choice
                    </button>
                  </div>
                </div>
              </div>


              {/* Declaration & Terms */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 group">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id="declaration"
                      checked={acceptedDeclaration}
                      readOnly
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                    />
                  </div>
                  <label 
                    htmlFor="declaration" 
                    onClick={() => setShowTermsModal(true)}
                    className="text-sm font-medium text-slate-600 cursor-pointer select-none leading-relaxed group-hover:text-slate-800 transition-colors"
                  >
                    I hereby declare that the information provided above is true and correct. 
                    I agree to the <span className="font-bold text-red-500 underline decoration-2 underline-offset-4 decoration-red-200 hover:decoration-red-500">Self-Declaration Terms</span> and acknowledge that final transfer depends on departmental status.
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/transfers/my')}
                  className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.sector !== 'Railway' || (!isEditMode && !acceptedDeclaration)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-xl shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {isEditMode ? 'Save Changes' : 'Submit Request'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

export default CreateTransferPage;

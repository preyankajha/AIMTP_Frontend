import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Plus, Trash2, Send, Loader2, Building2, ChevronRight, Info, CheckCircle2, Clock, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useMasterData } from '../context/MasterDataContext';
import SearchableSelect from '../components/SearchableSelect';

const DataSuggestionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const presetType = queryParams.get('type') || 'Location';

  const { regionData, getZoneList, getDeptList, departments, workstationTypes } = useMasterData();
  const zoneList = getZoneList();
  const deptList = getDeptList().map(d => ({ value: d, label: d }));

  const [suggestions, setSuggestions] = useState([
    { 
      type: presetType, 
      name: '', 
      zone: '', 
      zoneOther: '',
      division: '', 
      divisionOther: '',
      workstationType: '', 
      workstationTypeOther: '',
      department: '',
      departmentOther: '',
      description: '', 
      id: Date.now() 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mySuggestions, setMySuggestions] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  const fetchMyHistory = async () => {
    try {
      setFetchingHistory(true);
      const res = await api.get('/master-data/suggestions');
      setMySuggestions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch suggestion history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, []);

  const addRow = () => {
    setSuggestions([...suggestions, { 
      type: 'Location', 
      name: '', 
      zone: '', 
      zoneOther: '',
      division: '', 
      divisionOther: '',
      workstationType: '', 
      workstationTypeOther: '',
      department: '',
      departmentOther: '',
      description: '', 
      id: Date.now() 
    }]);
  };

  const removeRow = (id) => {
    if (suggestions.length === 1) return;
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const updateRow = (id, field, value) => {
    setSuggestions(suggestions.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        
        // AUTO-RESET logic when TYPE changes
        if (field === 'type') {
          updated.zone = '';
          updated.zoneOther = '';
          updated.division = '';
          updated.divisionOther = '';
          updated.workstationType = '';
          updated.workstationTypeOther = '';
          updated.department = '';
          updated.departmentOther = '';
        }

        // Reset child fields if parent changed
        if (field === 'zone') {
          updated.division = '';
          updated.workstationType = '';
        }
        if (field === 'division') {
          updated.workstationType = '';
        }
        if (field === 'department') {
          updated.departmentOther = '';
          updated.subDepartment = '';
          updated.subDepartmentOther = '';
        }
        if (field === 'subDepartment') {
          updated.subDepartmentOther = '';
        }
        return updated;
      }
      return s;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all(suggestions.map(s => 
        api.post('/master-data/suggestions', {
          type: s.type,
          details: {
            name: s.name,
            zone: s.zone === 'Other' ? s.zoneOther : s.zone,
            division: s.division === 'Other' ? s.divisionOther : s.division,
            workstationType: s.workstationType === 'Other' ? s.workstationTypeOther : s.workstationType,
            department: s.department === 'Other' ? s.departmentOther : s.department,
            subDepartment: s.subDepartment === 'Other' ? s.subDepartmentOther : s.subDepartment,
            description: s.description
          }
        })
      ));
      setSubmitted(true);
      fetchMyHistory();
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="h-24 w-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-emerald-100">
           <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Request Submitted!</h1>
        <p className="text-slate-600 font-medium leading-relaxed mb-12 text-lg">
           Your suggestions have been sent to the admin team for verification. We will notify you once they are added to the system.
        </p>
        <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-primary-900 text-white rounded-2xl font-black text-sm shadow-2xl shadow-primary-900/20 hover:bg-slate-900 transition-all">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in pb-32">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Integrity Suggestion</h1>
          <p className="text-slate-500 mt-2 font-medium">Not finding your workstation or region? Suggest them here for admin review.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-2xl border border-primary-100">
           <Info className="h-4 w-4 text-primary-600" />
           <p className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Multiple Entries Allowed</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {suggestions.map((row, index) => {
            const divs = (row.zone && regionData?.[row.zone]) ? Object.keys(regionData[row.zone].divisions) : [];
            
            return (
              <div key={row.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-primary-300 transition-all">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400">
                      {index + 1}
                    </span>
                    <select 
                      value={row.type}
                      onChange={e => updateRow(row.id, 'type', e.target.value)}
                      className="bg-transparent border-none text-sm font-black text-slate-700 p-0 focus:ring-0 cursor-pointer hover:text-primary-600 transition-colors capitalize"
                    >
                      <option value="" disabled>Select Suggestion Type...</option>
                      <optgroup label="Region & Location">
                        <option value="Location">Location / Station</option>
                        <option value="Division">Division</option>
                        <option value="Zone">Zone / Region</option>
                        <option value="WorkstationType">Workstation Type</option>
                      </optgroup>
                      <optgroup label="Departmental">
                        <option value="Department">Department</option>
                        <option value="SubDepartment">Sub-Department</option>
                        <option value="Designation">Designation</option>
                      </optgroup>
                    </select>
                  </div>
                  {suggestions.length > 1 && (
                    <button type="button" onClick={() => removeRow(row.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!row.type ? (
                  <div className="p-12 text-center bg-slate-50/30">
                    <div className="h-12 w-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <ChevronRight className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Please select a suggestion type to continue...</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 animate-slide-down">
                    {/* Context for Location suggestions */}
                    {(row.type === 'Location' || row.type === 'Division') && (
                      <div className="md:col-span-3 space-y-2">
                         <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Zone Context</label>
                         <SearchableSelect
                           value={row.zone}
                           onChange={val => updateRow(row.id, 'zone', val)}
                           placeholder="Select Zone"
                           options={[...zoneList.filter(o => o.value?.toLowerCase() !== 'other'), { value: 'Other', label: 'Other (Not in list)' }]}
                         />
                         {row.zone === 'Other' && (
                           <input
                             required
                             type="text"
                             value={row.zoneOther}
                             onChange={e => updateRow(row.id, 'zoneOther', e.target.value)}
                             placeholder="Enter Zone Name"
                             className="w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl text-sm font-bold animate-slide-down outline-none"
                           />
                         )}
                      </div>
                    )}

                    {row.type === 'Location' && (
                      <>
                        <div className="md:col-span-3 space-y-2">
                          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Div Context</label>
                          <SearchableSelect
                            value={row.division}
                            onChange={val => updateRow(row.id, 'division', val)}
                            placeholder="Select Division"
                            options={[...divs.map(d => ({ value: d, label: d })).filter(o => o.value?.toLowerCase() !== 'other'), { value: 'Other', label: 'Other (Not in list)' }]}
                            disabled={!row.zone}
                          />
                          {row.division === 'Other' && (
                             <input
                              required
                              type="text"
                              value={row.divisionOther}
                              onChange={e => updateRow(row.id, 'divisionOther', e.target.value)}
                              placeholder="Enter Division Name"
                              className="w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl text-sm font-bold animate-slide-down outline-none"
                            />
                          )}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">W/Type Context</label>
                          <SearchableSelect
                            value={row.workstationType}
                            onChange={val => updateRow(row.id, 'workstationType', val)}
                            placeholder="Type"
                            options={[...workstationTypes.map(w => ({ value: w, label: w })).filter(o => o.value?.toLowerCase() !== 'other'), { value: 'Other', label: 'Other (Not in list)' }]}
                          />
                          {row.workstationType === 'Other' && (
                             <input
                              required
                              type="text"
                              value={row.workstationTypeOther}
                              onChange={e => updateRow(row.id, 'workstationTypeOther', e.target.value)}
                              placeholder="Specify Type"
                              className="w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl text-sm font-bold animate-slide-down outline-none"
                            />
                          )}
                        </div>
                      </>
                    )}

                    {(row.type === 'Department' || row.type === 'SubDepartment' || row.type === 'Designation') && (
                      <>
                        <div className="md:col-span-4 space-y-2">
                           <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Department</label>
                           <SearchableSelect
                             value={row.department}
                             onChange={val => updateRow(row.id, 'department', val)}
                             placeholder={row.type === 'Department' ? "Select Parent (Optional)" : "Select Department"}
                             options={[
                               ...deptList.filter(o => o.value?.toLowerCase() !== 'other'), 
                               { value: 'Other', label: 'Other (Not in list)' }
                             ]}
                           />
                           {row.department === 'Other' && (
                             <input
                               required
                               type="text"
                               value={row.departmentOther}
                               onChange={e => updateRow(row.id, 'departmentOther', e.target.value)}
                               placeholder={row.type === 'Department' ? "Enter Parent Name" : "Enter Dept Name"}
                               className="w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl text-sm font-bold animate-slide-down outline-none"
                             />
                           )}
                        </div>

                        <div className="md:col-span-4 space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sub-Department</label>
                            <SearchableSelect
                              value={row.subDepartment}
                              onChange={val => updateRow(row.id, 'subDepartment', val)}
                              placeholder={row.type === 'Department' || row.type === 'SubDepartment' ? "New Sub-Dept (Optional)" : "Select Sub-Department"}
                              options={[
                                ...(row.department && departments?.[row.department]?.subDepartments 
                                  ? Object.keys(departments[row.department].subDepartments)
                                      .filter(sd => sd.toLowerCase() !== 'other')
                                      .map(sd => ({ value: sd, label: sd }))
                                  : []),
                                { value: 'Other', label: 'Other (Not in list)' }
                              ]}
                              disabled={!row.department && row.department !== 'Other' && row.type !== 'Department'}
                            />
                            {row.subDepartment === 'Other' && (
                              <input
                                required
                                type="text"
                                value={row.subDepartmentOther || ''}
                                onChange={e => updateRow(row.id, 'subDepartmentOther', e.target.value)}
                                placeholder="Enter Sub-Dept Name"
                                className="w-full px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl text-sm font-bold animate-slide-down outline-none"
                              />
                            )}
                        </div>
                      </>
                    )}


                    <div className={`${(row.type === 'Location' || row.type === 'Division' || row.type === 'SubDepartment' || row.type === 'Designation' || row.type === 'Department') ? 'md:col-span-4' : 'md:col-span-6'} space-y-2`}>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                        {row.type === 'Location' ? 'Station Name' : 
                         (['Department', 'SubDepartment', 'Designation'].includes(row.type)) ? 'Designation' :
                         'Proposed Name'}
                      </label>
                      <input
                        required
                        type="text"
                        value={row.name}
                        onChange={e => updateRow(row.id, 'name', e.target.value)}
                        placeholder={(['Department', 'SubDepartment', 'Designation'].includes(row.type)) ? "New designation name..." : `New ${row.type.replace(/([A-Z])/g, ' $1').toLowerCase()} name...`}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>

                    <div className="md:col-span-full space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Additional Remarks (Optional)</label>
                      <textarea
                        rows={1}
                        value={row.description}
                        onChange={e => updateRow(row.id, 'description', e.target.value)}
                        placeholder="e.g. This is a newly functional station in Pune division..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
          <button
            type="button"
            onClick={addRow}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Another Suggestion
          </button>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3.5 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
            >
              Discard
            </button>
            <button
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-12 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit {suggestions.length} Request{suggestions.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestion History */}
      {mySuggestions.length > 0 && (
        <div className="mt-16 animate-fade-in mb-10">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Past Suggestions</h2>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{mySuggestions.length}</span>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
             {fetchingHistory ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
             ) : (
                <div className="divide-y divide-slate-100">
                  {mySuggestions.map((sug) => (
                    <div key={sug._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex gap-4 items-start">
                         <div className={`h-10 w-10 rounded-[1rem] flex items-center justify-center shrink-0 border ${
                           sug.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                           sug.status === 'accepted' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' :
                           sug.status === 'approved' || sug.status === 'merged' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                           'bg-red-50 border-red-100 text-red-500'
                         }`}>
                            {sug.status === 'pending' ? <Clock className="h-5 w-5" /> :
                             sug.status === 'accepted' ? <ShieldCheck className="h-5 w-5" /> :
                             sug.status === 'approved' || sug.status === 'merged' ? <CheckCircle className="h-5 w-5" /> :
                             <XCircle className="h-5 w-5" />}
                         </div>
                         <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                               <p className="font-black text-slate-900 text-sm leading-none">{sug.details?.name}</p>
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                  {sug.type.replace(/([A-Z])/g, ' $1').trim()}
                               </span>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex flex-wrap items-center gap-x-3 gap-y-1">
                               {sug.details?.zone && <span>Zone: <span className="text-slate-600">{sug.details.zone}</span></span>}
                               {sug.details?.division && <span>Div: <span className="text-slate-600">{sug.details.division}</span></span>}
                               {sug.details?.department && <span>Dept: <span className="text-slate-600">{sug.details.department}</span></span>}
                               {sug.details?.subDepartment && <span>Sub: <span className="text-slate-600">{sug.details.subDepartment}</span></span>}
                               {sug.details?.workstationType && <span>Type: <span className="text-slate-600">{sug.details.workstationType}</span></span>}
                            </div>
                            
                            {sug.adminRemark && (
                              <div className="mt-2 text-xs font-medium text-slate-500 bg-slate-100/50 p-2.5 rounded-xl border border-slate-100 inline-block w-full max-w-lg">
                                <span className="font-bold text-[10px] uppercase tracking-widest text-slate-400 block mb-0.5">Admin Remark:</span>
                                {sug.adminRemark}
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 min-w-[120px]">
                         <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                           sug.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                           sug.status === 'accepted' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                           sug.status === 'approved' || sug.status === 'merged' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                           'bg-red-50 text-red-600 border-red-200'
                         }`}>
                           {sug.status}
                         </div>
                         <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                           {new Date(sug.createdAt).toLocaleDateString()}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DataSuggestionPage;

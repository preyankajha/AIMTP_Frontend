import { useState, useEffect } from 'react';
import {
  Building2, Briefcase, Plus, Loader2, Edit3, Trash2,
  MapPin, Settings, ServerCrash, Save, ChevronDown, ChevronUp,
  Globe, User, TrendingUp, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

// ── Inline Add-item input component ─────────────────────────────
const AddItemInline = ({ onAdd, placeholder }) => {
  const [val, setVal] = useState('');
  const submit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (val.trim()) { onAdd(val.trim()); setVal(''); }
  };
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            submit(e);
          }
        }}
        placeholder={placeholder}
        className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      />
      <button
        type="button"
        onClick={submit}
        className="flex items-center gap-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black transition-all active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    </div>
  );
};

const AdminMasterDataPage = () => {
  const [selectedSector, setSelectedSector] = useState('Railway');
  const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'departments'

  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [zones, setZones] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dbSectors, setDbSectors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payLevels, setPayLevels] = useState([]);
  const [selectionModes, setSelectionModes] = useState([]);
  const [workstationTypes, setWorkstationTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locSearch, setLocSearch] = useState('');
  const [locLimit, setLocLimit] = useState(50);
  
  // Locations drill-down modal state
  const [manageType, setManageType] = useState(null);
  const [manageZone, setManageZone] = useState('');
  const [manageDiv, setManageDiv] = useState('');

  const [editingItem, setEditingItem] = useState(null); // Full object when editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'list'

  // Zone editor drill-down state
  const [zoneDivIdx, setZoneDivIdx] = useState(null);   // selected division index
  const [zoneWsType, setZoneWsType] = useState('Station'); // selected workstation type

  // Fetch sectors from public API
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const res = await api.get('/master-data/public');
        setSectors(res.data.sectors || []);
      } catch (e) { console.error(e); }
    };
    loadSectors();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [zonesRes, deptsRes, sectorsRes, catsRes, paysRes, modesRes, wrkRes, locRes] = await Promise.all([
        api.get('/master-data/zones'),
        api.get('/master-data/departments'),
        api.get('/master-data/sectors'),
        api.get('/master-data/categories'),
        api.get('/master-data/pay-levels'),
        api.get('/master-data/selection-modes'),
        api.get('/master-data/workstation-types'),
        api.get('/master-data/locations')
      ]);
      setZones(zonesRes.data);
      setDepartments(deptsRes.data);
      setDbSectors(sectorsRes.data);
      setCategories(catsRes.data);
      setPayLevels(paysRes.data);
      setSelectionModes(modesRes.data);
      setWorkstationTypes(wrkRes.data || []);
      setLocations(locRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    if (!window.confirm("This will overwrite existing Master Data with the legacy static files. Continue?")) return;
    try {
      setSeeding(true);
      await api.post('/master-data/seed');
      await fetchData();
    } catch (error) {
      alert("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} record? This may break existing data that relies on it.`)) return;
    try {
      const endpoints = {
        zones: `/master-data/zones/${id}`,
        departments: `/master-data/departments/${id}`,
        sectors: `/master-data/sectors/${id}`,
        categories: `/master-data/categories/${id}`,
        payLevels: `/master-data/pay-levels/${id}`,
        selectionModes: `/master-data/selection-modes/${id}`,
        workstationTypes: `/master-data/workstation-types/${id}`,
        locations: `/master-data/locations/${id}`
      };
      await api.delete(endpoints[activeTab]);

      const setters = {
        zones: setZones,
        departments: setDepartments,
        sectors: setDbSectors,
        categories: setCategories,
        payLevels: setPayLevels,
        selectionModes: setSelectionModes,
        workstationTypes: setWorkstationTypes,
        locations: setLocations
      };
      setters[activeTab](prev => prev.filter(item => item._id !== id));
    } catch (error) {
      alert("Deletion failed: " + (error.response?.data?.message || error.message));
    }
  };

  const openAddModal = () => {
    const defaults = {
      zones: { _id: null, name: '', code: '', divisions: [] },
      departments: { _id: null, name: '', subDepartments: [] },
      sectors: { _id: null, group: '', options: [] },
      categories: { _id: null, name: '', active: true },
      payLevels: { _id: null, name: '', sortOrder: 0, active: true },
      selectionModes: { _id: null, value: '', label: '', active: true },
      workstationTypes: { _id: null, name: '', active: true },
      locations: { _id: null, name: '', zone: '', division: '', workstationType: '', active: true }
    };
    setEditingItem(defaults[activeTab]);
    setZoneDivIdx(null);
    setZoneWsType('Station');
    setIsModalOpen(true);
  };

  // Helper: derive available name options for locations based on type + division
  const getLocationNameOptions = () => {
    if (!editingItem || activeTab !== 'locations') return [];
    const { zone, division, workstationType } = editingItem;
    if (!zone || !division || !workstationType) return [];
    const zoneObj = zones.find(z => z.name === zone);
    if (!zoneObj) return [];
    const divObj = zoneObj.divisions?.find(d => d.name === division);
    if (!divObj) return [];
    const typeLower = workstationType.toLowerCase();
    if (typeLower === 'station') return divObj.stations || [];
    if (typeLower === 'workshop') return divObj.workshops || [];
    return [];
  };

  const openEditModal = (item) => {
    setEditingItem(JSON.parse(JSON.stringify(item))); // Deep copy
    setZoneDivIdx(null);
    setZoneWsType('Station');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoints = {
        zones: '/master-data/zones',
        departments: '/master-data/departments',
        sectors: '/master-data/sectors',
        categories: '/master-data/categories',
        payLevels: '/master-data/pay-levels',
        selectionModes: '/master-data/selection-modes',
        workstationTypes: '/master-data/workstation-types',
        locations: '/master-data/locations'
      };

      const endpoint = endpoints[activeTab];

      if (editingItem._id) {
        await api.put(`${endpoint}/${editingItem._id}`, editingItem);
      } else {
        await api.post(endpoint, editingItem);
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // UI Handlers for deeply nested state
  const addSubItem = () => {
    if (activeTab === 'zones') {
      setEditingItem(prev => ({ ...prev, divisions: [...prev.divisions, { name: '', stations: [], workshops: [] }] }));
    } else if (activeTab === 'departments') {
      setEditingItem(prev => ({ ...prev, subDepartments: [...prev.subDepartments, { name: '', designations: [] }] }));
    } else if (activeTab === 'sectors') {
      setEditingItem(prev => ({ ...prev, options: [...prev.options, { value: '', label: '', active: false }] }));
    }
  };

  const updateSubItemName = (index, val) => {
    setEditingItem(prev => {
      const copy = { ...prev };
      if (activeTab === 'zones') copy.divisions[index].name = val;
      else if (activeTab === 'departments') copy.subDepartments[index].name = val;
      else if (activeTab === 'sectors') copy.options[index].label = val;
      return copy;
    });
  };

  const updateSubItemList = (index, val, field = 'default') => {
    setEditingItem(prev => {
      const copy = { ...prev };
      if (activeTab === 'zones') {
        if (field === 'workshops') {
          copy.divisions[index].workshops = val.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          copy.divisions[index].stations = val.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (activeTab === 'departments') {
        copy.subDepartments[index].designations = val.split(',').map(s => s.trim()).filter(Boolean);
      } else if (activeTab === 'sectors') {
        copy.options[index].value = val;
      }
      return copy;
    });
  };

  const removeSubItem = (index) => {
    setEditingItem(prev => {
      const copy = { ...prev };
      if (activeTab === 'zones') copy.divisions.splice(index, 1);
      else if (activeTab === 'departments') copy.subDepartments.splice(index, 1);
      else if (activeTab === 'sectors') copy.options.splice(index, 1);
      return copy;
    });
  };

  if (loading && zones.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="p-8 max-w-6xl mx-auto animate-fade-in relative pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary-600" />
              Master Data
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Manage the Regions, Zones, Divisions, and Department designations that power the portal.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Working Sector:</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold shadow-sm appearance-none"
              >
                {sectors.map(group => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map(opt => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        style={opt.active ? {} : { fontStyle: 'italic', color: '#94a3b8' }}
                      >
                        {opt.active ? opt.label : `${opt.label} — Coming Soon`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedSector === 'Railway' && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-bold text-sm transition-all"
              >
                {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ServerCrash className="h-4 w-4" />}
                {seeding ? 'Seeding...' : 'Reset to Default Data'}
              </button>
            )}

            <button
              onClick={openAddModal}
              disabled={selectedSector !== 'Railway'}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {{
                zones: 'Zone',
                departments: 'Department',
                sectors: 'Sector Group',
                categories: 'Category',
                payLevels: 'Pay Level',
                selectionModes: 'Selection Mode'
              }[activeTab] || 'Item'}
            </button>
          </div>
        </div>

        {selectedSector !== 'Railway' ? (
          <div className="bg-slate-50/50 rounded-[2rem] border border-slate-200 p-16 text-center mt-8 shadow-inner">
            <div className="h-16 w-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ServerCrash className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Coming Soon!</h3>
            <p className="text-slate-500 max-w-md mx-auto font-medium">
              Master Data schemas for the <span className="font-bold text-slate-700">{selectedSector}</span> sector are currently under active development. You will be able to manage this soon.
            </p>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' ? (
              <div className="space-y-8 animate-slide-up">
                {[
                  {
                    title: "🌍 Organization & Locations",
                    desc: "Manage Regions, Zones, Division structures, and physical workplaces physical layout setups",
                    items: [
                      { id: 'zones', label: 'Regions & Zones', desc: 'Zones, Divisions & Stations', icon: Building2, count: zones.length, color: 'primary' },
                      { id: 'locations', label: 'Workplace Locations', desc: 'Physical offices and physical branches list', icon: MapPin, count: locations.length, color: 'emerald' },
                      { id: 'workstationTypes', label: 'Workstation Types', desc: 'Building classification model setups', icon: Settings, count: workstationTypes.length, color: 'purple' },
                    ]
                  },
                  {
                    title: "👥 Staff & Designations",
                    desc: "Departments, Sub-departments, Roles, and Staff Category Filters",
                    items: [
                      { id: 'departments', label: 'Departments', desc: 'Sub-departments and Designations', icon: Briefcase, count: departments.length, color: 'amber' },
                      { id: 'categories', label: 'Categories', desc: 'Staff Category Filters List', icon: User, count: categories.length, color: 'green' },
                      { id: 'payLevels', label: 'Pay Levels', desc: 'Ranges index for Salary Bands', icon: TrendingUp, count: payLevels.length, color: 'violet' },
                    ]
                  },
                  {
                    title: "⚙️ System Configurations",
                    desc: "System structural sectors groups and entry triggers setup",
                    items: [
                      { id: 'sectors', label: 'Sectors Groups', desc: 'System structural Sector Groups', icon: Globe, count: dbSectors.length, color: 'indigo' },
                      { id: 'selectionModes', label: 'Selection Modes', desc: 'Staff entry type definitions setup', icon: CheckCircle2, count: selectionModes.length, color: 'sky' }
                    ]
                  }
                ].map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-slate-50/40 p-6 rounded-3xl border border-slate-200/40">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-slate-800 leading-tight">{group.title}</h2>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">{group.desc}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {group.items.map(card => {
                        const Icon = card.icon;
                        const colors = {
                          primary: 'bg-primary-50 text-primary-600',
                          emerald: 'bg-emerald-50 text-emerald-600',
                          amber: 'bg-amber-50 text-amber-600',
                          indigo: 'bg-indigo-50 text-indigo-600',
                          green: 'bg-green-50 text-green-600',
                          violet: 'bg-violet-50 text-violet-600',
                          purple: 'bg-purple-50 text-purple-600',
                          sky: 'bg-sky-50 text-sky-600'
                        };
                        return (
                          <div 
                            key={card.id} 
                            onClick={() => { setActiveTab(card.id); setCurrentView('list'); }}
                            className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
                          >
                            <div className="flex justify-between items-start">
                              <div className={`p-3 rounded-xl ${colors[card.color]} transition-transform group-hover:scale-110`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                {card.count}
                              </span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 mt-4 leading-tight">{card.label}</h3>
                            <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed">{card.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-black text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-all active:scale-95"
                  >
                    ← Back to Dashboard
                  </button>
                  <div className="h-4 w-px bg-slate-200" />
                  <p className="text-sm font-black text-slate-700 capitalize flex items-center gap-2">
                    Viewing: <span className="text-primary-600">{activeTab.replace(/([A-Z])/g, ' $1')}</span>
                  </p>
                </div>
                
                {/* Lists Layout */}
            <div className="space-y-4">
              {activeTab === 'zones' && zones.map(zone => (
                <div key={zone._id} className="bg-white border text-left border-slate-200 rounded-[1.25rem] shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-center p-5 cursor-pointer user-select-none" onClick={() => setExpandedId(expandedId === zone._id ? null : zone._id)}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary-50 rounded-xl text-primary-600 flex items-center justify-center font-black">
                        {zone.code}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{zone.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{zone.divisions?.length || 0} Divisions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(zone); }} className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(zone._id, 'zone'); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {expandedId === zone._id ? <ChevronUp className="h-5 w-5 text-slate-400 ml-2" /> : <ChevronDown className="h-5 w-5 text-slate-400 ml-2" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === zone._id && (
                    <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {zone.divisions?.map((div, i) => (
                          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                              <MapPin className="h-3 w-3 text-red-500" />
                              {div.name}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {div.stations?.slice(0, 10).map((st, j) => (
                                <span key={j} className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {st}
                                </span>
                              ))}
                              {div.stations?.length > 10 && <span className="text-[9px] font-bold text-slate-400">+{div.stations.length - 10} more</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeTab === 'departments' && departments.map(dept => (
                <div key={dept._id} className="bg-white border text-left border-slate-200 rounded-[1.25rem] shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-center p-5 cursor-pointer user-select-none" onClick={() => setExpandedId(expandedId === dept._id ? null : dept._id)}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{dept.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{dept.subDepartments?.length || 0} Sub-departments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(dept); }} className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(dept._id, 'department'); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {expandedId === dept._id ? <ChevronUp className="h-5 w-5 text-slate-400 ml-2" /> : <ChevronDown className="h-5 w-5 text-slate-400 ml-2" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === dept._id && (
                    <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dept.subDepartments?.map((sub, i) => (
                          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="font-bold text-slate-900 mb-2 truncate">
                              {sub.name}
                            </p>
                            <div className="flex flex-col gap-1.5 mt-2">
                              {sub.designations?.slice(0, 5).map((desig, j) => (
                                <div key={j} className="text-xs font-medium text-slate-600 truncate border-l-2 border-slate-200 pl-2">
                                  {desig}
                                </div>
                              ))}
                              {sub.designations?.length > 5 && <span className="text-[10px] font-bold text-slate-400 pl-2">+{sub.designations.length - 5} more roles</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeTab === 'sectors' && dbSectors.map(sector => (
                <div key={sector._id} className="bg-white border text-left border-slate-200 rounded-[1.25rem] shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-center p-5 cursor-pointer user-select-none" onClick={() => setExpandedId(expandedId === sector._id ? null : sector._id)}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{sector.group}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{sector.options?.length || 0} Sector Options</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(sector); }} className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(sector._id, 'sector'); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {expandedId === sector._id ? <ChevronUp className="h-5 w-5 text-slate-400 ml-2" /> : <ChevronDown className="h-5 w-5 text-slate-400 ml-2" />}
                    </div>
                  </div>

                  {expandedId === sector._id && (
                    <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sector.options?.map((opt, i) => (
                          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900">{opt.label}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Value: {opt.value}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${opt.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {opt.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeTab === 'categories' && categories.map(cat => (
                <div key={cat._id} className="bg-white border p-5 flex items-center justify-between border-slate-200 rounded-[1.25rem] shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{cat.name}</h3>
                      <p className={`text-[10px] font-black uppercase ${cat.active ? 'text-green-500' : 'text-slate-400'}`}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cat._id, 'category')} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'payLevels' && payLevels.map(p => (
                <div key={p._id} className="bg-white border p-5 flex items-center justify-between border-slate-200 rounded-[1.25rem] shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-violet-50 rounded-xl text-violet-600 flex items-center justify-center font-black">
                      {p.sortOrder}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{p.name}</h3>
                      <p className={`text-[10px] font-black uppercase ${p.active ? 'text-green-500' : 'text-slate-400'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p._id, 'pay level')} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'selectionModes' && selectionModes.map(m => (
                <div key={m._id} className="bg-white border p-5 flex items-center justify-between border-slate-200 rounded-[1.25rem] shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-sky-50 rounded-xl text-sky-600 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{m.label}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase mr-2 ${m.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.active ? 'Active' : 'Inactive'}
                    </div>
                    <button onClick={() => openEditModal(m)} className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(m._id, 'selection mode')} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'workstationTypes' && workstationTypes.map(w => (
                <div key={w._id} className="bg-white border p-5 flex items-center justify-between border-slate-200 rounded-[1.25rem] shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-purple-50 rounded-xl text-purple-600 flex items-center justify-center">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{w.name}</h3>
                      <p className={`text-[10px] font-black uppercase ${w.active ? 'text-green-500' : 'text-slate-400'}`}>
                        {w.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(w)} className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(w._id, 'workstation type')} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'locations' && (() => {
                // Build groups: workstationType → items[]
                const groups = {};

                // 1. Pre-seed groups from all known workstation types
                workstationTypes.forEach(wt => { groups[wt.name] = []; });

                // 2. Add actual Location documents
                locations.forEach(l => {
                  const type = l.workstationType || 'Unknown';
                  if (!groups[type]) groups[type] = [];
                  groups[type].push({ ...l, _source: 'location' });
                });

                // 3. Pull stations from zones → "Station" group (auto-merge)
                zones.forEach(zone => {
                  zone.divisions?.forEach(div => {
                    div.stations?.forEach(stationName => {
                      if (!groups['Station']) groups['Station'] = [];
                      const alreadyExists = locations.some(
                        l => l.name === stationName && l.zone === zone.name && l.division === div.name && l.workstationType === 'Station'
                      );
                      if (!alreadyExists) {
                        groups['Station'].push({
                          _id: `zone-${zone._id}-${div.name}-${stationName}`,
                          name: stationName,
                          zone: zone.name,
                          division: div.name,
                          workstationType: 'Station',
                          active: true,
                          _source: 'zone'
                        });
                      }
                    });
                  });
                });

                // 4. Sort: Station first, rest alphabetically
                const sortedTypes = Object.keys(groups).sort((a, b) => {
                  if (a === 'Station') return -1;
                  if (b === 'Station') return 1;
                  return a.localeCompare(b);
                });

                const palette = [
                  'bg-blue-50 text-blue-600', 'bg-emerald-50 text-emerald-600',
                  'bg-amber-50 text-amber-600', 'bg-violet-50 text-violet-600',
                  'bg-rose-50 text-rose-600', 'bg-cyan-50 text-cyan-600',
                  'bg-orange-50 text-orange-600', 'bg-teal-50 text-teal-600',
                  'bg-indigo-50 text-indigo-600', 'bg-pink-50 text-pink-600',
                ];

                return sortedTypes.map((type, typeIdx) => {
                  const items = groups[type] || [];
                  const groupKey = `loc-group-${type}`;
                  const isExpanded = expandedId === groupKey;
                  const colorClass = palette[typeIdx % palette.length];
                  const zoneCount = items.filter(i => i._source === 'zone').length;
                  const locCount = items.filter(i => i._source === 'location').length;

                  return (
                    <div key={type} className="bg-white border border-slate-200 rounded-[1.25rem] shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-primary-300">
                      <div
                        className="flex justify-between items-center p-5 cursor-pointer select-none"
                        onClick={() => {
                          setManageType(type);
                          setManageZone('');
                          setManageDiv('');
                          setLocSearch('');
                          setLocLimit(50);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 leading-tight">{type}</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{items.length} locations</span>
                              {locCount > 0 && <span className="bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-md">{locCount} custom</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{items.length}</span>
                          <span className="text-primary-600 bg-primary-50 text-xs font-black px-3 py-1.5 rounded-lg">Manage →</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </>
    )}
  </div>

      {/* ── Drill-down Manage Locations Modal ── */}
      {manageType && (() => {
        const availableZones = zones || [];
        const selectedZoneObj = availableZones.find(z => z.name === manageZone);
        const availableDivs = selectedZoneObj ? (selectedZoneObj.divisions || []) : [];

        // Filter locations based on manageType and potentially zone/div constraints
        let manageItems = locations.filter(l => l.workstationType === manageType);
        if (manageZone) manageItems = manageItems.filter(l => l.zone === manageZone);
        if (manageDiv) manageItems = manageItems.filter(l => l.division === manageDiv);

        const filtered = manageItems.filter(i => 
          i.name.toLowerCase().includes(locSearch.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
        const visible = filtered.slice(0, locLimit);

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={() => setManageType(null)} />
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col relative z-[61] animate-fade-in-up overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Manage {manageType}s</h2>
                    <p className="text-xs font-bold text-slate-500 mt-1">Select a Zone and Division to view or add locations.</p>
                  </div>
                </div>
                <button onClick={() => setManageType(null)} className="text-slate-400 hover:text-slate-900 text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl transition-all">Close</button>
              </div>

              {/* Body */}
              {/* Body */}
              <div className="flex flex-col flex-1 min-h-0 bg-slate-50/50">
                
                {/* Top Constraints Bar */}
                <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-10">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">1. Select Zone</label>
                    <div className="relative">
                      <select
                        value={manageZone}
                        onChange={e => { setManageZone(e.target.value); setManageDiv(''); setLocSearch(''); setLocLimit(50); }}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-4 pr-10 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm transition-all"
                      >
                        <option value="" disabled>-- Choose a Zone --</option>
                        {availableZones.map(z => (
                          <option key={z._id} value={z.name}>{z.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">2. Select Division</label>
                    <div className="relative">
                      <select
                        value={manageDiv}
                        onChange={e => { setManageDiv(e.target.value); setLocSearch(''); setLocLimit(50); }}
                        disabled={!manageZone || availableDivs.length === 0}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-4 pr-10 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <option value="" disabled>
                          {!manageZone ? '-- First select a Zone --' : availableDivs.length === 0 ? 'No divisions exist in this zone' : '-- Choose a Division --'}
                        </option>
                        {availableDivs.map((d, idx) => (
                          <option key={idx} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Main Content: Location Results */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                  {!manageZone || !manageDiv ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <div className="h-16 w-16 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                        <MapPin className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-black text-slate-400">Select Region Constraints</p>
                      <p className="text-xs text-slate-400 font-medium mt-2 max-w-xs leading-relaxed">Please select a Zone and Division using the dropdowns above to securely load the {manageType} locations database.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 min-h-0 bg-slate-50/30">
                      {/* Search & Actions Bar */}
                      <div className="p-4 bg-white z-10 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder={`Search ${filtered.length} matching ${manageType}s...`}
                          value={locSearch}
                          onChange={e => { setLocSearch(e.target.value); setLocLimit(50); }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                      </div>

                      {/* Items List */}
                      <div className="flex-1 overflow-y-auto px-6 py-4">
                        {manageItems.length === 0 ? (
                          <div className="mt-8">
                             <p className="text-center text-slate-400 font-medium text-sm py-6">No {manageType}s added to {manageDiv} yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-sm px-3">
                            {visible.length === 0 ? (
                               <p className="text-center text-slate-400 text-xs py-6 font-bold">No locations match your search query.</p>
                            ) : (
                              visible.map(item => (
                                <div key={item._id} className="flex items-center justify-between py-2.5 group hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-base">{item._source === 'zone' ? '🏠' : '📍'}</span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
                                      <p className="text-[10px] text-slate-400 font-bold truncate">
                                        ID: {item._id} {item._source === 'zone' && <span className="ml-1 text-slate-300 italic">· zone seed</span>}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                      {item.active ? 'Active' : 'Off'}
                                    </span>
                                    <button onClick={() => { setManageType(null); openEditModal(item); }} className="p-1.5 text-slate-500 hover:text-primary-600 bg-white shadow-sm hover:bg-primary-50 rounded-lg transition-colors border border-slate-200">
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(item._id, 'location')} className="p-1.5 text-slate-500 hover:text-red-600 bg-white shadow-sm hover:bg-red-50 rounded-lg transition-colors border border-slate-200">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                            {filtered.length > locLimit && (
                              <div className="py-4 flex justify-center mt-2 border-t border-slate-100">
                                <button 
                                  onClick={() => setLocLimit(l => l + 50)}
                                  className="text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-all shadow-sm"
                                >
                                  Load More ({filtered.length - locLimit} remaining)
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Add Item Bottom Bar */}
                      <div className="p-5 border-t border-slate-200 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.03)] shrink-0">
                         <AddItemInline 
                            onAdd={async (val) => {
                               try {
                                 // Parse comma separated values
                                 const names = val.split(',').map(n => n.trim()).filter(Boolean);
                                 if (names.length === 0) return;
                                 
                                 await Promise.all(names.map(name => 
                                   api.post('/master-data/locations', {
                                     name, zone: manageZone, division: manageDiv, workstationType: manageType, active: true
                                   })
                                 ));
                                 fetchData();
                               } catch(e) { console.error(e); }
                            }} 
                            placeholder={`+ Type ${manageType} name(s) separated by commas...`} 
                         />
                         <p className="text-[10px] font-bold text-slate-400 mt-2.5 ml-1 text-center">New {manageType}s will automatically strictly map to <strong>{manageZone}</strong> → <strong>{manageDiv}</strong>.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Editor Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          {/* Editor Panel */}
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">
                {editingItem._id ? 'Edit' : 'Add'} {{
                  zones: 'Zone',
                  departments: 'Department',
                  sectors: 'Sector Group',
                  categories: 'Category',
                  payLevels: 'Pay Level',
                  selectionModes: 'Selection Mode',
                  workstationTypes: 'Workstation Type',
                  locations: 'Location'
                }[activeTab]}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-lg">Close</button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activeTab === 'zones' || activeTab === 'departments' || activeTab === 'categories' || activeTab === 'workstationTypes') && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Name / Label</label>
                    <input
                      required
                      type="text"
                      value={editingItem.name}
                      onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                      placeholder="e.g. Northern Railway / Office / General"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                    />
                  </div>
                )}

                {activeTab === 'locations' && (() => {
                  const selZone = editingItem.zone || '';
                  const selDiv = editingItem.division || '';
                  const selType = editingItem.workstationType || '';
                  const selName = editingItem.name || '';
                  const divOptions = zones.find(z => z.name === selZone)?.divisions || [];
                  const nameOpts = getLocationNameOptions();
                  const isKnownType = selType.toLowerCase() === 'station' || selType.toLowerCase() === 'workshop';

                  const steps = [
                    { num: 1, label: 'Zone / Region', done: !!selZone, value: selZone },
                    { num: 2, label: 'Division',       done: !!selDiv,  value: selDiv  },
                    { num: 3, label: 'Workstation Type', done: !!selType, value: selType },
                    { num: 4, label: 'Location Name',  done: !!selName, value: selName  },
                  ];

                  return (
                    <div className="col-span-full space-y-0">
                      {/* Progress bar */}
                      <div className="flex items-center gap-0 mb-6">
                        {steps.map((s, i) => (
                          <div key={s.num} className="flex items-center flex-1 min-w-0">
                            <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-black flex-shrink-0 transition-all ${s.done ? 'bg-emerald-500 text-white' : i === 0 || steps[i-1]?.done ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-slate-100 text-slate-400'}`}>
                              {s.done ? '✓' : s.num}
                            </div>
                            {i < steps.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 transition-all ${steps[i].done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Step 1 — Zone */}
                      <div className={`rounded-2xl border p-4 mb-3 transition-all ${selZone ? 'border-emerald-200 bg-emerald-50/40' : 'border-primary-200 bg-primary-50/30'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${selZone ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white'}`}>
                            {selZone ? '✓' : '1'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step 1</p>
                            <p className="text-sm font-black text-slate-800 leading-tight">Select Zone / Region</p>
                          </div>
                          {selZone && (
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg truncate max-w-[140px]">{selZone}</span>
                          )}
                        </div>
                        <select
                          required
                          value={selZone}
                          onChange={e => setEditingItem({ ...editingItem, zone: e.target.value, division: '', workstationType: '', name: '' })}
                          className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold appearance-none"
                        >
                          <option value="">— Select Zone —</option>
                          {zones.map(z => <option key={z._id} value={z.name}>{z.name} ({z.code})</option>)}
                        </select>
                      </div>

                      {/* Step 2 — Division */}
                      <div className={`rounded-2xl border p-4 mb-3 transition-all ${!selZone ? 'border-slate-100 bg-slate-50/50 opacity-50 pointer-events-none' : selDiv ? 'border-emerald-200 bg-emerald-50/40' : 'border-primary-200 bg-primary-50/30'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${selDiv ? 'bg-emerald-500 text-white' : selZone ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {selDiv ? '✓' : '2'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step 2</p>
                            <p className="text-sm font-black text-slate-800 leading-tight">Select Division</p>
                          </div>
                          {selDiv && (
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg truncate max-w-[140px]">{selDiv}</span>
                          )}
                        </div>
                        <select
                          required
                          value={selDiv}
                          onChange={e => setEditingItem({ ...editingItem, division: e.target.value, workstationType: '', name: '' })}
                          className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold appearance-none"
                        >
                          <option value="">— Select Division —</option>
                          {divOptions.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>

                      {/* Step 3 — Workstation Type */}
                      <div className={`rounded-2xl border p-4 mb-3 transition-all ${!selDiv ? 'border-slate-100 bg-slate-50/50 opacity-50 pointer-events-none' : selType ? 'border-emerald-200 bg-emerald-50/40' : 'border-primary-200 bg-primary-50/30'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${selType ? 'bg-emerald-500 text-white' : selDiv ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {selType ? '✓' : '3'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step 3</p>
                            <p className="text-sm font-black text-slate-800 leading-tight">Select Workstation Type</p>
                          </div>
                          {selType && (
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg truncate max-w-[140px]">{selType}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {workstationTypes.map(wt => (
                            <button
                              key={wt._id}
                              type="button"
                              onClick={() => setEditingItem({ ...editingItem, workstationType: wt.name, name: '' })}
                              className={`text-left px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selType === wt.name ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50'}`}
                            >
                              {wt.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 4 — Location Name */}
                      <div className={`rounded-2xl border p-4 transition-all ${!selType ? 'border-slate-100 bg-slate-50/50 opacity-50 pointer-events-none' : selName ? 'border-emerald-200 bg-emerald-50/40' : 'border-primary-200 bg-primary-50/30'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${selName ? 'bg-emerald-500 text-white' : selType ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {selName ? '✓' : '4'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Step 4</p>
                            <p className="text-sm font-black text-slate-800 leading-tight">
                              {selType ? `Select ${selType} Name` : 'Location Name'}
                            </p>
                          </div>
                          {selName && (
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg truncate max-w-[180px]">{selName}</span>
                          )}
                        </div>
                        {isKnownType ? (
                          nameOpts.length > 0 ? (
                            <select
                              required
                              value={selName}
                              onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold appearance-none"
                            >
                              <option value="">— Select {selType} —</option>
                              {nameOpts.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 font-bold">
                              ⚠️ No {selType}s found for <span className="font-black">{selDiv}</span> division. 
                              Add them in <span className="font-black">Regions &amp; Zones → Edit Zone</span> first.
                            </div>
                          )
                        ) : (
                          <input
                            required
                            type="text"
                            value={selName}
                            onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                            placeholder={`Enter ${selType || 'location'} name...`}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                          />
                        )}
                      </div>

                      {/* Active toggle */}
                      <div className="flex items-center gap-3 mt-4 px-1">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, active: !editingItem.active })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingItem.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editingItem.active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <label className="text-sm font-bold text-slate-700">
                          {editingItem.active ? '✅ Active — visible in dropdowns' : '⛔ Inactive — hidden from dropdowns'}
                        </label>
                      </div>
                    </div>
                  );
                })()}

                {activeTab === 'sectors' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Group Title</label>
                    <input
                      required
                      type="text"
                      value={editingItem.group}
                      onChange={e => setEditingItem({ ...editingItem, group: e.target.value })}
                      placeholder="e.g. Transport Sector"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                    />
                  </div>
                )}

                {activeTab === 'zones' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Code / Alias</label>
                    <input
                      required
                      type="text"
                      value={editingItem.code || ''}
                      onChange={e => setEditingItem({ ...editingItem, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. NR"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                    />
                  </div>
                )}

                {activeTab === 'payLevels' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Level Name</label>
                      <input
                        required
                        type="text"
                        value={editingItem.name}
                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                        placeholder="e.g. Level 1"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sort Order</label>
                      <input
                        required
                        type="number"
                        value={editingItem.sortOrder}
                        onChange={e => setEditingItem({ ...editingItem, sortOrder: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'selectionModes' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Value Key</label>
                      <input
                        required
                        type="text"
                        value={editingItem.value}
                        onChange={e => setEditingItem({ ...editingItem, value: e.target.value.toUpperCase() })}
                        placeholder="e.g. RRB"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Display Label</label>
                      <input
                        required
                        type="text"
                        value={editingItem.label}
                        onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                        placeholder="e.g. RRB (Railway Recruitment Board)"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-bold"
                      />
                    </div>
                  </>
                )}

                {(activeTab === 'categories' || activeTab === 'payLevels' || activeTab === 'selectionModes' || activeTab === 'workstationTypes' || activeTab === 'locations') && (
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={editingItem.active}
                      onChange={e => setEditingItem({ ...editingItem, active: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Display this item in dropdowns</label>
                  </div>
                )}
              </div>

              {/* ── ZONES: Divisions Editor ── */}
              {activeTab === 'zones' && (() => {
                const divisions = editingItem.divisions || [];

                return (
                  <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
                      <div>
                        <h3 className="text-sm font-black text-slate-800">Divisions List</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage the divisions belonging to this zone.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(prev => {
                            const copy = { ...prev };
                            if (!copy.divisions) copy.divisions = [];
                            copy.divisions.push({ name: '' });
                            return copy;
                          });
                        }}
                        className="flex items-center gap-1.5 text-xs font-black text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Plus className="h-4 w-4" /> Add Division
                      </button>
                    </div>

                    <div className="p-4 space-y-3 bg-white">
                      {divisions.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium text-center py-6">No divisions added yet.</p>
                      ) : (
                        divisions.map((div, idx) => (
                          <div key={idx} className="flex items-center gap-3 relative">
                            <span className="text-[10px] font-black w-6 text-center text-slate-400">#{idx + 1}</span>
                            <input
                              required
                              type="text"
                              value={div.name || ''}
                              onChange={e => {
                                setEditingItem(prev => {
                                  const copy = { ...prev };
                                  copy.divisions[idx].name = e.target.value;
                                  return copy;
                                });
                              }}
                              placeholder="e.g. Pune Division"
                              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(prev => {
                                  const copy = { ...prev };
                                  copy.divisions = copy.divisions.filter((_, i) => i !== idx);
                                  return copy;
                                });
                              }}
                              className="text-slate-300 hover:text-red-500 p-2 transition-colors rounded-xl hover:bg-red-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))
                      )}

                      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                        <div className="text-xl">📍</div>
                        <div>
                          <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Architectural Update</p>
                          <p className="text-xs font-medium text-amber-800 mt-1">
                            Locations (Stations, Workshops, Loco Sheds, etc.) are purely managed through the <strong>Workplace Locations</strong> section in the main dashboard. They are mapped securely via foreign key logic to this Zone and its Divisions automatically!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── DEPARTMENTS & SECTORS: keep original layout ── */}
              {(activeTab === 'departments' || activeTab === 'sectors') && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-black text-slate-700">
                      {activeTab === 'departments' ? 'Sub-departments & Designations' : 'Individual Sectors & Status'}
                    </h3>
                    <button type="button" onClick={addSubItem} className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Add Row
                    </button>
                  </div>
                  {(activeTab === 'departments' ? editingItem.subDepartments : editingItem.options)?.map((sub, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative group">
                      <button type="button" onClick={() => removeSubItem(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="space-y-4 pr-8">
                        <input
                          required type="text"
                          value={sub.label || sub.name}
                          onChange={e => updateSubItemName(index, e.target.value)}
                          placeholder={activeTab === 'departments' ? 'Sub-department name' : 'Sector name'}
                          className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        />
                        <div className={`grid grid-cols-1 ${activeTab === 'sectors' ? 'md:grid-cols-2' : ''} gap-4`}>
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">
                              {activeTab === 'departments' ? 'Designations (Comma separated)' : 'Unique Value / ID'}
                            </p>
                            {activeTab === 'sectors' ? (
                              <input required type="text" value={sub.value}
                                onChange={e => updateSubItemList(index, e.target.value)}
                                placeholder="e.g. Railway"
                                className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                            ) : (
                              <textarea rows={4}
                                value={sub.designations?.join(', ')}
                                onChange={e => updateSubItemList(index, e.target.value)}
                                placeholder="Designation 1, Designation 2..."
                                className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-y min-h-[80px]" />
                            )}
                          </div>
                          {activeTab === 'sectors' && (
                            <div className="flex items-center gap-2 pt-4">
                              <input type="checkbox" id={`active-${index}`} checked={sub.active}
                                onChange={e => {
                                  setEditingItem(prev => {
                                    const copy = { ...prev };
                                    copy.options[index].active = e.target.checked;
                                    return copy;
                                  });
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                              <label htmlFor={`active-${index}`} className="text-xs font-bold text-slate-600">Enabled</label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </form>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-[2rem]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-3.5 rounded-xl font-black shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-slate-400" />}
                {saving ? 'Saving...' : 'Save Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminMasterDataPage;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Repeat, ArrowRight, Search, Users, ShieldCheck, Activity, RotateCcw, ChevronDown, MapPin, Send, MessageCircle, Facebook } from 'lucide-react';
import { getPublicTransfers } from '../services/transferService';
import TransferCard from '../components/TransferCard';

import { useMasterData } from '../context/MasterDataContext';

const LandingPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter states
  const [searchMode, setSearchMode] = useState('any'); // 'any' (In Location) or 'route' (Route Match)
  const [filters, setFilters] = useState({
    zone: '',
    division: '',
    workstation: '',
    station: '',
    desiredZone: '',
    desiredDivision: '',
    desiredWorkstation: '',
    desiredStation: '',
    designation: '',
    sector: ''
  });

  const {
    loading: masterLoading,
    regionData,
    sectors,
    getZoneList,
    departments
  } = useMasterData();

  const zoneList = getZoneList();

  // From Lists
  const divisionList = filters.zone && regionData?.[filters.zone] ? Object.keys(regionData[filters.zone].divisions || {}) : [];
  const workstationList = filters.zone && filters.division && regionData?.[filters.zone]?.divisions?.[filters.division] ? Object.keys(regionData[filters.zone].divisions[filters.division]) : [];
  const stationList = filters.zone && filters.division && filters.workstation && regionData?.[filters.zone]?.divisions?.[filters.division]?.[filters.workstation] ? regionData[filters.zone].divisions[filters.division][filters.workstation] : [];

  // To Lists
  const desiredDivisionList = filters.desiredZone && regionData?.[filters.desiredZone] ? Object.keys(regionData[filters.desiredZone].divisions || {}) : [];
  const desiredWorkstationList = filters.desiredZone && filters.desiredDivision && regionData?.[filters.desiredZone]?.divisions?.[filters.desiredDivision] ? Object.keys(regionData[filters.desiredZone].divisions[filters.desiredDivision]) : [];
  const desiredStationList = filters.desiredZone && filters.desiredDivision && filters.desiredWorkstation && regionData?.[filters.desiredZone]?.divisions?.[filters.desiredDivision]?.[filters.desiredWorkstation] ? regionData[filters.desiredZone].divisions[filters.desiredDivision][filters.desiredWorkstation] : [];

  // Flattening designations for the filter
  const allDesignations = Object.values(departments || {}).flatMap(dept =>
    Object.values(dept.subDepartments || {}).flat()
  );
  const uniqueDesignations = [...new Set(allDesignations)].sort();

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const data = await getPublicTransfers();
        setTransfers(data.transfers);
        setFilteredTransfers(data.transfers);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'zone') { newFilters.division = ''; newFilters.workstation = ''; newFilters.station = ''; }
      if (name === 'division') { newFilters.workstation = ''; newFilters.station = ''; }
      if (name === 'workstation') { newFilters.station = ''; }
      if (name === 'desiredZone') { newFilters.desiredDivision = ''; newFilters.desiredWorkstation = ''; newFilters.desiredStation = ''; }
      if (name === 'desiredDivision') { newFilters.desiredWorkstation = ''; newFilters.desiredStation = ''; }
      if (name === 'desiredWorkstation') { newFilters.desiredStation = ''; }
      return newFilters;
    });
  };

  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setFilters({
      zone: '', division: '', workstation: '', station: '',
      desiredZone: '', desiredDivision: '', desiredWorkstation: '', desiredStation: '',
      designation: filters.designation,
      sector: filters.sector
    });
  };

  const resetFilters = () => {
    setFilters({
      zone: '', division: '', workstation: '', station: '',
      desiredZone: '', desiredDivision: '', desiredWorkstation: '', desiredStation: '',
      designation: '',
      sector: ''
    });
    setFilteredTransfers(transfers);
  };

  const handleSearch = () => {
    let result = transfers;

    // Mode specific filtering
    if (searchMode === 'any') {
      if (filters.zone) result = result.filter(t => t.currentZone === filters.zone);
      if (filters.division) result = result.filter(t => t.currentDivision === filters.division);
      if (filters.workstation) result = result.filter(t => t.currentWorkstation === filters.workstation);
      if (filters.station) result = result.filter(t => t.currentStation === filters.station);
    } else {
      if (filters.zone) result = result.filter(t => t.currentZone === filters.zone);
      if (filters.division) result = result.filter(t => t.currentDivision === filters.division);
      if (filters.workstation) result = result.filter(t => t.currentWorkstation === filters.workstation);
      if (filters.station) result = result.filter(t => t.currentStation === filters.station);

      if (filters.desiredZone) result = result.filter(t => t.desiredZone === filters.desiredZone);
      if (filters.desiredDivision) result = result.filter(t => t.desiredDivision === filters.desiredDivision);
      if (filters.desiredWorkstation) result = result.filter(t => t.desiredWorkstation === filters.desiredWorkstation);
      if (filters.desiredStation) result = result.filter(t => t.desiredStation === filters.desiredStation);
    }

    // Common filters
    if (filters.designation) result = result.filter(t => t.designation === filters.designation);
    if (filters.sector) result = result.filter(t => t.sector === filters.sector);

    setFilteredTransfers(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-200 selection:text-primary-900 overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 glass border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 overflow-hidden shrink-0">
                <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">All India Mututal Transfer Portal</span>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5">Mutual Portal</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#" className="text-sm font-bold text-slate-600 hover:text-primary-900 transition-colors">Home</a>
              <a href="#browse" className="text-sm font-bold text-slate-600 hover:text-primary-900 transition-colors">Browse Requests</a>
              <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-primary-900 transition-colors">How It Works</a>

              <div className="flex items-center gap-6 pl-6 border-l border-slate-200">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-600 hover:text-primary-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-black text-white bg-primary-900 rounded-lg hover:bg-slate-900 shadow-md shadow-primary-900/10 transition-all active:scale-95"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-[800px] h-[800px] bg-primary-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-[600px] h-[600px] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wide mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Modernizing Mutual Transfers
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
              Find your ideal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">mutual partner</span> faster than ever.
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium mb-10">
              The official, secure, and intelligent Portal for verified employees to discover, connect, and process mutual transfer requests seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-1 w-full sm:w-auto"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Browse Transfer Requests Section */}
        <section id="browse" className="py-24 bg-slate-50 relative border-t border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Browse Transfer Requests
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                Explore active transfer requests from employees across India
              </p>
            </div>

            {/* Filter Toggle & Mode Container */}
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-80 self-center shadow-inner">
                <button
                  onClick={() => handleModeChange('any')}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-black py-3 rounded-xl transition-all ${searchMode === 'any' ? 'bg-white shadow-md text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <MapPin className="h-4 w-4" />
                  In Location
                </button>
                <button
                  onClick={() => handleModeChange('route')}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-black py-3 rounded-xl transition-all ${searchMode === 'route' ? 'bg-white shadow-md text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Repeat className="h-4 w-4" />
                  Route Match
                </button>
              </div>

              {/* Filter Bar Content */}
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-8 animate-fade-in transition-all">
                <div className="flex flex-col gap-8">
                  {/* Step 1: Sector Selection */}
                  <div className="space-y-3 pb-6 border-b border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">1. Choose Working Sector</label>
                    <div className="relative max-w-md">
                      <select
                        name="sector"
                        value={filters.sector}
                        onChange={handleFilterChange}
                        title={filters.sector}
                        className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
                      >
                        <option value="">Select Sector</option>
                        {sectors?.map(group => (
                          <optgroup key={group.group} label={group.group}>
                            {group.options.map(opt => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                className={!opt.active ? 'text-slate-400 font-normal italic' : ''}
                                style={!opt.active ? { color: '#94a3b8' } : {}}
                              >
                                {opt.label} {!opt.active ? '(Soon)' : ''}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {filters.sector === '' ? (
                    /* Initial Prompt */
                    <div className="py-20 text-center">
                      <div className="h-20 w-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-primary-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to search?</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto">Please select a sector first to unlock advanced filters and find your partner.</p>
                    </div>
                  ) : filters.sector !== 'Railway' ? (
                    /* Coming Soon for other sectors */
                    <div className="py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                      <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Activity className="h-7 w-7 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">Coming Soon!</h3>
                      <p className="text-slate-500 font-medium">The {filters.sector} sector is currently under development.</p>
                    </div>
                  ) : (
                    /* Advanced Filters for Railway */
                    <div className="flex flex-col gap-8 animate-fade-in">
                      {searchMode === 'any' ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Zone</label>
                            <div className="relative">
                              <select name="zone" value={filters.zone} onChange={handleFilterChange} title={filters.zone} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all truncate">
                                <option value="">Any Zone</option>
                                {zoneList.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Division</label>
                            <div className="relative">
                              <select name="division" value={filters.division} onChange={handleFilterChange} disabled={!filters.zone} title={filters.division} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate">
                                <option value="">Any Division</option>
                                {divisionList.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Workstation Type</label>
                            <div className="relative">
                              <select name="workstation" value={filters.workstation} onChange={handleFilterChange} disabled={!filters.division} title={filters.workstation} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate">
                                <option value="">Any Workstation</option>
                                {workstationList.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Location</label>
                            <div className="relative">
                              <select name="station" value={filters.station} onChange={handleFilterChange} disabled={!filters.workstation} title={filters.station} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate">
                                <option value="">Any Location</option>
                                {stationList.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-8">
                          {/* FROM Row */}
                          <div className="flex justify-start w-full">
                            <div className="w-full lg:w-[92%] bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3 relative shadow-sm">
                              <div className="absolute -top-3 left-6 bg-slate-800 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md">FROM</div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Zone</label>
                                  <div className="relative">
                                    <select name="zone" value={filters.zone} onChange={handleFilterChange} title={filters.zone} className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all truncate"><option value="">Any Zone</option>{zoneList.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Division</label>
                                  <div className="relative">
                                    <select name="division" value={filters.division} onChange={handleFilterChange} disabled={!filters.zone} title={filters.division} className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate"><option value="">Any Division</option>{divisionList.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Workstation Type</label>
                                  <div className="relative">
                                    <select name="workstation" value={filters.workstation} onChange={handleFilterChange} disabled={!filters.division} title={filters.workstation} className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate"><option value="">Any Workstation</option>{workstationList.map(w => <option key={w} value={w}>{w}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                                  <div className="relative">
                                    <select name="station" value={filters.station} onChange={handleFilterChange} disabled={!filters.workstation} title={filters.station} className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate"><option value="">Any Location</option>{stationList.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* TO Row */}
                          <div className="flex justify-end w-full">
                            <div className="w-full lg:w-[92%] bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 flex flex-col gap-3 relative shadow-sm">
                              <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md">TO</div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Zone</label>
                                  <div className="relative">
                                    <select name="desiredZone" value={filters.desiredZone} onChange={handleFilterChange} title={filters.desiredZone} className="w-full pl-3 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all truncate"><option value="">Any Zone</option>{zoneList.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Division</label>
                                  <div className="relative">
                                    <select name="desiredDivision" value={filters.desiredDivision} onChange={handleFilterChange} disabled={!filters.desiredZone} title={filters.desiredDivision} className="w-full pl-3 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate"><option value="">Any Division</option>{desiredDivisionList.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Workstation Type</label>
                                  <div className="relative">
                                    <select name="desiredWorkstation" value={filters.desiredWorkstation} onChange={handleFilterChange} disabled={!filters.desiredDivision} title={filters.desiredWorkstation} className="w-full pl-3 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate"><option value="">Any Workstation</option>{desiredWorkstationList.map(w => <option key={w} value={w}>{w}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Location</label>
                                  <div className="relative">
                                    <select name="desiredStation" value={filters.desiredStation} onChange={handleFilterChange} disabled={!filters.desiredWorkstation} title={filters.desiredStation} className="w-full pl-3 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 truncate"><option value="">Any Location</option>{desiredStationList.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Common Bottom Row: Designation & Actions */}
                      <div className="flex flex-col md:flex-row items-end gap-6 pt-4 border-t border-slate-100">
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Search by Designation</label>
                          <div className="relative">
                            <select
                              name="designation"
                              value={filters.designation}
                              onChange={handleFilterChange}
                              title={filters.designation}
                              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all truncate"
                            >
                              <option value="">All Designations</option>
                              {uniqueDesignations.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                          <button
                            onClick={handleSearch}
                            className="flex-1 md:w-56 h-[46px] flex items-center justify-center gap-2 bg-primary-900 hover:bg-slate-900 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-primary-900/10 active:scale-95"
                          >
                            <Search className="h-4 w-4" />
                            Search Transfers
                          </button>
                          <button
                            onClick={resetFilters}
                            className="h-[46px] w-[46px] flex items-center justify-center bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-red-600 transition-all hover:bg-red-50 hover:border-red-100"
                            title="Reset Filters"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredTransfers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTransfers.map((transfer) => (
                  <div key={transfer._id} className="animate-fade-in">
                    <TransferCard transfer={transfer} isPublic={true} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No requests found</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            )}

            <div className="mt-16 text-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
              >
                View All Transfer Requests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Everything you need to find a match
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                Our Portal streamlines the entire process of finding a mutual transfer partner, saving you time and effort.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-500/5 transition-all group">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-slate-200/50 text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Discovery</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Advanced search filters to find exact matches based on zone, division, department, and designation.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-slate-200/50 text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Matching</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Our algorithm automatically identifies and notifies you of potential reciprocal transfer matches in real-time.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-500/5 transition-all group">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-slate-200/50 text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Verified</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Built exclusively for authenticated and verified employees ensuring privacy and trustworthy interactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 bg-slate-50 border-t border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                How it works
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                Four simple steps to process your mutual transfer request.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-0"></div>

              {[
                { step: '01', title: 'Register', desc: 'Create your account using official details.' },
                { step: '02', title: 'Create Request', desc: 'Post your current posting and desired locations.' },
                { step: '03', title: 'Find Match', desc: 'Browse matches or let our system notify you.' },
                { step: '04', title: 'Connect', desc: 'Contact your match and initiate the official process.' }
              ].map((item, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center shadow-lg text-xl font-extrabold text-primary-600 mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm font-medium text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary-900 rounded-[2rem] p-10 md:p-16 relative overflow-hidden shadow-2xl border border-white/10">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                <div className="h-16 w-16 bg-white rounded-full mb-8 flex items-center justify-center shadow-xl overflow-hidden">
                  <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                  Ready to Find Your Transfer Partner?
                </h2>
                <p className="text-white/70 text-lg md:text-xl font-medium mb-10 leading-relaxed">
                  Join thousands of employees who have successfully found mutual transfer partners through our platform. It's free, fast, and secure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-black text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a
                    href="#browse"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white border-2 border-white/20 rounded-xl hover:bg-white/5 transition-all active:scale-95"
                  >
                    Browse Transfers
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-slate-200">
                  <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tight">All India Mututal Transfer Portal</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mb-6">
                India's leading platform for employees to find mutual transfer partners across all regions and divisions.
              </p>
              <div className="text-xs font-bold text-slate-400">
                Made with care for Employees
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li><Link to="/transfers/search" className="hover:text-primary-600 transition-colors">Search Transfers</Link></li>
                <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-wider">Support</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Report Issue</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Feedback</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                <li><Link to="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-wider">Social</h4>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                    <div className="h-7 w-7 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                      <Send className="h-4 w-4" />
                    </div>
                    Telegram
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                    <div className="h-7 w-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    WhatsApp Channel
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/AllIndiaMutualPortal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                    <div className="h-7 w-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <Facebook className="h-4 w-4" />
                    </div>
                    Facebook Page
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <div className="text-slate-400 text-[11px] font-bold text-center tracking-wide flex flex-col items-center gap-2">
              <p>© {new Date().getFullYear()} All India Mututal Transfer Portal. All rights reserved. This platform is domain-neutral.</p>
              <div className="flex items-center gap-2 opacity-60">
                <span>Developed by</span>
                <span className="text-primary-700">Priyanka DigiTech Services</span>
                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                <a href="mailto:priyankadigitechservices@gmail.com" className="hover:text-primary-700 transition-colors lowercase">priyankadigitechservices@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import { useState, useEffect } from 'react';
import { searchTransfers } from '../services/transferService';
import { useMasterData } from '../context/MasterDataContext';
import TransferCard from '../components/TransferCard';
import { Search, MapPin, Building, Filter, X, Building2, GitMerge, Loader2 } from 'lucide-react';

const SearchTransfersPage = () => {
  const [searchMode, setSearchMode] = useState('any'); // 'any' or 'route'
  const [params, setParams] = useState({ 
    sector: 'Railway', 
    zone: '', 
    division: '', 
    station: '',
    desiredZone: '',
    desiredDivision: '',
    desiredStation: ''
  });
  
  const { 
    loading: masterLoading, 
    regionData, 
    sectors, 
    getZoneList 
  } = useMasterData();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleSearch(null, true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => {
      const newParams = { ...prev, [name]: value };
      if (name === 'sector') {
        newParams.zone = ''; newParams.division = ''; newParams.station = '';
        newParams.desiredZone = ''; newParams.desiredDivision = ''; newParams.desiredStation = '';
      }
      if (name === 'zone') { newParams.division = ''; newParams.station = ''; }
      if (name === 'division') { newParams.station = ''; }
      if (name === 'desiredZone') { newParams.desiredDivision = ''; newParams.desiredStation = ''; }
      if (name === 'desiredDivision') { newParams.desiredStation = ''; }
      return newParams;
    });
  };

  const clearFilters = () => {
    setParams({ sector: 'Railway', zone: '', division: '', station: '', desiredZone: '', desiredDivision: '', desiredStation: '' });
    setHasSearched(false);
    handleSearch(null, true);
  };

  const handleSearch = async (e, initial = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // If mode is 'any', we shouldn't send desired location params
      const searchPayload = { ...params };
      if (searchMode === 'any') {
        searchPayload.desiredZone = '';
        searchPayload.desiredDivision = '';
        searchPayload.desiredStation = '';
      }
      
      const data = await searchTransfers(searchPayload);
      setResults(data.transfers || data);
      if (!initial) setHasSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transfer requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change search mode
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setParams({ sector: params.sector, zone: '', division: '', station: '', desiredZone: '', desiredDivision: '', desiredStation: '' });
  };

  const hasActiveFilters = params.sector !== 'Railway' || params.zone || params.division || params.station || params.desiredZone || params.desiredDivision || params.desiredStation;

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder-slate-400 transition-all appearance-none";

  // Dependent list generation
  const zoneList = getZoneList();
  
  // From Lists
  const currentDivList = params.zone && regionData[params.zone] ? Object.keys(regionData[params.zone].divisions) : [];
  const currentStationList = params.zone && params.division && regionData[params.zone]?.divisions[params.division] ? regionData[params.zone].divisions[params.division] : [];

  // To Lists
  const desiredDivList = params.desiredZone && regionData[params.desiredZone] ? Object.keys(regionData[params.desiredZone].divisions) : [];
  const desiredStationList = params.desiredZone && params.desiredDivision && regionData[params.desiredZone]?.divisions[params.desiredDivision] ? regionData[params.desiredZone].divisions[params.desiredDivision] : [];

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Search Directory</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Browse active transfer requests across India</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-72 shrink-0">
          <button 
            onClick={() => handleModeChange('any')}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${searchMode === 'any' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            In Location
          </button>
          <button 
            onClick={() => handleModeChange('route')}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${searchMode === 'route' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Route Match
          </button>
        </div>
      </div>

      {/* Top Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary-50 text-primary-700 p-1.5 rounded-lg">
              <Filter className="h-4 w-4" />
            </div>
            <h2 className="text-base font-black text-slate-900">Filters</h2>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <form onSubmit={handleSearch}>
          {masterLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 text-primary-400 animate-spin" /></div>
          ) : (
            <div className="flex flex-col gap-5">
              
              {/* Top Control Row */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-56 shrink-0">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    <Building2 className="h-3 w-3" /> Working Sector
                  </label>
                  <div className="relative">
                    <select name="sector" value={params.sector} onChange={handleChange} className={inputClass} style={{ paddingRight: '2rem' }}>
                      <option value="">All Sectors</option>
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>
                {/* Railway Sector Filters (Advanced) */}
                {params.sector === 'Railway' && searchMode === 'any' && (
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-11 gap-4 items-end">
                    <div className="lg:col-span-3">
                      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <MapPin className="h-3 w-3 text-red-500" /> Current Region
                      </label>
                      <div className="relative">
                        <select name="zone" value={params.zone} onChange={handleChange} className={`${inputClass} px-3 truncate`} title={params.zone}>
                          <option value="">Any Region</option>
                          {zoneList.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                      </div>
                    </div>
                    <div className="lg:col-span-3">
                      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <Building className="h-3 w-3 text-red-400" /> Current Division
                      </label>
                      <div className="relative">
                        <select name="division" value={params.division} onChange={handleChange} disabled={!params.zone} className={`${inputClass} px-3 truncate disabled:opacity-50 disabled:bg-slate-100`} title={params.division}>
                          <option value="">Any Division</option>
                          {currentDivList.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                      </div>
                    </div>
                    <div className="lg:col-span-4">
                      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <MapPin className="h-3 w-3 text-red-400" /> Current Station
                      </label>
                      <div className="relative">
                        <select name="station" value={params.station} onChange={handleChange} disabled={!params.division} className={`${inputClass} px-3 truncate disabled:opacity-50 disabled:bg-slate-100`} title={params.station}>
                          <option value="">Any Station</option>
                          {currentStationList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                      </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <button
                        type="submit" disabled={loading}
                        className="w-full h-10 flex justify-center items-center gap-2 bg-primary-900 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] text-sm md:mt-6 lg:mt-0"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Search</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Non-Railway Sector Notice */}
                {params.sector && params.sector !== 'Railway' && (
                  <div className="flex-1 w-full flex flex-col md:flex-row gap-4 items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="flex-1 text-xs font-bold text-slate-500 italic text-center md:text-left">
                      Advanced location filters for {params.sector} are coming soon. Basic search by sector is active.
                    </p>
                    <button
                      type="submit" disabled={loading}
                      className="px-6 h-10 flex justify-center items-center gap-2 bg-primary-900 hover:bg-slate-900 text-white font-black rounded-lg shadow-md transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Search {params.sector}</>}
                    </button>
                  </div>
                )}
                
                {!params.sector && (
                  <div className="shrink-0 flex items-end">
                    <button
                      type="submit" disabled={loading}
                      className="h-10 px-8 flex justify-center items-center gap-2 bg-primary-900 hover:bg-slate-900 text-white font-black rounded-xl shadow-md transition-all active:scale-[0.98] text-xs uppercase tracking-wider"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Search All</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Route Mode Location Rows */}
              {params.sector === 'Railway' && searchMode === 'route' && (
                <div className="flex flex-col gap-8 w-full">
                  {/* FROM Row */}
                  <div className="flex justify-start w-full animate-slide-right">
                    <div className="w-full lg:w-[88%] bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col gap-4 relative shadow-sm">
                      <div className="absolute -top-3 left-6 bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md">FROM</div>
                      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.6fr] gap-5">
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Region</label>
                          <div className="relative">
                            <select name="zone" value={params.zone} onChange={handleChange} className={`${inputClass} px-3 truncate`} title={params.zone}><option value="">Any Region</option>{zoneList.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}</select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Division</label>
                          <div className="relative">
                            <select name="division" value={params.division} onChange={handleChange} disabled={!params.zone} className={`${inputClass} px-3 truncate disabled:opacity-50`} title={params.division}><option value="">Any Division</option>{currentDivList.map(d => <option key={d} value={d}>{d}</option>)}</select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Station</label>
                          <div className="relative">
                            <select name="station" value={params.station} onChange={handleChange} disabled={!params.division} className={`${inputClass} px-3 truncate disabled:opacity-50`} title={params.station}><option value="">Any Station</option>{currentStationList.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TO Row */}
                  <div className="flex justify-end w-full animate-slide-left">
                    <div className="w-full lg:w-[88%] bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 flex flex-col gap-4 relative shadow-sm">
                      <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md">TO</div>
                      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.6fr] gap-5">
                        <div className="space-y-1.5 text-left">
                          <label className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Region</label>
                          <div className="relative">
                            <select name="desiredZone" value={params.desiredZone} onChange={handleChange} className={`${inputClass} px-3 truncate`} title={params.desiredZone}><option value="">Any Region</option>{zoneList.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}</select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Division</label>
                          <div className="relative">
                            <select name="desiredDivision" value={params.desiredDivision} onChange={handleChange} disabled={!params.desiredZone} className={`${inputClass} px-3 truncate disabled:opacity-50 border-white/60`} title={params.desiredDivision}><option value="">Any Division</option>{desiredDivList.map(d => <option key={d} value={d}>{d}</option>)}</select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Station</label>
                          <div className="relative">
                            <select name="desiredStation" value={params.desiredStation} onChange={handleChange} disabled={!params.desiredDivision} className={`${inputClass} px-3 truncate disabled:opacity-50 border-white/60`} title={params.desiredStation}><option value="">Any Station</option>{desiredStationList.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex justify-end w-full mt-2">
                    <button
                      type="submit" disabled={loading}
                      className="w-full md:w-56 h-12 flex justify-center items-center gap-2 bg-primary-900 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-primary-900/10 transition-all active:scale-[0.98] text-sm uppercase tracking-wider"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-5 w-5" /> Search Transfers</>}
                    </button>
                  </div>
                </div>
              )}



            </div>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium mb-6">{error}</div>
        )}

        {!loading && results.length > 0 && (
          <div className="mb-6 bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
            <span className="text-sm font-bold text-slate-700">
              {results.length} active request{results.length !== 1 && 's'}
              {hasSearched && ' matching your filters'}
            </span>
            {hasSearched && (
              <button onClick={clearFilters} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-700 transition-colors">
                Clear & Show all
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-20 text-center">
            <div className="animate-spin h-10 w-10 border-2 border-primary-100 border-t-primary-600 rounded-full mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">Fetching transfer requests...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-16 text-center">
            <div className="h-20 w-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-9 w-9 text-slate-200" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">No Requests Found</h2>
            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              {hasSearched
                ? "No transfer requests match your filters. Try adjusting your search criteria."
                : "There are currently no active transfer requests in the system."}
            </p>
            {hasSearched && (
              <button onClick={clearFilters} className="mt-8 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm rounded-xl transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((req) => (
              <TransferCard key={req._id} transfer={req} isOwnRequest={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTransfersPage;

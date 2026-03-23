import { useState, useEffect } from 'react';
import { searchTransfers } from '../services/transferService';
import { useMasterData } from '../context/MasterDataContext';
import TransferCard from '../components/TransferCard';
import SearchableSelect from '../components/SearchableSelect';
import { Search, MapPin, Building, Filter, X, Building2, Loader2, Layers } from 'lucide-react';

const SearchTransfersPage = () => {
  const [searchMode, setSearchMode] = useState('any'); // 'any' or 'route'
  const [params, setParams] = useState({
    sector: 'Railway',
    zone: '',
    division: '',
    workstationType: '',
    station: '',
    desiredZone: '',
    desiredDivision: '',
    desiredWorkstationType: '',
    desiredStation: ''
  });

  const {
    loading: masterLoading,
    regionData,
    sectors,
    workstationTypes,
    getZoneList
  } = useMasterData();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleSearch(null, true);
  }, []);

  // Generic field setter — cascades dependent fields
  const setField = (name, value) => {
    setParams(prev => {
      const n = { ...prev, [name]: value };
      if (name === 'sector') {
        n.zone = ''; n.division = ''; n.workstationType = ''; n.station = '';
        n.desiredZone = ''; n.desiredDivision = ''; n.desiredWorkstationType = ''; n.desiredStation = '';
      }
      if (name === 'zone')                  { n.division = ''; n.workstationType = ''; n.station = ''; }
      if (name === 'division')              { n.workstationType = ''; n.station = ''; }
      if (name === 'workstationType')       { n.station = ''; }
      if (name === 'desiredZone')           { n.desiredDivision = ''; n.desiredWorkstationType = ''; n.desiredStation = ''; }
      if (name === 'desiredDivision')       { n.desiredWorkstationType = ''; n.desiredStation = ''; }
      if (name === 'desiredWorkstationType'){ n.desiredStation = ''; }
      return n;
    });
  };

  // Keep legacy handleChange for the Sector <select> (uses optgroups, stays native)
  const handleSectorChange = (e) => setField('sector', e.target.value);

  const clearFilters = () => {
    setParams({ sector: 'Railway', zone: '', division: '', workstationType: '', station: '', desiredZone: '', desiredDivision: '', desiredWorkstationType: '', desiredStation: '' });
    setHasSearched(false);
    handleSearch(null, true);
  };

  const handleSearch = async (e, initial = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const searchPayload = { ...params };
      if (searchMode === 'any') {
        searchPayload.desiredZone = '';
        searchPayload.desiredDivision = '';
        searchPayload.desiredWorkstationType = '';
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

  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setParams(prev => ({ sector: prev.sector, zone: '', division: '', workstationType: '', station: '', desiredZone: '', desiredDivision: '', desiredWorkstationType: '', desiredStation: '' }));
  };

  const hasActiveFilters = params.sector !== 'Railway' || params.zone || params.division || params.workstationType || params.station || params.desiredZone || params.desiredDivision || params.desiredWorkstationType || params.desiredStation;

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder-slate-400 transition-all appearance-none";

  // Option lists
  const zoneList = getZoneList();
  const wstList = workstationTypes || [];

  const currentDivList     = params.zone && regionData[params.zone] ? Object.keys(regionData[params.zone].divisions) : [];
  const currentLocationList = params.zone && params.division && params.workstationType
    && regionData[params.zone]?.divisions[params.division]?.[params.workstationType]
    ? regionData[params.zone].divisions[params.division][params.workstationType]
    : [];

  const desiredDivList      = params.desiredZone && regionData[params.desiredZone] ? Object.keys(regionData[params.desiredZone].divisions) : [];
  const desiredLocationList = params.desiredZone && params.desiredDivision && params.desiredWorkstationType
    && regionData[params.desiredZone]?.divisions[params.desiredDivision]?.[params.desiredWorkstationType]
    ? regionData[params.desiredZone].divisions[params.desiredDivision][params.desiredWorkstationType]
    : [];

  // Shared label style
  const lbl = (color = 'text-slate-500') =>
    `flex items-center gap-1.5 text-[10px] font-black ${color} uppercase tracking-widest mb-1.5`;

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

      {/* Filter Panel */}
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
            <div className="flex flex-col gap-4">

              {/* Row 1 — Working Sector alone */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-56 shrink-0">
                  <label className={lbl()}>
                    <Building2 className="h-3 w-3" /> Working Sector
                  </label>
                  {/* Sector uses native select due to optgroups */}
                  <SearchableSelect
                    id="sector"
                    value={params.sector}
                    onChange={(val) => setField('sector', val)}
                    placeholder="All Sectors"
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

                {/* Non-Railway notice */}
                {params.sector && params.sector !== 'Railway' && (
                  <div className="flex-1 flex flex-col md:flex-row gap-4 items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="flex-1 text-xs font-bold text-slate-500 italic text-center md:text-left">
                      Advanced location filters for {params.sector} are coming soon. Basic search by sector is active.
                    </p>
                    <button type="submit" disabled={loading} className="px-6 h-10 flex justify-center items-center gap-2 bg-gradient-to-br from-primary-600 to-primary-900 text-white font-black rounded-xl shadow-lg shadow-primary-900/20 transition-all active:scale-[0.97] text-[10px] uppercase tracking-wider">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Search {params.sector}</>}
                    </button>
                  </div>
                )}

                {!params.sector && (
                  <div className="shrink-0 flex items-end">
                    <button type="submit" disabled={loading} className="h-10 px-8 flex justify-center items-center gap-2 bg-gradient-to-br from-primary-600 to-primary-900 text-white font-black rounded-xl shadow-lg transition-all active:scale-[0.97] text-xs uppercase tracking-wider">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Search All</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Row 2 — In Location filters (Railway only) */}
              {params.sector === 'Railway' && searchMode === 'any' && (
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div>
                      <label className={lbl()}><MapPin className="h-3 w-3 text-red-500" /> Region</label>
                      <SearchableSelect
                        value={params.zone}
                        onChange={v => setField('zone', v)}
                        options={zoneList}
                        placeholder="Any Region"
                      />
                    </div>
                    <div>
                      <label className={lbl()}><Building className="h-3 w-3 text-red-400" /> Division</label>
                      <SearchableSelect
                        value={params.division}
                        onChange={v => setField('division', v)}
                        options={currentDivList}
                        placeholder="Any Division"
                        disabled={!params.zone}
                      />
                    </div>
                    <div>
                      <label className={lbl('text-violet-500')}><Layers className="h-3 w-3" /> Workstation Type</label>
                      <SearchableSelect
                        value={params.workstationType}
                        onChange={v => setField('workstationType', v)}
                        options={wstList}
                        placeholder="Any Type"
                        disabled={!params.division}
                      />
                    </div>
                    <div>
                      <label className={lbl()}><MapPin className="h-3 w-3 text-red-400" /> Location</label>
                      <SearchableSelect
                        value={params.station}
                        onChange={v => setField('station', v)}
                        options={currentLocationList}
                        placeholder="Any Location"
                        disabled={!params.workstationType}
                      />
                    </div>
                  </div>

                  {/* Search Button below row */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-56 h-12 flex justify-center items-center gap-3 rounded-2xl font-black text-sm transition-all active:scale-[0.97] bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-900/10 disabled:opacity-60"
                    >
                      {loading
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : <><Search className="h-5 w-5" /><span className="tracking-widest uppercase">Search Requests</span></>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Route Match rows */}
              {params.sector === 'Railway' && searchMode === 'route' && (
                <div className="flex flex-col gap-8 w-full">
                  {/* FROM */}
                  <div className="flex justify-start w-full animate-slide-right">
                    <div className="w-full lg:w-[90%] bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col gap-4 relative shadow-sm">
                      <div className="absolute -top-3 left-6 bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md">FROM</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="space-y-1.5">
                          <label className={lbl()}>Region</label>
                          <SearchableSelect value={params.zone} onChange={v => setField('zone', v)} options={zoneList} placeholder="Any Region" />
                        </div>
                        <div className="space-y-1.5">
                          <label className={lbl()}>Division</label>
                          <SearchableSelect value={params.division} onChange={v => setField('division', v)} options={currentDivList} placeholder="Any Division" disabled={!params.zone} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={lbl('text-violet-500')}><Layers className="h-3 w-3" />Workstation Type</label>
                          <SearchableSelect value={params.workstationType} onChange={v => setField('workstationType', v)} options={wstList} placeholder="Any Type" disabled={!params.division} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={lbl()}>Location</label>
                          <SearchableSelect value={params.station} onChange={v => setField('station', v)} options={currentLocationList} placeholder="Any Location" disabled={!params.workstationType} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TO */}
                  <div className="flex justify-end w-full animate-slide-left">
                    <div className="w-full lg:w-[90%] bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 flex flex-col gap-4 relative shadow-sm">
                      <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md">TO</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="space-y-1.5">
                          <label className={lbl('text-emerald-600')}>Region</label>
                          <SearchableSelect value={params.desiredZone} onChange={v => setField('desiredZone', v)} options={zoneList} placeholder="Any Region" />
                        </div>
                        <div className="space-y-1.5">
                          <label className={lbl('text-emerald-600')}>Division</label>
                          <SearchableSelect value={params.desiredDivision} onChange={v => setField('desiredDivision', v)} options={desiredDivList} placeholder="Any Division" disabled={!params.desiredZone} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={lbl('text-violet-500')}><Layers className="h-3 w-3" />Workstation Type</label>
                          <SearchableSelect value={params.desiredWorkstationType} onChange={v => setField('desiredWorkstationType', v)} options={wstList} placeholder="Any Type" disabled={!params.desiredDivision} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={lbl('text-emerald-600')}>Location</label>
                          <SearchableSelect value={params.desiredStation} onChange={v => setField('desiredStation', v)} options={desiredLocationList} placeholder="Any Location" disabled={!params.desiredWorkstationType} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end w-full mt-2">
                    <button
                      type="submit" disabled={loading}
                      className="w-full md:w-56 h-12 flex justify-center items-center gap-2 bg-gradient-to-br from-primary-600 to-primary-900 hover:from-primary-500 hover:to-primary-800 text-white font-black rounded-2xl shadow-xl shadow-primary-900/20 transition-all active:scale-[0.97] text-sm uppercase tracking-wider"
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
              <TransferCard key={req._id} transfer={req} isOwnRequest={false} isPublic={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTransfersPage;

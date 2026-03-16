import { MapPin, Building, ArrowRight, Activity, CalendarDays, Trash2, Briefcase, Info, PencilLine, Phone, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMasterData } from '../context/MasterDataContext';

const TransferCard = ({ transfer, onDelete, isOwnRequest = false, isPublic = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { regionData } = useMasterData();
  const isAuthenticated = !!user;
  const isMatched = transfer.status === 'matched';
  const statusColor = isMatched ? 'bg-green-100 text-green-800 border-green-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  const zoneCode = (z) => z && regionData?.[z]?.code ? `(${regionData[z].code})` : '';
  
  const getCategoryColor = (cat) => {
    switch (cat?.toUpperCase()) {
      case 'GENERAL': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SC': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ST': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'OBC': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'EWS': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };
  
  // Public-specific layout
  // Public-specific layout (Modern SaaS Style)
  if (isPublic) {
    return (
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden flex flex-col h-full hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group">
        <div className="p-6 flex-1">
          {/* Header: Profile Info */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                 <Building className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {transfer.userId?.name || 'Employee'}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1 px-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md text-slate-500">
                    {transfer.sector || 'Railway'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md text-primary-600">
                    {transfer.designation}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 bg-[#05D38A] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#05D38A]/20">
                Active
              </span>
              {transfer.category && (
                <span className={`px-2.5 py-1 border rounded-xl text-[10px] font-black uppercase tracking-tight ${getCategoryColor(transfer.category)}`}>
                  {transfer.category}
                </span>
              )}
            </div>
          </div>

          {/* Route: FROM -> TO with Improved Connector */}
          <div className="bg-[#F8FAFC] rounded-[1.5rem] p-5 border border-slate-100 relative mb-6">
            <div className="flex items-center justify-between gap-4 relative">
              {/* From */}
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">From</span>
                <div className="flex items-start gap-2.5">
                  <div className="bg-red-50 p-1.5 rounded-lg shrink-0">
                    <MapPin className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-lg leading-none truncate">{transfer.currentStation}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight truncate">{transfer.currentZone} {zoneCode(transfer.currentZone)}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Arrow Connector */}
              <div className="flex flex-col items-center justify-center shrink-0 w-12">
                <div className="h-px w-full bg-slate-200 absolute z-0 hidden sm:block"></div>
                <div className="bg-white p-2 rounded-xl shadow-md border border-slate-100 z-10 flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-700">
                  <ArrowRight className="h-4 w-4 text-primary-600 stroke-[2.5]" />
                </div>
              </div>

              {/* To */}
              <div className="flex-1 min-w-0 text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 px-1">
                  To {transfer.desiredLocations?.length > 1 && <span className="text-primary-600 bg-primary-50 px-1 rounded">+{transfer.desiredLocations.length - 1} More</span>}
                </span>
                <div className="flex items-start justify-end gap-2.5">
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-lg leading-none truncate">
                      {transfer.desiredLocations?.[0]?.station || transfer.desiredStation}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight truncate">
                      {transfer.desiredLocations?.[0]?.zone || transfer.desiredZone} {zoneCode(transfer.desiredLocations?.[0]?.zone || transfer.desiredZone)}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-1.5 rounded-lg shrink-0">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags: Dept and Sal */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            {transfer.department && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-primary-100/50">
                <Briefcase className="h-3 w-3" />
                {transfer.department}
              </div>
            )}
            {transfer.basicPay && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black tracking-wider border border-slate-100">
                <span className="text-slate-400 font-black">₹</span>
                <span className="blur-[3px] select-none opacity-50">XX,XXX</span>
              </div>
            )}
          </div>

          {/* Contact Placeholder */}
          <div className="flex items-center gap-3 py-3 px-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-slate-300" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-28 bg-slate-200/60 rounded-full blur-[2px]"></div>
              <div className="h-2 w-16 bg-slate-200/40 rounded-full blur-[2px]"></div>
            </div>
          </div>
        </div>

        {/* Improved Action Button */}
        <div className="p-6 pt-0 mt-auto">
          {!isAuthenticated ? (
            <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#002B5B] dark:bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xl shadow-[#002B5B]/10 hover:shadow-[#002B5B]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 group/btn"
            >
              <Lock className="h-4 w-4 text-emerald-400 transition-transform group-hover/btn:rotate-12" />
              Sign in to Contact
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/transfers/search')} // or navigate to match/details page
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary-600/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 group/btn"
            >
              <Phone className="h-4 w-4 text-primary-200 transition-transform group-hover/btn:rotate-12" />
              View Contact Details
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-shadow duration-300 hover:shadow-md`}>
      {/* Header section */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor} uppercase tracking-wider`}>
              {transfer.status}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(transfer.createdAt), 'MMM dd, yyyy')}
            </span>
            {transfer.category && (
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getCategoryColor(transfer.category)}`}>
                {transfer.category}
              </span>
            )}
          </div>
          
          {!isOwnRequest && transfer.userId && (
            <div className="mt-2 text-sm font-medium text-slate-900 flex flex-col">
              <span className="text-base">{transfer.userId.name}</span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <span className="text-xs text-slate-500 font-bold px-1.5 py-0.5 bg-slate-100 rounded">
                  {transfer.sector || 'Railway'}
                </span>
                <span className="text-xs text-primary-600 font-bold px-1.5 py-0.5 bg-primary-50 rounded">
                  {transfer.department}
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  {transfer.designation}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {isOwnRequest && !isMatched && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => navigate(`/transfers/edit/${transfer._id}`)}
              className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors"
              title="Edit Request"
            >
              <PencilLine className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(transfer._id)}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
              title="Cancel Request"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Body section */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between relative">
          
          {/* Current Location */}
          <div className="flex-1 w-full p-4 rounded-lg bg-slate-50 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Posting</h4>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 text-lg">
                  {transfer.currentStation}
                </p>
                <div className="flex flex-col text-xs text-slate-500 mt-1 gap-0.5">
                  {isOwnRequest && (
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-primary-600 font-bold px-2 py-0.5 bg-primary-50 rounded border border-primary-100">{transfer.department}</span>
                      <span className="text-slate-700 font-semibold">{transfer.designation}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" /> {transfer.currentDivision + ' Div'}
                  </span>
                  <span>{transfer.currentZone + ' Zone'} {zoneCode(transfer.currentZone)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex flex-col items-center justify-center shrink-0">
            <div className="h-0.5 w-12 bg-slate-200"></div>
            <ArrowRight className="h-6 w-6 text-slate-400 bg-white absolute z-10" />
          </div>

          <div className="flex md:hidden flex-col items-center justify-center h-8 w-full">
            <div className="w-0.5 h-full bg-slate-200"></div>
          </div>

          {/* Desired Location(s) */}
          <div className="flex-1 w-full p-4 rounded-lg bg-blue-50/50 border border-blue-100/50">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Desired Postings</h4>
            <div className="space-y-4">
              {transfer.desiredLocations && transfer.desiredLocations.length > 0 ? (
                transfer.desiredLocations.map((loc, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="shrink-0 flex flex-col items-center">
                      <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-[8px] font-black text-blue-500 bg-blue-100 px-1 rounded mt-1">P{loc.priority || idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-base leading-tight">
                        {loc.station}
                      </p>
                      <div className="flex flex-col text-[10px] text-slate-500 mt-0.5 gap-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="h-2.5 w-2.5" /> {loc.division + ' Div'}
                        </span>
                        <span>{loc.zone + ' Zone'} {zoneCode(loc.zone)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">
                      {transfer.desiredStation}
                    </p>
                    <div className="flex flex-col text-xs text-slate-500 mt-1 gap-0.5">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" /> {transfer.desiredDivision + ' Div'}
                      </span>
                      <span>{transfer.desiredZone + ' Zone'} {zoneCode(transfer.desiredZone)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
        
        {/* Additional Details Footer */}
        {(transfer.modeOfSelection || transfer.subDepartment) && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4">
            {transfer.subDepartment && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{transfer.subDepartment}</span>
              </div>
            )}
            {transfer.modeOfSelection && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <span>Selected via: </span>
                <span className="font-bold text-slate-700">{transfer.modeOfSelection}</span>
              </div>
            )}
            {transfer.payLevel && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{transfer.payLevel}</span>
              </div>
            )}
            {transfer.basicPay && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
                <span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Basic Pay</span>
                <span className="font-extrabold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100">₹ {Number(transfer.basicPay).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferCard;

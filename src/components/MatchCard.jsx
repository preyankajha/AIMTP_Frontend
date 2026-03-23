import { useState } from 'react';
import { Phone, MapPin, ArrowRight, Eye, CheckCircle2, MessageCircle, Mail } from 'lucide-react';
import { revealContact } from '../services/matchService';

const MatchCard = ({ match, onContactRevealed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleReveal = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await revealContact(match.matchId);
      if (onContactRevealed) onContactRevealed(match.matchId, result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reveal contact');
    } finally {
      setLoading(false);
    }
  };

  const matchPercent = match.matchPercent || 95;
  const isExcellent = matchPercent >= 90;

  return (
    <div className="bg-white rounded-[1.75rem] border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
      {/* Match Banner */}
      <div className={`px-5 py-3 flex justify-between items-center ${isExcellent ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-blue-50 border-b border-blue-100'}`}>
        <div className={`flex items-center gap-1.5 font-bold text-xs ${isExcellent ? 'text-emerald-700' : 'text-blue-700'}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{matchPercent}% Match</span>
        </div>
        <span className={`px-2.5 py-1 text-white text-[9px] font-black uppercase tracking-widest rounded-full ${isExcellent ? 'bg-emerald-500' : 'bg-blue-500'}`}>
          {isExcellent ? 'Excellent Match' : 'Good Match'}
        </span>
      </div>

      <div className="p-5 flex-1">
        {/* Partner Info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-xl bg-primary-50 border border-primary-100/50 flex items-center justify-center shrink-0">
            <span className="text-primary-700 font-black text-sm">
              {match.partner.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight group-hover:text-primary-700 transition-colors">
              {match.partner.name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {match.partner.designation || 'Employee'}
            </p>
          </div>
        </div>

        {/* Route Visualization */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Their Current</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <p className="font-black text-slate-800 text-xs truncate">{match.partnerRequest.currentStation}</p>
              </div>
            </div>
            <div className="bg-white h-7 w-7 rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
              <ArrowRight className="h-3 w-3 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Desired Station</span>
              <div className="flex items-center justify-end gap-1.5">
                <p className="font-black text-slate-800 text-xs truncate">{match.myRequest.desiredStation}</p>
                <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              </div>
            </div>
          </div>
        </div>
        {/* Remarks Section */}
        {match.partnerRequest?.workplaceRemark && (
          <div className="mt-4 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 flex gap-2.5">
            <div className="shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-amber-500/80 mb-0.5">Working Condition Note</p>
              <p className="text-xs text-amber-900/80 font-medium italic">{match.partnerRequest.workplaceRemark}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="px-5 pb-5">
        {error && <p className="text-[10px] text-red-500 mb-2 text-center font-bold">{error}</p>}
        
        {match.contactRevealed ? (
          <div className="space-y-3">
             <div className="flex gap-2">
                <a 
                  href={`tel:${match.partner.mobile}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black active:scale-95 transition-all text-xs"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
                {match.partner.whatsapp && (
                  <a 
                    href={`https://wa.me/${match.partner.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-black rounded-xl hover:bg-[#128C7E] active:scale-95 transition-all text-xs"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
             </div>
             {match.partner.email && (
                <a 
                  href={`mailto:${match.partner.email}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-xs"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {match.partner.email}
                </a>
             )}
          </div>
        ) : (
          <button
            onClick={handleReveal}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-900 text-white font-black rounded-xl shadow-lg shadow-primary-900/10 hover:bg-slate-900 active:scale-95 transition-all text-sm disabled:opacity-60"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <><Eye className="h-4 w-4" /> Reveal Contact</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;

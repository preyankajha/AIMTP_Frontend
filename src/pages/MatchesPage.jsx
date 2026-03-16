import { useState, useEffect } from 'react';
import { getMyMatches } from '../services/matchService';
import MatchCard from '../components/MatchCard';
import { Users, Search, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MatchesPage = () => {
  const { isProfileComplete } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    try {
      const data = await getMyMatches();
      setMatches(data.matches);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactRevealed = (matchId, mobile) => {
    setMatches((prev) =>
      prev.map((m) => m.matchId === matchId ? { ...m, contactRevealed: true, partner: { ...m.partner, mobile } } : m)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-100 border-t-primary-600"></div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-fade-in">
        <div className="h-20 w-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-amber-100">
          <AlertCircle className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Complete Your Profile First</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-10 text-lg">
          To ensure accurate matchmaking, we need your current working details. Please update your profile in settings to unlock your mutual matches.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 bg-primary-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary-900/10 hover:bg-slate-900 transition-all active:scale-95"
        >
          <Settings className="h-5 w-5" />
          Update Profile Now
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mutual Matches</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Employees with transfer requests that perfectly match yours
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Matches</p>
            <p className="text-lg font-black text-slate-900 leading-tight">{matches.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-16 text-center max-w-2xl mx-auto">
          <div className="relative inline-flex mb-6">
            <div className="h-20 w-20 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center relative z-10">
              <Search className="h-9 w-9 text-slate-200" />
            </div>
            <div className="absolute inset-0 bg-slate-100 rounded-full animate-ping opacity-30"></div>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No Matches Yet</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-sm mx-auto">
            Our engine watches 24/7 — you'll be matched instantly when a compatible request is submitted.
          </p>
          <Link
            to="/transfers/create"
            className="inline-flex items-center gap-2 bg-primary-900 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-primary-900/20 hover:bg-slate-900 transition-all active:scale-95"
          >
            Post Transfer Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.matchId} match={match} onContactRevealed={handleContactRevealed} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;

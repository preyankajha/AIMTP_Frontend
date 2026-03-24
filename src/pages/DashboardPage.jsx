import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMyMatches } from '../services/matchService';
import { getMyTransfers, getPublicTransfers } from '../services/transferService';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  CheckCircle2, 
  Plus, 
  Users, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Search,
  UserCheck,
  Settings,
  MapPin
} from 'lucide-react';
import MatchCard from '../components/MatchCard';
import TransferCard from '../components/TransferCard';

const DashboardPage = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [suggestedTransfers, setSuggestedTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isProfileComplete) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [matchData, transferData, publicData] = await Promise.all([
          getMyMatches(),
          getMyTransfers(),
          getPublicTransfers()
        ]);
        const filtered = publicData.transfers.filter(t => t.userId?._id !== user?._id);
        
        // Profile and Desired Location based suggestions
        let suggestions = filtered;
        
        // 1. Get all desired locations from user's active transfers
        const myActiveTransfers = transferData.transfers?.filter(t => t.status === 'active') || [];
        const myDesiredLocs = myActiveTransfers.flatMap(t => t.desiredLocations || []);

        if (myDesiredLocs.length > 0) {
          // 2. Filter public transfers whose "source" (current posting) matches any of our "desired" locations
          const relevantSuggestions = filtered.filter(t => 
            myDesiredLocs.some(dl => 
              (dl.zone && t.currentZone === dl.zone) &&
              (!dl.division || t.currentDivision === dl.division) &&
              (!dl.station || t.currentStation === dl.station)
            )
          );
          
          if (relevantSuggestions.length > 0) {
            suggestions = relevantSuggestions;
          } else {
            // Fallback to department/designation matches if no direct location matches found
            suggestions = filtered.filter(t => 
              (user?.department && t.department === user.department) ||
              (user?.designation && t.designation === user.designation)
            );
          }
        } else if (user?.department || user?.currentZone || user?.designation) {
          // Fallback for users without active transfer requests
          suggestions = filtered.filter(t => 
            (user.department && t.department === user.department) ||
            (user.currentZone && t.currentZone === user.currentZone) ||
            (user.designation && t.designation === user.designation)
          );
        }

        setMatches(matchData.matches);
        setTransfers(transferData.transfers);
        setSuggestedTransfers(suggestions.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id, isProfileComplete]);

  const handleContactRevealed = (matchId, mobile) => {
    setMatches((prevMatches) => 
      prevMatches.map((m) => {
        if (m.matchId === matchId) {
          return {
            ...m,
            contactRevealed: true,
            partner: { ...m.partner, mobile }
          };
        }
        return m;
      })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-100 border-t-primary-600"></div>
      </div>
    );
  }

  const activeTransfersCount = transfers.filter(t => t.status === 'active').length;
  const matchedTransfersCount = transfers.filter(t => t.status === 'matched').length;

  const stats = [
    { label: 'Active Requests', value: activeTransfersCount, icon: FileText, color: 'blue', sub: 'Currently searching' },
    { label: 'Total Matches', value: matches.length, icon: Users, color: 'emerald', sub: 'Potential partners found' },
    { label: 'Completed Swaps', value: matchedTransfersCount, icon: CheckCircle2, color: 'blue', sub: 'Successfully matched' },
    { label: 'Total Requests', value: transfers.length, icon: TrendingUp, color: 'slate', sub: 'Your lifetime requests' },
  ];

  // Derive activities from real data
  const activities = [
    ...matches.map(m => ({ 
      type: 'match', 
      title: 'New match found', 
      detail: `${m.partner.name} (${m.matchPercent || 95}% match)`, 
      date: new Date(m.createdAt || new Date()),
      icon: Users, 
      color: 'emerald' 
    })),
    ...transfers.map(t => ({ 
      type: 'update', 
      title: 'Request Created', 
      detail: `${t.desiredStation} (${t.currentZone})`, 
      date: new Date(t.createdAt || new Date()),
      icon: Clock, 
      color: 'blue' 
    }))
  ].sort((a, b) => b.date - a.date).slice(0, 4);

  const quickActions = [
    { label: 'Post New Transfer Request', path: '/transfers/create', icon: Plus },
    { label: 'Search Transfer Partners', path: '/transfers/search', icon: Search },
    { label: 'Update Profile', path: '/profile', icon: UserCheck },
  ];

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-1">
            Real-time overview of your transfer activity
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/transfers/search')}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Search className="h-4 w-4" />
            Search Transfers
          </button>
          <button 
            onClick={() => navigate('/transfers/create')}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-primary-900/10 hover:bg-slate-900 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Post New Request
          </button>
        </div>
      </div>

      {!isProfileComplete && (
        <div className="mb-10 p-8 rounded-[2rem] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl shadow-amber-900/5 flex flex-col md:flex-row items-center gap-8 animate-pulse-subtle">
          <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-md border border-amber-100 shrink-0">
            <UserCheck className="h-10 w-10 text-amber-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Complete Your Working Profile</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
              To unlock transfer requests, view match percentages, and get suggested partners, you must first complete your professional information in settings.
            </p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="px-8 py-4 bg-primary-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-900/20 hover:bg-slate-900 transition-all active:scale-95 whitespace-nowrap flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Go to Settings
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-primary-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">
                  {stat.value}
                </h4>
              </div>
              <div className={`p-2.5 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl border border-${stat.color}-100/50`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Recent Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Matches</h2>
            <Link to="/matches/my" className="text-primary-600 font-bold text-xs hover:underline flex items-center gap-1 group">
              View All <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">No matches found yet</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                We're constantly looking for employees who want to swap with you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.slice(0, 2).map((match) => (
                <MatchCard key={match.matchId} match={match} onContactRevealed={handleContactRevealed} />
              ))}
            </div>
          )}
        </div>

        {/* Side Panel: Activity & Actions */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-6">Recent Activity</h2>
            {activities.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`h-9 w-9 bg-${act.color}-50 text-${act.color}-600 rounded-full flex items-center justify-center shrink-0 border border-${act.color}-100/50`}>
                      <act.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate leading-snug">{act.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5 whitespace-normal">{act.detail}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                        {formatDistanceToNow(act.date, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>



        </div>
      </div>

      {/* Suggested Transfers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Suggested Transfers</h2>
            <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest py-0.5 px-2 rounded-lg shadow-emerald-500/20 shadow-lg">New</span>
          </div>
          <Link to="/transfers/search" className="text-primary-600 font-bold text-xs hover:underline flex items-center gap-1 group">
            Find More <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedTransfers.map((transfer) => (
            <TransferCard key={transfer._id} transfer={transfer} isPublic={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

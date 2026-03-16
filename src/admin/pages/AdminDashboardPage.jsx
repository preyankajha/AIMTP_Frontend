import { useState, useEffect } from 'react';
import { getStats, getRecentActivity } from '../services/adminService';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import { Users, Repeat, Network, Activity } from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          getStats(),
          getRecentActivity()
        ]);
        setStats(statsData);
        setFeed(activityData.feed);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-100 border-t-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Platform performance metrics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600"
          trend={stats.newUsersToday}
          trendLabel="today"
        />
        <StatCard 
          title="Active Users Today" 
          value={stats.activeUsersToday} 
          icon={Activity} 
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard 
          title="Total Transfers" 
          value={stats.totalTransfers} 
          icon={Repeat} 
          colorClass="bg-indigo-100 text-indigo-600"
          trend={stats.newTransfersToday}
          trendLabel="today"
        />
        <StatCard 
          title="Total Hits" 
          value={stats.totalHits || 0} 
          icon={Activity} 
          colorClass="bg-red-100 text-red-600"
          trend={stats.hitsToday || 0}
          trendLabel="today"
        />
        <StatCard 
          title="Total Matches" 
          value={stats.totalMatches} 
          icon={Network} 
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Placeholder for Analytics Overview) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Quick Analytics</h2>
            <button className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline">View Full Report</button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 min-h-[300px]">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium text-sm">See detailed graphs in the Analytics section</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[500px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Recent Activity</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ActivityFeed feed={feed} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Temp import for the placeholder
import { BarChart3 } from 'lucide-react';

export default AdminDashboardPage;

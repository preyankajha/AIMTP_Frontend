import { useState, useEffect } from 'react';
import { getAnalytics, getVisitorLogs } from '../services/adminService';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const result = await getAnalytics(timeRange);
        setData(result);
      } catch (error) {
        console.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-red-600"></div>
      </div>
    );
  }

  // Calculate totals for summary cards from timeSeries data
  const totalUsers = data.timeSeries.reduce((sum, item) => sum + item.users, 0);
  const totalTransfers = data.timeSeries.reduce((sum, item) => sum + item.transfers, 0);
  const totalMatches = data.timeSeries.reduce((sum, item) => sum + item.matches, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Traffic & Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Detailed growth and activity metrics</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">New Users (Selected Range)</p>
          <p className="text-3xl font-black text-slate-800">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">New Requests</p>
          <p className="text-3xl font-black text-slate-800">{totalTransfers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Matches Formed</p>
          <p className="text-3xl font-black text-slate-800">{totalMatches.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Growth Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Platform Growth Overlay</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} minTickGap={30} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Area type="monotone" dataKey="users" name="New Users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="transfers" name="Transfer Requests" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTransfers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matches Over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Matches Created Over Time</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="matches" name="Matches" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Top Transfer Zones</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.zoneDistribution} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" name="Requests" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visitor Logs Section */}
      <VisitorLogsSection />
    </div>
  );
};

const VisitorLogsSection = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getVisitorLogs({ page, limit: 10 });
        setLogs(data.logs);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch visitor logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Recent Visitor Hits</h2>
          <p className="text-sm text-slate-500 font-medium">Capture system, device, and location details</p>
        </div>
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Total Hits: {total.toLocaleString()}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User / IP</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device & OS</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Path</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">Loading visitor logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No activity recorded yet</td>
              </tr>
            ) : logs.map(log => (
              <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700 text-sm">{log.user ? log.user.name : 'Guest'}</div>
                  <div className="text-[10px] font-medium text-slate-400">{log.ip}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    {log.device.browser}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">{log.device.os} • {log.device.deviceType}</div>
                </td>
                <td className="px-6 py-4">
                  {log.location ? (
                    <>
                      <div className="text-sm font-bold text-slate-600">{log.location.city}, {log.location.country}</div>
                      <div className="text-[10px] font-medium text-slate-400">{log.location.region}</div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-300 italic">Unknown</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-tight">
                    {log.method}
                  </span>
                  <span className="ml-2 text-sm font-medium text-slate-500">{log.path}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-bold text-slate-600">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-[10px] font-medium text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button 
          disabled={page <= 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-red-600 disabled:opacity-30 transition-colors"
        >
          Previous
        </button>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page} of {Math.ceil(total / 10)}</span>
        <button 
          disabled={page >= Math.ceil(total / 10)}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-red-600 disabled:opacity-30 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

import { useState, useEffect } from 'react';
import { getMatches, deleteMatch } from '../services/adminService';
import AdminTable from '../components/AdminTable';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminMatchesPage = () => {
  const [data, setData] = useState({ matches: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const result = await getMatches({ page });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this match?')) return;
    try {
      await deleteMatch(id);
      fetchMatches();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      header: 'Matched Users',
      accessor: 'users',
      render: (row) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black border border-blue-200">A</span>
            <span className="font-semibold text-slate-800 text-sm">{row.userA?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black border border-emerald-200">B</span>
            <span className="font-semibold text-slate-800 text-sm">{row.userB?.name || 'Unknown'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Match Details',
      accessor: 'details',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 w-32">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Route A (to B)</span>
            <span className="truncate">{row.requestA?.currentStation}</span>
            <span className="truncate">{row.requestB?.currentStation}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 w-32">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Route B (to A)</span>
            <span className="truncate">{row.requestB?.currentStation}</span>
            <span className="truncate">{row.requestA?.currentStation}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border bg-purple-50 text-purple-600 border-purple-200">
          {row.status}
        </span>
      )
    },
    {
      header: 'Match Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-slate-600 font-medium text-xs">{format(new Date(row.createdAt), 'MMM dd, yyyy HH:mm')}</span>
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleDelete(row._id)}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200/50 transition-colors"
            title="Delete Match"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <AdminTable 
        title="Mutual Matches"
        subtitle={`Total system matches: ${data.total}`}
        columns={columns}
        data={data.matches}
        loading={loading}
        page={data.page}
        pages={data.pages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminMatchesPage;

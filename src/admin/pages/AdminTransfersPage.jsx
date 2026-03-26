import { useState, useEffect } from 'react';
import { getTransfers, deleteTransfer } from '../services/adminService';
import AdminTable from '../components/AdminTable';
import { Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const TransferRouteCell = ({ row }) => {
  const [expanded, setExpanded] = useState(false);
  const primaryDest = row.desiredLocations?.[0] || {};
  const extraDestinations = row.desiredLocations?.slice(1) || [];
  const hasMore = extraDestinations.length > 0;

  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <span className="text-red-500 whitespace-nowrap">{row.currentStation || row.currentDivision}</span>
        <span className="text-slate-300 font-light">→</span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 whitespace-nowrap">{primaryDest.station || primaryDest.division || 'Any'}</span>
          {hasMore && (
            <button 
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border transition-all cursor-pointer select-none active:scale-90 ${
                expanded 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                  : 'bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200'
              }`}
            >
              {expanded ? 'CLOSE LIST' : `+${extraDestinations.length} MORE`}
            </button>
          )}
        </div>
      </div>
      
      {!expanded ? (
        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tighter">
          <span>{row.currentZone}</span>
          <span className="text-slate-200 font-black">/</span>
          <span>{primaryDest.zone || 'ANY'}</span>
        </p>
      ) : (
        <div className="mt-2 space-y-2 border-l-2 border-emerald-500/30 pl-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">Full Preference List</p>
          {row.desiredLocations.map((loc, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-black px-1 rounded ${i === 0 ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>P{i+1}</span>
                <span className="text-[11px] font-black text-slate-800">{loc.station || loc.location}</span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-6">
                {loc.zone} <span className="opacity-30 mx-1">•</span> {loc.division}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminTransfersPage = () => {
  const [data, setData] = useState({ transfers: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const result = await getTransfers({ page, status: statusFilter });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [page, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this transfer request?')) return;
    try {
      await deleteTransfer(id);
      fetchTransfers();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'user',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.userId?.name || 'Unknown'}</p>
          <p className="text-xs text-slate-500 font-medium">{row.userId?.mobile || 'No mobile'}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
          row.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
          row.status === 'matched' ? 'bg-purple-50 text-purple-600 border-purple-200' : 
          'bg-slate-50 text-slate-600 border-slate-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Route (From → To)',
      accessor: 'route',
      render: (row) => <TransferRouteCell row={row} />
    },
    {
      header: 'Posted On',
      accessor: 'createdAt',
      render: (row) => <span className="text-slate-600 font-medium text-xs">{format(new Date(row.createdAt), 'MMM dd, yyyy')}</span>
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 border border-orange-200/50 transition-colors"
            title="Flag as Suspicious (Demo)"
            onClick={() => alert('Flagging functionality to be implemented')}
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDelete(row._id)}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200/50 transition-colors"
            title="Delete Request"
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
        title="Transfer Requests"
        subtitle={`Total requests: ${data.total}`}
        columns={columns}
        data={data.transfers}
        loading={loading}
        page={data.page}
        pages={data.pages}
        onPageChange={setPage}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium text-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="matched">Matched</option>
          </select>
        }
      />
    </div>
  );
};

export default AdminTransfersPage;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTransfers, updateTransferStatus } from '../services/transferService';
import TransferCard from '../components/TransferCard';
import { FileText, Plus, X, Loader2 } from 'lucide-react';

const MyTransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTransfers(); }, []);

  const [statusModal, setStatusModal] = useState({ isOpen: false, transferId: null, currentStatus: '', newStatus: '', remark: '', loading: false });

  const fetchTransfers = async () => {
    try {
      const data = await getMyTransfers();
      setTransfers(data.transfers);
    } catch (err) {
      setError('Failed to fetch transfers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (transfer) => {
    setStatusModal({ 
      isOpen: true, 
      transferId: transfer._id, 
      currentStatus: transfer.status,
      newStatus: transfer.status, 
      remark: transfer.statusRemark || '', 
      loading: false 
    });
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModal.newStatus || statusModal.newStatus === statusModal.currentStatus) {
      alert('Please select a new status.');
      return;
    }
    if (!statusModal.remark || statusModal.remark.trim() === '') {
      alert('A remark is required.');
      return;
    }

    try {
      setStatusModal(prev => ({ ...prev, loading: true }));
      const updatedData = await updateTransferStatus(statusModal.transferId, { 
        status: statusModal.newStatus, 
        statusRemark: statusModal.remark 
      });
      
      setTransfers(transfers.map(t => t._id === statusModal.transferId ? updatedData.transfer : t));
      setStatusModal({ isOpen: false, transferId: null, currentStatus: '', newStatus: '', remark: '', loading: false });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status. Please try again.');
      setStatusModal(prev => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-100 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Transfer Requests</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Manage your active and matched transfer applications
          </p>
        </div>
        <Link
          to="/transfers/create"
          className="flex items-center gap-2 bg-primary-900 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-primary-900/20 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add New Request
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {transfers.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-16 text-center flex flex-col items-center max-w-2xl mx-auto">
          <div className="h-20 w-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-9 w-9 text-slate-200" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No Requests Found</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-sm">
            You haven't submitted any transfer requests yet. You can create multiple requests for different routes or departments.
          </p>
          <Link
            to="/transfers/create"
            className="inline-flex items-center gap-2 bg-primary-900 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-primary-900/20 hover:bg-slate-900 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Your First Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transfers.map((transfer) => (
            <TransferCard
              key={transfer._id}
              transfer={transfer}
              onChangeStatus={() => openStatusModal(transfer)}
              isOwnRequest={true}
            />
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !statusModal.loading && setStatusModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-fade-in border border-slate-100">
            <button 
              onClick={() => !statusModal.loading && setStatusModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Update Request Status</h2>
            <p className="text-xs font-bold text-slate-500 mb-6 tracking-wide">Change the visibility and state of this request.</p>

            <form onSubmit={handleStatusUpdate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">New Status</label>
                <select 
                  value={statusModal.newStatus}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl focus:ring-primary-500 focus:border-primary-500 block px-4 py-3 appearance-none shadow-sm"
                  required
                >
                  <option value="active" disabled={statusModal.currentStatus === 'active'}>Active</option>
                  <option value="inactive" disabled={statusModal.currentStatus === 'inactive'}>Inactive / Disabled</option>
                  <option value="partner_found" disabled={statusModal.currentStatus === 'partner_found'}>Found Mutual Partner</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Remark / Reason</label>
                <textarea 
                  value={statusModal.remark}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, remark: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl focus:ring-primary-500 focus:border-primary-500 block px-4 py-3 placeholder-slate-400 resize-none h-24 shadow-sm"
                  placeholder="E.g. Temporarily pausing search, or found a match externally..."
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={statusModal.loading}
                className="w-full flex items-center justify-center gap-2 text-white bg-primary-900 hover:bg-slate-900 px-5 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-primary-900/10 disabled:opacity-50 mt-2"
              >
                {statusModal.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Status Change'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTransfersPage;

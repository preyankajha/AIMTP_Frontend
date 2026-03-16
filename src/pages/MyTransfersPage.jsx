import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTransfers, deleteTransfer } from '../services/transferService';
import TransferCard from '../components/TransferCard';
import { FileText, Plus } from 'lucide-react';

const MyTransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTransfers(); }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this transfer request?')) {
      try {
        await deleteTransfer(id);
        setTransfers(transfers.filter((t) => t._id !== id));
      } catch (err) {
        alert('Failed to delete transfer request. Please try again.');
      }
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
              onDelete={handleDelete}
              isOwnRequest={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTransfersPage;

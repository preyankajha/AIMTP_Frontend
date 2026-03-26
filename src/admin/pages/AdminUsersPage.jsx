import { useState, useEffect } from 'react';
import { getUsers, suspendUser, deleteUser } from '../services/adminService';
import AdminTable from '../components/AdminTable';
import { ShieldAlert, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import UserDetailsModal from '../components/UserDetailsModal';

const AdminUsersPage = () => {
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Profile modal state
  const [userProfileModal, setUserProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const openUserProfile = (userId) => {
    setSelectedUserId(userId);
    setUserProfileModal(true);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers({ page, search });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSuspend = async (id, isCurrentlyVerified) => {
    if (!window.confirm(`Are you sure you want to ${isCurrentlyVerified ? 'unverify' : 'verify'} this user?`)) return;
    try {
      await suspendUser(id);
      fetchUsers(); // Refresh
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: This will permanently delete the user and ALL their transfer requests and matches. Proceed?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const formatTotalTime = (seconds) => {
    if (!seconds) return '< 1m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const columns = [
    {
      header: 'User details',
      accessor: 'name',
      render: (row) => (
        <div 
          className="cursor-pointer group/userinfo"
          onClick={() => openUserProfile(row._id)}
        >
          <p className="font-bold text-slate-800 group-hover/userinfo:text-primary-600 transition-colors">{row.name}</p>
          <p className="text-xs text-slate-500 font-medium group-hover/userinfo:text-slate-600">{row.email}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 group-hover/userinfo:text-slate-500">{row.mobile}</p>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${row.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {row.role}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'verified',
      render: (row) => row.verified ? (
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-max border border-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5" /> Active
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-max border border-orange-100">
          <XCircle className="h-3.5 w-3.5" /> Unverified
        </span>
      )
    },
    {
      header: 'Registered',
      accessor: 'createdAt',
      render: (row) => <span className="text-slate-600 font-medium">{format(new Date(row.createdAt), 'MMM dd, yyyy h:mm a')}</span>
    },
    {
      header: 'Activity',
      accessor: 'loginCount',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">{row.loginCount || 0} logins</span>
          <span className="text-[10px] font-medium text-slate-500 mt-0.5">{formatTotalTime(row.totalTimeSpent)} active</span>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {row.role !== 'admin' && (
            <>
              <button 
                onClick={() => handleSuspend(row._id, row.verified)}
                className={`p-2 rounded-lg transition-colors border ${row.verified ? 'text-orange-600 hover:bg-orange-50 border-orange-200/50' : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200/50'}`}
                title={row.verified ? "Unverify User" : "Verify User"}
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(row._id)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200/50 transition-colors"
                title="Delete User"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <AdminTable 
        title="User Management"
        subtitle={`Total registered users: ${data.total}`}
        columns={columns}
        data={data.users}
        loading={loading}
        page={data.page}
        pages={data.pages}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search name, email, or mobile..."
      />

      <UserDetailsModal 
        isOpen={userProfileModal}
        onClose={() => setUserProfileModal(false)}
        userId={selectedUserId}
      />
    </div>
  );
};

export default AdminUsersPage;

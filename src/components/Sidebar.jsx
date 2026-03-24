import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  Search,
  List,
  Users,
  Bell,
  Settings,
  HelpCircle,
  Plus,
  Repeat,
  LogOut,
  ShieldCheck,
  Database
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';

const Sidebar = ({ closeSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);


  const handleLogout = () => {
    setShowConfirm(false);
    logout();
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Search Transfers', path: '/transfers/search', icon: Search },
    { name: 'My Requests', path: '/transfers/my', icon: List },
    { name: 'My Matches', path: '/matches/my', icon: Users },
    { name: 'Data Integrity', path: '/suggest-data', icon: Database },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Support', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col w-64 bg-primary-950 text-white h-screen sticky top-0 overflow-hidden border-r border-white/5">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-2.5">
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-lg overflow-hidden shrink-0">
          <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain" />
        </div>
        <span className="text-xl font-black tracking-tight">All India Mutual Transfer Portal</span>
      </div>

      {/* Action Button */}
      <div className="px-4 mb-8">
        <button
          onClick={() => navigate('/transfers/create')}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 text-sm"
        >
          <Plus className="h-5 w-5" />
          New Transfer Request
        </button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="mb-4 px-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Main Menu</h3>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-white/10 text-white font-bold border border-white/5'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0 opacity-80" />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}

          {/* Admin Toggle - Highlighted Segment */}
          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all border ${isActive
                    ? 'bg-red-500/20 text-red-400 font-bold border-red-500/30'
                    : 'bg-red-500/5 text-red-400/70 border-red-500/10 hover:bg-red-500/10 hover:text-red-400'
                  }`
                }
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span className="text-sm">Go to Admin Panel</span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 mt-auto border-t border-white/5 bg-primary-900/20">
        <nav className="space-y-1 mb-6">
          {bottomItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0 opacity-80" />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-red-300 hover:bg-red-500/10 hover:text-red-400 font-bold"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0 opacity-80" />
            <span className="text-sm">Logout</span>
          </button>
        </nav>

        {/* User Card */}
        <div className="bg-primary-900/40 rounded-[1.25rem] p-3 border border-white/5 flex items-center gap-3 group relative cursor-pointer" onClick={() => {navigate('/profile'); if(closeSidebar) closeSidebar();}}>
          <UserAvatar 
            user={user} 
            className="h-10 w-10 border-2 border-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate leading-tight">{user?.name}</p>
            <p className="text-[10px] font-medium text-white/40 truncate mt-0.5 capitalize">{user?.role || 'Employee'}</p>
          </div>
        </div>
      </div>

      {showConfirm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl text-center animate-fade-in-up">
            <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
               <LogOut className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Are you sure want to logout?</h3>
            <p className="text-[11px] text-slate-500 font-medium mb-6">You will need to sign in again to access dashboard choices and requests.</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setShowConfirm(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Cancel</button>
              <button type="button" onClick={handleLogout} className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-500/10 transition-all">Yes, Logout</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Sidebar;

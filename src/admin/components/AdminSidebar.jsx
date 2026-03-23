import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Repeat,
  Network,
  BarChart3,
  Settings,
  Database,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ closeSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileImg, setProfileImg] = useState(null);

  useEffect(() => {
    if (user?.profileImage) {
      const url = user.profileImage.startsWith('http') 
        ? user.profileImage 
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`;
      setProfileImg(url);
    } else {
      setProfileImg(null);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Transfers', path: '/admin/transfers', icon: Repeat },
    { name: 'Matches', path: '/admin/matches', icon: Network },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Master Data', path: '/admin/master-data', icon: Database },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 overflow-hidden border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-2.5">
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-lg overflow-hidden shrink-0">
          <img src="/LOGO.png" alt="AITP Logo" className="h-[85%] w-[85%] object-contain grayscale opacity-90 mix-blend-multiply filter contrast-125 hover:grayscale-0 transition-all" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-white leading-tight">Admin<span className="text-red-500">Panel</span></span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Mutual Transfers</span>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-4 mt-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              onClick={closeSidebar ? () => closeSidebar() : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-red-500/10 text-red-400 font-bold border border-red-500/20'
                  : 'hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className={`h-5 w-5 shrink-0 ${window.location.pathname === item.path ? 'text-red-400' : 'opacity-70'}`} />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 mt-auto border-t border-slate-800 bg-slate-950/30">
        {/* User Card */}
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center font-black text-sm border-2 border-slate-800 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)] overflow-hidden">
            {profileImg ? (
              <img src={profileImg} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5 uppercase tracking-wider">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, Bell, Search as SearchIcon, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import { getNotifications } from '../services/notificationService';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await getNotifications();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    if (user) {
      fetchCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 w-full h-18 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search Bar - Mockup Style */}
            <div className="hidden sm:flex items-center bg-slate-100/80 rounded-xl px-3.5 py-2 w-full max-w-sm group focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 border border-transparent focus-within:border-primary-100 transition-all">
              <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search transfers..." 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-400 w-full ml-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/notifications"
              className="text-slate-400 hover:text-primary-600 relative p-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95 group"
            >
              <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link 
              to="/profile"
              className="shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <UserAvatar user={user} className="h-8 w-8 rounded-lg" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative p-6 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

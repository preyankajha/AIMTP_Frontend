import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, Bell, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <AdminSidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full h-18 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
          
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 focus:outline-none p-2 -ml-2 rounded-xl border border-transparent hover:border-slate-200 transition-all active:scale-95"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-black tracking-tight text-slate-800">Admin Console</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-red-500 relative p-2 rounded-xl hover:bg-red-50 transition-all active:scale-95 group">
              <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </button>
            <Link 
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-black transition-all border border-red-100 shadow-sm active:scale-95"
            >
              <LayoutDashboard className="h-4 w-4" />
              Exit to User Portal
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

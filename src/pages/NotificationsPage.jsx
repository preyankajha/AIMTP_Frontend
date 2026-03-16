import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCheck, 
  Info, 
  Users, 
  PartyPopper, 
  Clock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'match': return <Users className="h-5 w-5" />;
      case 'success': return <PartyPopper className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'match': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
      case 'success': return 'bg-blue-50 text-blue-600 border-blue-100/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-100/50';
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 font-semibold text-sm mt-1">
            Stay updated with your transfer matches and account activity
          </p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-100 border-t-primary-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="h-10 w-10 text-slate-200" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No notifications yet</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
            When you get matches or account updates, they'll appear here.
          </p>
          <button
            onClick={() => navigate('/transfers/create')}
            className="bg-primary-900 text-white px-8 py-3 rounded-xl font-black text-sm shadow-xl shadow-primary-900/20 hover:bg-slate-900 transition-all active:scale-95"
          >
            Create Transfer Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => {
                if (!notification.read) handleMarkAsRead(notification._id);
                if (notification.link) navigate(notification.link);
              }}
              className={`group relative flex items-start gap-5 p-6 rounded-[1.5rem] border transition-all cursor-pointer ${
                notification.read 
                ? 'bg-white border-slate-100' 
                : 'bg-white border-primary-500/20 shadow-lg shadow-primary-900/5 ring-1 ring-primary-500/5'
              }`}
            >
              {!notification.read && (
                <div className="absolute top-6 right-6 h-2 w-2 bg-primary-600 rounded-full"></div>
              )}
              
              <div className={`p-3 rounded-2xl border ${getColorClass(notification.type)}`}>
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-black tracking-tight leading-snug ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notification.title}
                  </h3>
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-3">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </div>
                  {notification.link && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-primary-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      View Details <ChevronRight className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

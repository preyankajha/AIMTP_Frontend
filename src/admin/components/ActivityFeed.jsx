import { formatDistanceToNow } from 'date-fns';
import { UserPlus, Repeat, Network } from 'lucide-react';

const ActivityFeed = ({ feed = [] }) => {
  if (feed.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 font-medium text-sm">
        No recent activity
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <UserPlus className="h-4 w-4 text-emerald-600" />;
      case 'transfer': return <Repeat className="h-4 w-4 text-blue-600" />;
      case 'match': return <Network className="h-4 w-4 text-purple-600" />;
      default: return <div className="h-2 w-2 rounded-full bg-slate-400" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'user': return 'bg-emerald-100/50 border-emerald-200';
      case 'transfer': return 'bg-blue-100/50 border-blue-200';
      case 'match': return 'bg-purple-100/50 border-purple-200';
      default: return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {feed.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full border flex items-center justify-center z-10 ${getBgColor(item.type)}`}>
              {getIcon(item.type)}
            </div>
            {index !== feed.length - 1 && (
              <div className="w-0.5 h-full bg-slate-100 absolute top-8 bottom-[-16px]"></div>
            )}
          </div>
          <div className="pb-4 pt-1 flex-1">
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {item.message}
            </p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;

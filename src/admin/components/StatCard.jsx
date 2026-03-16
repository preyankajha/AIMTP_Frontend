
const StatCard = ({ title, value, icon: Icon, colorClass, trend, trendLabel }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-xl shrink-0 ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 leading-tight">{value}</h3>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs font-bold ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'} px-1.5 py-0.5 rounded-md`}>
              {trend > 0 ? '+' : ''}{trend}
            </span>
            <span className="text-xs font-medium text-slate-400 truncate">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const AdminTable = ({ 
  title, 
  subtitle,
  columns, 
  data, 
  loading, 
  page, 
  pages, 
  onPageChange,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  actions
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm font-medium text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onSearchChange && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              />
            </div>
          )}
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-red-500"></div>
                  <p className="mt-2 text-sm font-medium text-slate-500">Loading data...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/80 transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 text-sm ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{pages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === pages}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;

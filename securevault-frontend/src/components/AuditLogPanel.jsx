import { useState, useEffect } from 'react';
import { auditApi } from '../api/audit';
import { Plus, Eye, Copy, Pencil, Share2, Trash2, ScrollText, AlertTriangle, Filter, LogIn, LogOut } from 'lucide-react';

const ACTION_FILTERS = [
  { value: '', label: 'All' },
  { value: 'CREATED', label: 'Created' },
  { value: 'VIEWED', label: 'Viewed' },
  { value: 'COPIED', label: 'Copied' },
  { value: 'MODIFIED', label: 'Modified' },
  { value: 'SHARED', label: 'Shared' },
  { value: 'DELETED', label: 'Deleted' },
  { value: 'PIN_FAILED', label: 'Failed PIN' },
  { value: 'SIGN_IN', label: 'Signed In' },
  { value: 'SIGN_OUT', label: 'Signed Out' },
];

export default function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditApi.getAll();
      setLogs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const map = {
      CREATED: 'badge-green',
      VIEWED: 'badge-gray',
      COPIED: 'badge-gray',
      MODIFIED: 'badge-yellow',
      SHARED: 'badge-yellow',
      DELETED: 'badge-red',
      PIN_FAILED: 'badge-red',
      SIGN_IN: 'badge-green',
      SIGN_OUT: 'badge-gray',
    };
    return map[action] || 'badge-gray';
  };

  const getActionIcon = (action) => {
    const IconMap = {
      CREATED: Plus,
      VIEWED: Eye,
      COPIED: Copy,
      MODIFIED: Pencil,
      SHARED: Share2,
      DELETED: Trash2,
      PIN_FAILED: AlertTriangle,
      SIGN_IN: LogIn,
      SIGN_OUT: LogOut,
    };
    return IconMap[action] || null;
  };

  const filteredLogs = actionFilter ? logs.filter((l) => l.action === actionFilter) : logs;

  if (loading) return <div className="text-center py-16 text-gray-500 dark:text-gray-400">Loading audit logs...</div>;

  if (error) {
    return (
      <div className="card text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
        <button onClick={fetchLogs} className="btn-outline text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h2>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field w-auto text-sm"
          >
            {ACTION_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="card text-center py-16">
          <ScrollText className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No audit logs yet</h2>
          <p className="text-gray-500 dark:text-gray-400">Actions on your vault items will appear here</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No logs match the selected filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const Icon = getActionIcon(log.action);
            const time = new Date(log.createdAt);
            return (
              <div key={log.id} className="card p-5 flex items-start gap-4 hover:shadow-xl transition-shadow duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  log.action === 'PIN_FAILED'
                    ? 'bg-red-100 dark:bg-red-500/10'
                    : 'bg-gray-100 dark:bg-gray-700/50'
                }`}>
                  {Icon && <Icon className={`w-5 h-5 ${log.action === 'PIN_FAILED' ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={getActionBadge(log.action)}>{log.action.replace('_', ' ')}</span>
                    {log.details && <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{log.details}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span>{time.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>{time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

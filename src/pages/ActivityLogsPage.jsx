import React, { useState, useEffect } from 'react';
import { History, Search, Clock } from 'lucide-react';
import { api } from '../services/api.js';

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.getActivityLogs();
        setLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    l =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.itemName && l.itemName.toLowerCase().includes(search.toLowerCase())) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" /> Vault Activity Audit Logs
          </h1>
          <p className="text-xs text-slate-500">Real-time history of created, modified, or moved items</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8 font-bold">Loading audit log stream...</p>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-indigo-600">{log.action}: </span>
                  <span className="font-bold text-slate-900">{log.itemName || 'Vault Item'} </span>
                  <span className="text-slate-500">({log.details})</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 text-center py-8">No activity log entries found.</p>
        )}
      </div>
    </div>
  );
};

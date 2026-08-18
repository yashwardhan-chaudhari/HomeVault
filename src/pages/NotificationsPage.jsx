import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShieldAlert } from 'lucide-react';
import { api } from '../services/api.js';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" /> Notifications & Warranty Reminders
          </h1>
          <p className="text-xs text-slate-500">System alerts, warranty expiration notices, and item updates</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8 font-bold">Loading alerts...</p>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border text-xs transition-colors flex items-start gap-3.5 ${
                n.isRead
                  ? 'border-slate-100 bg-slate-50'
                  : 'border-indigo-200 bg-indigo-50/50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                {n.type === 'warning' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 text-center py-8">No notifications or warranty alerts.</p>
        )}
      </div>
    </div>
  );
};

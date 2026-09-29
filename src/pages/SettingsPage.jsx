import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Sun, Moon, Database, Download, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const SettingsPage = () => {
  const { user, theme, toggleTheme, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({ fullName, email, avatarUrl });
      setUser(res.user);
      alert('Profile details saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const itemsRes = await api.getItems({ limit: 1000 });
      const backupData = {
        exportedAt: new Date().toISOString(),
        user: { fullName, email },
        items: itemsRes.items || []
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HomeVault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Backup export failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Account & App Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage your profile, appearance theme, and vault data backups</p>
      </div>

      {/* Profile Form Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Personal Profile
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </form>
      </div>

      {/* Theme Preference Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Appearance Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current theme: <strong className="capitalize">{theme}</strong></p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Switch Theme
        </button>
      </div>

      {/* Data Backup & Export Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Vault Data Export & Security
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Download a complete JSON backup of your stored belongings, warranty files, location coordinates, and audit history.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
          >
            <Download className="w-4 h-4" /> Export JSON Vault Backup
          </button>
        </div>
      </div>
    </div>
  );
};

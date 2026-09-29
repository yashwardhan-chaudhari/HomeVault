import React from 'react';
import { LayoutDashboard, Package, MapPin, BarChart2, History, Bell, Settings, Plus } from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  onOpenAddItem
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Item Vault', icon: Package },
    { id: 'map', label: 'Location Map', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'activity', label: 'Activity Logs', icon: History },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen transition-colors">
      <div>
        {/* Header / Brand */}
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm shadow-indigo-600/20">H</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                HomeVault
              </h1>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                Never Forget Anything
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action CTA */}
        <div className="p-4 space-y-2">
          <button
            onClick={onOpenAddItem}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Store New Item
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-600 text-white uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800">
        <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-sm">
          <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold mb-1">Storage Status</p>
          <p className="text-base font-extrabold">Smart Home Vault</p>
          <div className="w-full bg-indigo-400/50 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-white h-full w-[65%] rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

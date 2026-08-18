import React from 'react';
import { Package, Star, DollarSign, Sparkles, ShieldAlert, Clock, ArrowRight, Vault } from 'lucide-react';
import { ItemCard } from '../components/items/ItemCard.jsx';

export const DashboardPage = ({
  stats,
  activityLogs = [],
  onViewItem,
  onToggleFavorite,
  onDeleteItem,
  onOpenAddItem,
  onOpenAutoDetect,
  setActiveTab
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-indigo-600 text-white overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 border border-white/20 text-[11px] font-bold uppercase tracking-wider">
            <Vault className="w-3.5 h-3.5" /> Smart Home Inventory System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Never Forget Where You Kept Anything.
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Locate items in exact drawers, cupboards, and rooms. Scan new belongings with AI auto-detection, track warranties, and view map pins.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAutoDetect}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-extrabold text-xs shadow-md hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              Scan with AI Auto Detect
            </button>
            <button
              onClick={onOpenAddItem}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-bold text-xs border border-indigo-500/30 transition-all"
            >
              <Package className="w-4 h-4" />
              Add Item Manually
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Items</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {stats?.totalItems || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Stored in HomeVault</p>
        </div>

        <div
          onClick={() => setActiveTab('inventory')}
          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Favorites</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {stats?.totalFavorites || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Starred items</p>
        </div>

        <div
          onClick={() => setActiveTab('analytics')}
          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Vault Value</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{stats?.totalValue?.toLocaleString() || '0'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Total asset value</p>
        </div>

        <div
          onClick={() => setActiveTab('notifications')}
          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Warranties</span>
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {stats?.warrantyAlertsCount || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Expiring within 60 days</p>
        </div>
      </div>

      {/* Recently Added Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Recently Cataloged Items</h2>
            <p className="text-xs text-slate-500">Latest additions to your home vault</p>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            VIEW ALL ({stats?.totalItems || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.recentlyAdded.slice(0, 4).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onView={onViewItem}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-xs text-slate-500">No items added yet. Click "Add Item" to store your first belonging.</p>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Recent Activity Log</h3>
          </div>
          <button
            onClick={() => setActiveTab('activity')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Full Activity Audit Log
          </button>
        </div>

        <div className="space-y-3">
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start justify-between p-3 rounded-xl bg-slate-50 text-xs">
              <div>
                <span className="font-bold text-indigo-600">{log.action}: </span>
                <span className="font-semibold text-slate-800">{log.itemName || 'Item'} </span>
                <span className="text-slate-500">({log.details})</span>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

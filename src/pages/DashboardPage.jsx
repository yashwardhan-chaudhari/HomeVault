import React from 'react';
import { Package, Star, DollarSign, ShieldAlert, Clock, ArrowRight, Vault, Plus, ShieldCheck, AlertTriangle, XCircle, MapPin, Layers } from 'lucide-react';
import { ItemCard } from '../components/items/ItemCard.jsx';

export const DashboardPage = ({
  stats,
  activityLogs = [],
  onViewItem,
  onToggleFavorite,
  onDeleteItem,
  onOpenAddItem,
  setActiveTab
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white overflow-hidden shadow-xl shadow-indigo-600/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 border border-white/20 text-[11px] font-bold uppercase tracking-wider">
            <Vault className="w-3.5 h-3.5" /> Smart Home Inventory & Asset Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Never Forget Where You Kept Anything.
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Locate belongings in exact rooms, cupboards, and drawers. Track warranty lifecycles, asset value, and interactive location pins.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAddItem}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-extrabold text-xs shadow-md hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Store New Item
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <Package className="w-4 h-4" />
              Browse Item Vault
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <MapPin className="w-4 h-4" />
              View Map
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Questions Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Items</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats?.totalItems || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Recorded in your vault</p>
        </div>

        {/* Favorites */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Favorites</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats?.totalFavorites || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Starred essential items</p>
        </div>

        {/* Vault Value */}
        <div
          onClick={() => setActiveTab('analytics')}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Asset Value</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
            ₹{stats?.totalValue ? stats.totalValue.toLocaleString() : '0'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Recorded purchase value</p>
        </div>

        {/* Warranties Attention Card */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Needs Attention</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats?.warrantiesExpiring30DaysCount || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Expiring within 30 days</p>
        </div>
      </div>

      {/* 3.5 WARRANTY TRACKING BREAKDOWN BANNER */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Warranty Lifecycle Tracker
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Filter in Vault <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                {stats?.warrantiesActiveCount || 0}
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 font-medium">Items with Active Warranties</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-amber-800 dark:text-amber-200">
                {stats?.warrantiesExpiring30DaysCount || 0}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-medium">Expiring within 30 days</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-rose-800 dark:text-rose-200">
                {stats?.warrantiesExpiredCount || 0}
              </p>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 font-medium">Expired Warranties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Recently Cataloged Items</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest additions to your personal inventory</p>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">No items added yet. Click "+ Store New Item" to add your first belonging.</p>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Recent Vault Audit Activity</h3>
          </div>
          <button
            onClick={() => setActiveTab('activity')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Full Activity Audit Log
          </button>
        </div>

        <div className="space-y-3">
          {activityLogs && activityLogs.length > 0 ? (
            activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs">
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.action}: </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{log.itemName || 'Item'} </span>
                  <span className="text-slate-500 dark:text-slate-400">({log.details})</span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No recent activity recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

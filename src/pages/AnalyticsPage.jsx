import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { api } from '../services/api.js';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400 font-bold">Loading Vault Analytics...</div>;
  }

  const categoryData = data?.categoryDistribution || [];
  const roomData = data?.roomValueDistribution || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" /> Vault Analytics & Asset Insights
        </h1>
        <p className="text-xs text-slate-500">Financial distribution and inventory metrics</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Items Count</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.totalItems || 0}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Active stored inventory</span>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Vault Asset Value</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            ₹{data?.totalValue?.toLocaleString() || '0'}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Estimated replacement cost</span>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Warranty Alerts</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{data?.warrantyAlertsCount || 0}</p>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Items expiring soon</span>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600" /> Category Breakdown
          </h2>
          <div className="space-y-3">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-indigo-600">{cat.count} items (₹{cat.value?.toLocaleString()})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, (cat.count / (data?.totalItems || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Asset Value Distribution */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Room Asset Value Distribution
          </h2>
          <div className="space-y-3">
            {roomData.map((rm, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{rm.room}</span>
                  <span className="text-emerald-600">₹{rm.value?.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, (rm.value / (data?.totalValue || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

export const EmptyState = ({
  title = 'No Items Found',
  description = 'Your vault is clear or no items match the selected search filters.',
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-200 bg-white my-6 shadow-sm">
      <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-inner">
        {icon || <PackageOpen className="w-10 h-10" />}
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

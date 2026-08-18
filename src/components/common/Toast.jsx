import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ id, type, title, message, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl min-w-[300px] max-w-md">
      {icons[type]}
      <div className="flex-1">
        <h4 className="text-xs font-bold text-slate-900">{title}</h4>
        {message && <p className="text-[11px] text-slate-500 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { QrCode, Printer, X, Copy, Check, Sparkles, MapPin, Package } from 'lucide-react';

export const LocationQRModal = ({ isOpen, onClose, locationData, items = [] }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !locationData) return null;

  const room = locationData.room || 'General Storage';
  const cupboard = locationData.cupboard || '';
  const shelf = locationData.shelf || '';
  const container = locationData.container || '';

  const locationPath = [locationData.house || 'Home', room, cupboard, shelf, container]
    .filter(Boolean)
    .join(' › ');

  const qrPayload = JSON.stringify({
    app: 'HomeVault',
    type: 'location',
    room,
    cupboard,
    shelf,
    container,
    itemsCount: items.length,
    timestamp: new Date().toISOString()
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrPayload
  )}&bgcolor=ffffff&color=1e1b4b&margin=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(locationPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Physical Storage Label</h3>
              <p className="text-xs text-slate-500">Scan to view all items in this location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Label Badge Card */}
        <div
          id="printable-location-badge"
          className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white flex flex-col items-center text-center space-y-4"
        >
          {/* Brand & Room Heading */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-600 bg-indigo-100/70 px-2.5 py-1 rounded-full">
              HomeVault Storage Tag
            </span>
            <h4 className="text-lg font-black text-slate-900 flex items-center justify-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{room}</span>
            </h4>
            <p className="text-xs font-semibold text-slate-600 px-4 line-clamp-2">
              {locationPath}
            </p>
          </div>

          {/* QR Code */}
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
            <img
              src={qrImageUrl}
              alt={`QR code for ${room}`}
              className="w-44 h-44 object-contain rounded-xl"
              loading="lazy"
            />
          </div>

          {/* Stats Bar */}
          <div className="w-full flex items-center justify-around py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              <span>{items.length} Recorded Items</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 text-[11px] font-extrabold">Active QR Tag</span>
          </div>

          <p className="text-[10px] text-slate-400">
            Affix this label to storage bins, boxes, cabinets, or wardrobe shelves.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Path Copied!' : 'Copy Location'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};

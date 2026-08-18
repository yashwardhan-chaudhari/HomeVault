import React, { useState } from 'react';
import { X, Edit2, Trash2, MapPin, ShieldAlert, FileText, Star, Copy, Package, ExternalLink } from 'lucide-react';
import { LocationPickerMap } from '../common/LocationPickerMap.jsx';

export const ItemDetailModal = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLocation, setCopiedLocation] = useState(false);

  if (!isOpen || !item) return null;

  const isWarrantyExpiringSoon = () => {
    if (!item.warrantyDate) return { isExpiring: false, daysLeft: 0 };
    const wDate = new Date(item.warrantyDate);
    const now = new Date();
    const diffDays = Math.ceil((wDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return { isExpiring: diffDays >= 0 && diffDays <= 60, daysLeft: diffDays };
  };

  const warrantyStatus = isWarrantyExpiringSoon();

  const handleCopyLocation = () => {
    const parts = [
      item.location?.house,
      item.location?.room,
      item.location?.drawer,
      item.location?.container
    ].filter(Boolean);
    const locStr = parts.join(' > ');
    navigator.clipboard.writeText(locStr);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2000);
  };

  const handleOpenGoogleMaps = () => {
    let mapsUrl = '';
    if (item.location?.lat && item.location?.lng) {
      mapsUrl = `https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`;
    } else {
      const parts = [
        item.location?.exactPosition,
        item.location?.house,
        item.location?.room,
        item.location?.container
      ].filter(Boolean);
      const query = parts.length > 0 ? parts.join(', ') : item.name;
      mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
    }
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              {item.category || 'Item'}
            </span>
            {item.brand && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {item.brand}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-500 transition-colors"
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Item"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onDelete(item);
                onClose();
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Warranty Expiry Alert Banner */}
          {warrantyStatus.isExpiring && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-900">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">Warranty Expiring Soon</h4>
                  <p className="text-[11px] text-slate-700">
                    Warranty expires in <strong>{warrantyStatus.daysLeft} days</strong> ({item.warrantyDate}).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Gallery + Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Viewer */}
            <div className="space-y-3">
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[activeImageIdx] || item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Package className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs">No photos attached</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {item.images && item.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx ? 'border-indigo-600 scale-105' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Metadata Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  {item.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description || 'No additional description provided.'}
                </p>
              </div>

              {/* Location Breadcrumb Banner */}
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Exact Storage Path
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenGoogleMaps}
                      className="text-[10px] text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1 font-bold"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" /> Open Google Maps
                    </button>
                    <button
                      onClick={handleCopyLocation}
                      className="text-[10px] text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" /> {copiedLocation ? 'Copied!' : 'Copy Path'}
                    </button>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {[
                    item.location?.house || 'Home',
                    item.location?.room || 'Room',
                    item.location?.drawer,
                    item.location?.container
                  ].filter(Boolean).join(' › ')}
                </p>
                {item.location?.exactPosition && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                    "{item.location.exactPosition}"
                  </p>
                )}
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Price Value</span>
                  <p className="text-sm font-bold text-indigo-600 mt-0.5">
                    ₹{item.price?.toLocaleString() || '0.00'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Quantity</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {item.quantity || 1} units
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Condition</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {item.condition || 'New'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Pinned GPS Map Location
            </h3>
            <LocationPickerMap
              lat={item.location.lat}
              lng={item.location.lng}
              readOnly={true}
              popupText={`${item.name} (${item.location.room})`}
            />
          </div>

          {/* Additional Item Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Purchase & Serial Details */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Specifications & Purchase Info
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Serial Number</span>
                  <span className="font-mono font-bold text-slate-800">{item.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Purchase Date</span>
                  <span className="font-medium text-slate-800">{item.purchaseDate || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Warranty Expiry</span>
                  <span className="font-medium text-slate-800">{item.warrantyDate || 'None'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Views</span>
                  <span className="font-bold text-indigo-600">{item.viewedCount || 1} views</span>
                </div>
              </div>
            </div>

            {/* Documents & Manuals */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Attached Receipts & Manuals ({item.documents?.length || 0})
              </h4>
              {item.documents && item.documents.length > 0 ? (
                <div className="space-y-2">
                  {item.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-600 text-xs font-semibold text-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 hover:underline">Open</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No document attachments uploaded.</p>
              )}
            </div>
          </div>

          {/* Private Notes */}
          {item.notes && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Notes & Instructions
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

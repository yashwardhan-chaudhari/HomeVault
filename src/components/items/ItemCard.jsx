import React, { useState } from 'react';
import { Star, MapPin, Package, AlertCircle, Trash2, ExternalLink } from 'lucide-react';

export const ItemCard = ({ item, onView, onToggleFavorite, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityColors = {
    Critical: 'bg-rose-500 text-white border-rose-600',
    High: 'bg-orange-500 text-white border-orange-600',
    Medium: 'bg-indigo-600 text-white border-indigo-700',
    Low: 'bg-slate-400 text-white border-slate-500'
  };

  const isWarrantyExpiringSoon = () => {
    if (!item.warrantyDate) return false;
    const wDate = new Date(item.warrantyDate);
    const now = new Date();
    const diffDays = Math.ceil((wDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 60;
  };

  const thumbnail = item.images && item.images.length > 0 ? item.images[0] : null;

  const handleOpenGoogleMaps = (e) => {
    e.stopPropagation();
    let mapsUrl = '';
    if (item.location?.lat && item.location?.lng) {
      mapsUrl = `https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`;
    } else {
      const locParts = [
        item.location?.exactPosition,
        item.location?.house,
        item.location?.room,
        item.location?.container
      ].filter(Boolean);
      const query = locParts.length > 0 ? locParts.join(', ') : item.name;
      mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
    }
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        await onDelete(item, e);
      } catch (error) {
        console.error('Failed to delete item:', error);
        setIsDeleting(false);
      }
    }
  };

  const locationText = [
    item.location?.house,
    item.location?.room,
    item.location?.drawer || item.location?.container
  ].filter(Boolean).join(' › ') || item.location?.exactPosition || 'Location Saved';

  return (
    <div
      onClick={() => onView(item)}
      className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-slate-900 dark:text-slate-100"
    >
      <div>
        {/* Thumbnail Box */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
          {thumbnail && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <div className="animate-pulse text-slate-400 dark:text-slate-500">
                    <Package className="w-8 h-8 opacity-50" />
                  </div>
                </div>
              )}
              <img
                src={thumbnail}
                alt={item.name}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Package className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-[10px] uppercase tracking-widest font-bold">{item.category || 'Item'}</span>
            </div>
          )}

          {/* Action Buttons Top Right */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {/* Delete Button */}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm hover:scale-110 active:scale-95 transition-all ${
                  isDeleting
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-rose-500 hover:bg-rose-500 hover:text-white'
                }`}
                title={isDeleting ? 'Deleting...' : 'Delete Item'}
              >
                <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
              </button>
            )}

            {/* Favorite Star Button */}
            <button
              type="button"
              onClick={(e) => onToggleFavorite(item.id, e)}
              className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-amber-500 shadow-sm hover:scale-110 active:scale-95 transition-all"
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400 hover:text-amber-500'}`} />
            </button>
          </div>

          {/* Priority Pill */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm border ${priorityColors[item.priority || 'Low']}`}>
              {item.priority || 'Low'}
            </span>
            {isWarrantyExpiringSoon() && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-orange-500 text-white flex items-center gap-1 shadow-sm">
                <AlertCircle className="w-3 h-3" /> Warranty Soon
              </span>
            )}
          </div>
        </div>

        {/* Title & Brand */}
        <div className="mb-2">
          {item.brand && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {item.brand}
            </span>
          )}
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {item.description || 'No description provided.'}
          </p>
        </div>

        {/* Clickable Location Breadcrumb Pill redirecting to Google Maps */}
        <button
          type="button"
          onClick={handleOpenGoogleMaps}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-[11px] text-slate-700 dark:text-slate-200 font-semibold mb-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-left group/loc"
          title="Click to view location in Google Maps"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover/loc:scale-110 transition-transform" />
            <span className="truncate">{locationText}</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0 group-hover/loc:text-indigo-600 dark:group-hover/loc:text-indigo-400 transition-colors" />
        </button>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">+{item.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Price & Quantity */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
        <div>
          {item.price > 0 ? (
            <span className="text-indigo-600 dark:text-indigo-400">₹{item.price.toLocaleString()}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-normal">No price</span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Qty: <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity || 1}</span>
        </div>
      </div>
    </div>
  );
};


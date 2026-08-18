import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, ArrowUpDown, X, Star, Plus, Trash2, MapPin, ExternalLink } from 'lucide-react';
import { api } from '../services/api.js';
import { ItemCard } from '../components/items/ItemCard.jsx';
import { AutocompleteInput } from '../components/common/AutocompleteInput.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { CardSkeleton } from '../components/common/SkeletonLoader.jsx';

export const InventoryPage = ({
  onViewItem,
  onToggleFavorite,
  onDeleteItem,
  onOpenAddItem,
  searchQuery,
  setSearchQuery,
  suggestions = {},
  refreshTrigger = 0
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Filter States
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [room, setRoom] = useState('');
  const [house, setHouse] = useState('');
  const [condition, setCondition] = useState('');
  const [priority, setPriority] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.getItems({
        search: searchQuery,
        category,
        subcategory,
        brand,
        room,
        house,
        condition,
        priority,
        isFavorite,
        sortBy,
        sortOrder,
        page,
        limit: 16
      });

      setItems(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, category, subcategory, brand, room, house, condition, priority, isFavorite, sortBy, sortOrder, page, refreshTrigger]);

  const handleDelete = (item, e) => {
    if (e) e.stopPropagation();
    if (onDeleteItem) {
      onDeleteItem(item, e);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategory('');
    setSubcategory('');
    setBrand('');
    setRoom('');
    setHouse('');
    setCondition('');
    setPriority('');
    setIsFavorite(false);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || category || subcategory || brand || room || house || condition || priority || isFavorite
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Item Vault <span className="text-xs text-indigo-600 font-bold">({totalCount} items)</span>
          </h1>
          <p className="text-xs text-slate-500">Filter and search stored items with autocomplete</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Favorite Toggle Filter */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isFavorite
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : 'text-slate-400'}`} />
            Favorites
          </button>

          {/* Sort Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="warrantyDate">Warranty</option>
              <option value="priority">Priority</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-white rounded-lg text-slate-600"
              title="Toggle Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Grid/List Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/10 active:scale-95 transition-all ml-auto"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Autocomplete Search & Filters Toolbar */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <AutocompleteInput
            label="Category Filter"
            value={category}
            onChange={setCategory}
            suggestions={suggestions.categories || []}
            placeholder="Filter category..."
          />
          <AutocompleteInput
            label="Brand Filter"
            value={brand}
            onChange={setBrand}
            suggestions={suggestions.brands || []}
            placeholder="Filter brand..."
          />
          <AutocompleteInput
            label="Room Filter"
            value={room}
            onChange={setRoom}
            suggestions={suggestions.rooms || []}
            placeholder="Filter room..."
          />
          <AutocompleteInput
            label="Building / House"
            value={house}
            onChange={setHouse}
            suggestions={suggestions.houses || []}
            placeholder="Filter house..."
          />
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Search: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Category: {category}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('')} />
              </span>
            )}
            {brand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Brand: {brand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setBrand('')} />
              </span>
            )}
            {room && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Room: {room}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setRoom('')} />
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-[11px] text-rose-600 hover:underline font-bold ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Item Listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onView={onViewItem}
                onToggleFavorite={onToggleFavorite}
                onDelete={(itemObj, e) => handleDelete(itemObj, e)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const locText = [
                item.location?.house,
                item.location?.room,
                item.location?.container || item.location?.drawer
              ].filter(Boolean).join(' › ') || 'Location saved';

              const handleOpenMap = (e) => {
                e.stopPropagation();
                let url = '';
                if (item.location?.lat && item.location?.lng) {
                  url = `https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`;
                } else {
                  url = `https://www.google.com/maps?q=${encodeURIComponent(locText)}`;
                }
                window.open(url, '_blank', 'noopener,noreferrer');
              };

              return (
                <div
                  key={item.id}
                  onClick={() => onViewItem(item)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-sm gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                          {item.category?.slice(0, 2) || 'HV'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                      <button
                        type="button"
                        onClick={handleOpenMap}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium mt-0.5 flex items-center gap-1 truncate"
                        title="Open in Google Maps"
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                        <span className="truncate">{locText}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-bold border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm">₹{item.price || 0}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => onToggleFavorite(item.id, e)}
                        className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                        title="Toggle Favorite"
                      >
                        <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item, e);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState
          title="No Items Found"
          description="Try adjusting your autocomplete search filters or add a new item."
          actionLabel="Store New Item"
          onAction={onOpenAddItem}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white text-xs font-bold">
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIndigoIcon = L.divIcon({
  className: 'custom-leaflet-pin',
  html: `<div style="background-color: #4f46e5; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    async click(e) {
      if (onLocationSelect) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            onLocationSelect(lat, lng, data.display_name);
            return;
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
        }
        onLocationSelect(lat, lng);
      }
    }
  });
  return null;
};

const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, map.getZoom() || 14, { animate: true });
    }
  }, [center, map]);
  return null;
};

export const LocationPickerMap = ({
  lat = 37.7749,
  lng = -122.4194,
  onLocationSelect,
  readOnly = false,
  popupText = 'Item Storage Location',
  height = '280px',
  items,
  onItemSelect
}) => {
  const centerLat = lat || 37.7749;
  const centerLng = lng || -122.4194;

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for location suggestions
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const matchingItems = (items || [])
          .filter(it => 
            it.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            it.room?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(it => ({
            id: it.id,
            display_name: `${it.name} (${it.room})`,
            lat: it.lat,
            lon: it.lng,
            isItem: true,
            category: it.category
          }));

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=5`
        );
        const geoData = await res.json();
        
        const geoSuggestions = (geoData || []).map(g => ({
          display_name: g.display_name,
          lat: parseFloat(g.lat),
          lon: parseFloat(g.lon),
          type: g.type || 'location'
        }));

        const combined = [...matchingItems, ...geoSuggestions];
        setSuggestions(combined);
        setShowDropdown(combined.length > 0);
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, items]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const topResult = data[0];
        handleSelectSuggestion({
          display_name: topResult.display_name,
          lat: topResult.lat,
          lon: topResult.lon
        });
      } else {
        setSearchError('Location not found');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setSearchError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    const newLat = parseFloat(sug.lat);
    const newLng = parseFloat(sug.lon);
    if (!isNaN(newLat) && !isNaN(newLng)) {
      if (onLocationSelect) {
        onLocationSelect(newLat, newLng, sug.display_name);
      }
      if (sug.isItem && onItemSelect) {
        onItemSelect(sug.id);
      }
    }
    setSearchQuery(sug.display_name.split(',')[0]);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
      {/* Search Bar Overlay with Dropdown */}
      <div ref={dropdownRef} className="absolute top-3 left-3 z-[1000] w-72 sm:w-80">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search address or location..."
            className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <button
            type="submit"
            disabled={searching}
            className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
          </button>
        </form>

        {showDropdown && suggestions.length > 0 && (
          <div className="mt-1.5 w-full bg-white/98 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors flex items-start gap-2.5 group"
              >
                <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${sug.isItem ? 'text-amber-500' : 'text-indigo-600'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 truncate">
                    {sug.display_name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {sug.isItem ? `Inventory Item • ${sug.category}` : `${sug.lat.toFixed(4)}, ${sug.lon.toFixed(4)}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {searchError && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold shadow-md">
            {searchError}
          </span>
        )}
      </div>

      <div style={{ height }} className="w-full z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeMapView center={[centerLat, centerLng]} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {!readOnly && <MapClickHandler onLocationSelect={onLocationSelect} />}

          {!items && (
            <Marker position={[centerLat, centerLng]} icon={customIndigoIcon}>
              <Popup>
                <div className="p-1 text-xs font-sans">
                  <p className="font-bold text-slate-900">{popupText}</p>
                  <p className="text-slate-500 text-[10px]">{centerLat.toFixed(4)}, {centerLng.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {items && items.map(item => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={customIndigoIcon}
              eventHandlers={{
                click: () => onItemSelect && onItemSelect(item.id)
              }}
            >
              <Popup>
                <div className="p-1.5 text-xs font-sans min-w-[140px]">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-indigo-600 font-medium text-[11px] mt-0.5">📍 {item.room}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                    {item.category}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {!readOnly && (
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-700 shadow-md flex items-center gap-1.5 pointer-events-none hidden sm:flex">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          Click anywhere on map to pin item location
        </div>
      )}
    </div>
  );
};

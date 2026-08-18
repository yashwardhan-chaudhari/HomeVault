import React, { useState, useEffect } from 'react';
import { MapPin, Home, ChevronRight, Layers } from 'lucide-react';
import { api } from '../services/api.js';
import { LocationPickerMap } from '../components/common/LocationPickerMap.jsx';

export const LocationMapPage = ({ onViewItem, refreshTrigger = 0 }) => {
  const [items, setItems] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await api.getItems({ limit: 100 });
        setItems(res.items || []);
      } catch (err) {
        console.error('Failed to load items for map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [refreshTrigger]);

  // Extract unique rooms
  const roomCounts = { All: items.length };
  items.forEach(i => {
    const r = i.location?.room || 'Unassigned';
    roomCounts[r] = (roomCounts[r] || 0) + 1;
  });

  const roomsList = Object.keys(roomCounts);

  const filteredItems = selectedRoom === 'All'
    ? items
    : items.filter(i => (i.location?.room || 'Unassigned') === selectedRoom);

  const mapPins = filteredItems
    .filter(i => i.location?.lat && i.location?.lng)
    .map(i => ({
      id: i.id,
      name: i.name,
      lat: i.location.lat,
      lng: i.location.lng,
      room: i.location.room || 'Room',
      category: i.category || 'General'
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" /> Interactive Location Map
          </h1>
          <p className="text-xs text-slate-500">Visual spatial directory of your home inventory</p>
        </div>

        {/* Room Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {roomsList.map(rm => (
            <button
              key={rm}
              onClick={() => setSelectedRoom(rm)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedRoom === rm
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rm} ({roomCounts[rm]})
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Hierarchy Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Card */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" /> Map Pin Navigation ({mapPins.length} pins)
              </h2>
              <span className="text-[10px] text-slate-400">Click pins to view details</span>
            </div>

            <LocationPickerMap
              lat={mapPins[0]?.lat || 37.7749}
              lng={mapPins[0]?.lng || -122.4194}
              readOnly={true}
              height="440px"
              items={mapPins}
              onItemSelect={(id) => {
                const found = items.find(i => i.id === id);
                if (found) onViewItem(found);
              }}
            />
          </div>
        </div>

        {/* Storage Tree Listing */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Home className="w-4 h-4 text-indigo-600" /> Room Hierarchy ({filteredItems.length} items)
          </h3>

          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => onViewItem(item)}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 truncate">
                    {item.name}
                  </h4>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-1">
                  <span className="font-semibold text-indigo-600">
                    {item.location?.room || 'Room'}
                  </span>
                  {item.location?.container && (
                    <>
                      <span>›</span>
                      <span>{item.location.container}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Save, Box, MapPin, FileText, Camera } from 'lucide-react';
import { AutocompleteInput } from '../common/AutocompleteInput.jsx';
import { AutocompleteTagsInput } from '../common/AutocompleteTagsInput.jsx';
import { MediaUploader } from '../common/MediaUploader.jsx';
import { LocationPickerMap } from '../common/LocationPickerMap.jsx';

export const ItemFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  suggestions = {}
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState([]);
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyDate, setWarrantyDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('New');
  const [priority, setPriority] = useState('Medium');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Storage Location
  const [location, setLocation] = useState({
    house: '',
    room: '',
    drawer: '',
    container: '',
    exactPosition: '',
    lat: 37.7749,
    lng: -122.4194
  });

  // Media
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || '');
      setSubcategory(initialData.subcategory || '');
      setBrand(initialData.brand || '');
      setTags(initialData.tags || []);
      setPrice(initialData.price ? initialData.price : '');
      setPurchaseDate(initialData.purchaseDate || '');
      setWarrantyDate(initialData.warrantyDate || '');
      setQuantity(initialData.quantity || 1);
      setCondition(initialData.condition || 'New');
      setPriority(initialData.priority || 'Medium');
      setSerialNumber(initialData.serialNumber || '');
      setNotes(initialData.notes || '');
      setIsFavorite(initialData.isFavorite || false);
      setLocation(initialData.location || {
        house: '',
        room: '',
        drawer: '',
        container: '',
        exactPosition: '',
        lat: 37.7749,
        lng: -122.4194
      });
      setImages(initialData.images || []);
      setVideos(initialData.videos || []);
      setDocuments(initialData.documents || []);
    } else {
      setName('');
      setDescription('');
      setCategory('Electronics');
      setSubcategory('');
      setBrand('');
      setTags([]);
      setPrice('');
      setPurchaseDate('');
      setWarrantyDate('');
      setQuantity(1);
      setCondition('New');
      setPriority('Medium');
      setSerialNumber('');
      setNotes('');
      setIsFavorite(false);
      setLocation({
        house: '',
        room: '',
        drawer: '',
        container: '',
        exactPosition: '',
        lat: 37.7749,
        lng: -122.4194
      });
      setImages([]);
      setVideos([]);
      setDocuments([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter an item name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim() || 'General',
        subcategory: subcategory.trim(),
        brand: brand.trim(),
        tags,
        price: Number(price) || 0,
        purchaseDate,
        warrantyDate,
        quantity: Number(quantity) || 1,
        condition,
        priority,
        serialNumber: serialNumber.trim(),
        notes: notes.trim(),
        isFavorite,
        location,
        images,
        videos,
        documents
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Item' : 'Store New Item'}
              </h2>
              <p className="text-xs text-slate-500">Specify exact storage position and details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-5 bg-slate-50 overflow-x-auto">
          {[
            { id: 'basic', label: 'Basic Info', icon: Box },
            { id: 'location', label: 'Storage & Location', icon: MapPin },
            { id: 'media', label: 'Media & Docs', icon: Camera },
            { id: 'details', label: 'Purchase & Notes', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Item Name <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sony Wireless Noise Canceling Headphones"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Detailed visual description or contents..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="Category"
                  value={category}
                  onChange={setCategory}
                  suggestions={suggestions.categories || []}
                  placeholder="e.g. Electronics, Tools, Documents..."
                />
                <AutocompleteInput
                  label="Subcategory"
                  value={subcategory}
                  onChange={setSubcategory}
                  suggestions={suggestions.subcategories || []}
                  placeholder="e.g. Audio, Power Tools, Travel..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="Brand / Manufacturer"
                  value={brand}
                  onChange={setBrand}
                  suggestions={suggestions.brands || []}
                  placeholder="e.g. Sony, Apple, DeWalt..."
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <AutocompleteTagsInput
                label="Search Tags"
                tags={tags}
                onChange={setTags}
                suggestions={suggestions.tags || []}
                placeholder="Type tag name and press Enter..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Condition
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCondition(cond)}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                          condition === cond
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Priority / Importance
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Low', 'Medium', 'High', 'Critical'].map((prio) => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setPriority(prio)}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                          priority === prio
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <p className="text-xs text-indigo-700 font-medium flex items-center gap-1.5 bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                <MapPin className="w-4 h-4 shrink-0 text-indigo-600" />
                Fill in the precise location hierarchy to locate this item effortlessly later.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="House / Building"
                  value={location.house}
                  onChange={(val) => setLocation({ ...location, house: val })}
                  suggestions={suggestions.houses || []}
                  placeholder="e.g. Main Residence"
                />
                <AutocompleteInput
                  label="Room Name"
                  value={location.room}
                  onChange={(val) => setLocation({ ...location, room: val })}
                  suggestions={suggestions.rooms || []}
                  placeholder="e.g. Master Bedroom, Garage"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="Drawer / Rack"
                  value={location.drawer}
                  onChange={(val) => setLocation({ ...location, drawer: val })}
                  suggestions={suggestions.drawers || []}
                  placeholder="e.g. Drawer #2"
                />
                <AutocompleteInput
                  label="Container / Box Name"
                  value={location.container}
                  onChange={(val) => setLocation({ ...location, container: val })}
                  suggestions={suggestions.containers || []}
                  placeholder="e.g. Black Zippered Pouch"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Exact Position
                </label>
                <input
                  type="text"
                  value={location.exactPosition}
                  onChange={(e) => setLocation({ ...location, exactPosition: e.target.value })}
                  placeholder="e.g. Tucked in left corner next to power adapter"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Map GPS Location Pin
                </label>
                <LocationPickerMap
                  lat={location.lat}
                  lng={location.lng}
                  onLocationSelect={(lat, lng, addressName) => {
                    setLocation(prev => {
                      const updated = { ...prev, lat, lng };
                      if (addressName) {
                        updated.exactPosition = addressName;
                      }
                      return updated;
                    });
                  }}
                  popupText={name || 'Item Pin'}
                />
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <MediaUploader
              images={images}
              setImages={setImages}
              videos={videos}
              setVideos={setVideos}
              documents={documents}
              setDocuments={setDocuments}
            />
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Serial Number / ID
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="SN-123456789"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Warranty Expiry Date
                  </label>
                  <input
                    type="date"
                    value={warrantyDate}
                    onChange={(e) => setWarrantyDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Private Notes & Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Special handling, passwords, maintenance records..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="fav_check"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="fav_check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Mark as Favorite Item ⭐
                </label>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : initialData ? 'Update Vault Item' : 'Store in Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

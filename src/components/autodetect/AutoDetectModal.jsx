import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Upload, CheckCircle2, Save, RefreshCw, Camera, Box, MapPin, FileText } from 'lucide-react';
import { api } from '../../services/api.js';
import { AutocompleteInput } from '../common/AutocompleteInput.jsx';
import { AutocompleteTagsInput } from '../common/AutocompleteTagsInput.jsx';
import { MediaUploader } from '../common/MediaUploader.jsx';
import { LocationPickerMap } from '../common/LocationPickerMap.jsx';

export const AutoDetectModal = ({
  isOpen,
  onClose,
  onSaveToVault,
  suggestions = {}
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const fileInputRef = useRef(null);

  // Form Fields (Full Add Item Feature Set)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState([]);
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyDate, setWarrantyDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('Like New');
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
    if (!isOpen) {
      // Reset state when modal is closed
      setImagePreview(null);
      setResult(null);
      setAnalyzing(false);
      setActiveTab('basic');
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
      setCondition('Like New');
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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      setImages([base64]);
      runAutoDetect(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runAutoDetect = async (base64Data, mimeType) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const res = await api.autoDetect(base64Data, mimeType);
      setResult(res);

      setName(res.itemName || '');
      setCategory(res.category || 'Electronics');
      setSubcategory(res.subcategory || '');
      setBrand(res.brand || '');
      setTags(res.tags || []);
      setDescription(res.description || '');
      const detectedRoom = res.suggestedRoom || '';
      setLocation(prev => ({ ...prev, room: detectedRoom }));
      setNotes('');
      setImages([base64Data]);
    } catch (err) {
      alert(err.message || 'Auto detect failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please provide an item name');
      return;
    }

    setSaving(true);
    try {
      const itemPayload = {
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
        images: images.length > 0 ? images : (imagePreview ? [imagePreview] : []),
        videos,
        documents
      };

      await onSaveToVault(itemPayload);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to store auto-detected item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-transparent to-transparent dark:from-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                AI Auto Detect & Store
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scan item photo to detect metadata and customize full storage options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Upload Dropzone if no image yet */}
          {!imagePreview ? (
            <div className="p-8 m-6 flex-1 flex flex-col items-center justify-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/50 cursor-pointer flex flex-col items-center justify-center text-center group transition-all"
              >
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Upload or Take Item Photo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  Select an item photo to automatically identify name, brand, category, tags, and customize storage position
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              {/* Top Banner with Image Preview & AI Detection Badge */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm">
                  <img src={imagePreview} alt="Scanned item" className="w-full h-full object-cover" />
                  {analyzing && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-1.5 text-center sm:text-left">
                  {analyzing ? (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing photo with AI...
                    </div>
                  ) : result ? (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> AI Detected
                      </span>
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                        Confidence: {((result.confidenceScore || 0.9) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Photo loaded</span>
                  )}

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-md">
                    {name || 'Analyzing item...'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{category || 'General'}</span> {brand && `• Brand: ${brand}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" /> Rescan Photo
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 bg-slate-50 dark:bg-slate-800/20 overflow-x-auto">
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
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Form Content per Tab */}
              <div className="p-6 space-y-5 flex-1">
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Detected Item Name <span className="text-indigo-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sony Wireless Headphones"
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Visual description or contents summary..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AutocompleteInput
                        label="Category"
                        value={category}
                        onChange={setCategory}
                        suggestions={suggestions.categories || []}
                        placeholder="e.g. Electronics, Tools, Books..."
                      />
                      <AutocompleteInput
                        label="Subcategory"
                        value={subcategory}
                        onChange={setSubcategory}
                        suggestions={suggestions.subcategories || []}
                        placeholder="e.g. Audio, Hand Tools, Tech..."
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
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <AutocompleteTagsInput
                      label="Suggested Search Tags"
                      tags={tags}
                      onChange={setTags}
                      suggestions={suggestions.tags || []}
                      placeholder="Type tag name and press Enter..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
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
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {cond}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
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
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <MapPin className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                      Set storage hierarchy and map coordinates to locate this item in the future.
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
                        placeholder="e.g. Living Room, Garage"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AutocompleteInput
                        label="Drawer / Rack"
                        value={location.drawer}
                        onChange={(val) => setLocation({ ...location, drawer: val })}
                        suggestions={suggestions.drawers || []}
                        placeholder="e.g. Top Drawer #1"
                      />
                      <AutocompleteInput
                        label="Container / Box Name"
                        value={location.container}
                        onChange={(val) => setLocation({ ...location, container: val })}
                        suggestions={suggestions.containers || []}
                        placeholder="e.g. Black Clear Tote Box"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Exact Position
                      </label>
                      <input
                        type="text"
                        value={location.exactPosition}
                        onChange={(e) => setLocation({ ...location, exactPosition: e.target.value })}
                        placeholder="e.g. Tucked behind power extension on top shelf"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
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
                        popupText={name || 'Scanned Item Pin'}
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
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
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
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          Serial Number / ID
                        </label>
                        <input
                          type="text"
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          placeholder="SN-123456789"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                          Warranty Expiry Date
                        </label>
                        <input
                          type="date"
                          value={warrantyDate}
                          onChange={(e) => setWarrantyDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Private Notes & Instructions
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Maintenance instructions, receipt details..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="auto_fav_check"
                        checked={isFavorite}
                        onChange={(e) => setIsFavorite(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="auto_fav_check" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        Mark as Favorite Item ⭐
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {imagePreview && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <p className="text-[11px] text-slate-400 italic">Review & edit details before storing</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || analyzing}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Store in Vault'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LoginPage } from './components/auth/LoginPage.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { Sidebar } from './components/common/Sidebar.jsx';
import { Toast } from './components/common/Toast.jsx';
import { ItemFormModal } from './components/items/ItemFormModal.jsx';
import { ItemDetailModal } from './components/items/ItemDetailModal.jsx';
import { AutoDetectModal } from './components/autodetect/AutoDetectModal.jsx';
import { ConfirmModal } from './components/common/ConfirmModal.jsx';

// Pages
import { DashboardPage } from './pages/DashboardPage.jsx';
import { InventoryPage } from './pages/InventoryPage.jsx';
import { LocationMapPage } from './pages/LocationMapPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { ActivityLogsPage } from './pages/ActivityLogsPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { JavaScriptLabPage } from './pages/JavaScriptLabPage.jsx';

import { api } from './services/api.js';

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAutoDetectOpen, setIsAutoDetectOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [selectedEditItem, setSelectedEditItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Stats, Suggestions & Refresh Trigger
  const [stats, setStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [itemChangeCount, setItemChangeCount] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshData = async () => {
    try {
      const [sRes, sugRes, actRes] = await Promise.all([
        api.getDashboardStats(),
        api.getSuggestions(),
        api.getActivityLogs()
      ]);
      setStats(sRes);
      setSuggestions(sugRes);
      setActivityLogs(actRes.logs || []);
      setItemChangeCount(prev => prev + 1);
    } catch (e) {
      console.error('Failed to load initial stats:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 font-bold text-xs tracking-widest uppercase">
        Initializing HomeVault...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSaveItem = async (itemData) => {
    try {
      if (selectedEditItem) {
        await api.updateItem(selectedEditItem.id, itemData);
        addToast('success', 'Item Updated', `"${itemData.name}" saved to vault.`);
      } else {
        await api.createItem(itemData);
        addToast('success', 'Item Stored', `"${itemData.name}" saved to vault.`);
      }
      setSelectedEditItem(null);
      refreshData();
    } catch (err) {
      addToast('error', 'Save Failed', err.message);
      throw err;
    }
  };

  const handleDeleteItem = (itemOrId) => {
    setDeleteConfirmItem(itemOrId);
  };

  const executeDeleteItem = async () => {
    if (!deleteConfirmItem) return;
    const itemId = typeof deleteConfirmItem === 'object' ? deleteConfirmItem.id : deleteConfirmItem;
    const itemName = typeof deleteConfirmItem === 'object' ? deleteConfirmItem.name : 'Item';

    try {
      await api.deleteItem(itemId);
      addToast('info', 'Item Removed', `"${itemName}" was deleted from your vault.`);
      setSelectedDetailItem(null);
      setDeleteConfirmItem(null);
      refreshData();
    } catch (err) {
      addToast('error', 'Delete Failed', err.message);
      setDeleteConfirmItem(null);
    }
  };

  const handleToggleFavorite = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.toggleFavorite(id);
      addToast('success', res.item.isFavorite ? 'Starred Favorite' : 'Unstarred Item');
      refreshData();
    } catch (err) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Toast Overlay Container */}
      <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              id={t.id}
              type={t.type}
              title={t.title}
              message={t.message}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>

      <div className="flex-1 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddItem={() => {
            setSelectedEditItem(null);
            setIsAddItemOpen(true);
          }}
          onOpenAutoDetect={() => setIsAutoDetectOpen(true)}
        />

        {/* Right Section */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            onOpenAddItem={() => {
              setSelectedEditItem(null);
              setIsAddItemOpen(true);
            }}
            onOpenAutoDetect={() => setIsAutoDetectOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardPage
                stats={stats}
                activityLogs={activityLogs}
                onViewItem={(item) => setSelectedDetailItem(item)}
                onToggleFavorite={handleToggleFavorite}
                onDeleteItem={handleDeleteItem}
                onOpenAddItem={() => {
                  setSelectedEditItem(null);
                  setIsAddItemOpen(true);
                }}
                onOpenAutoDetect={() => setIsAutoDetectOpen(true)}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryPage
                onViewItem={(item) => setSelectedDetailItem(item)}
                onToggleFavorite={handleToggleFavorite}
                onDeleteItem={handleDeleteItem}
                onOpenAddItem={() => {
                  setSelectedEditItem(null);
                  setIsAddItemOpen(true);
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                suggestions={suggestions}
                refreshTrigger={itemChangeCount}
              />
            )}

            {activeTab === 'map' && (
              <LocationMapPage
                onViewItem={(item) => setSelectedDetailItem(item)}
                refreshTrigger={itemChangeCount}
              />
            )}

            {activeTab === 'autodetect' && (
              <div className="p-12 text-center">
                <button
                  onClick={() => setIsAutoDetectOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl hover:bg-indigo-700"
                >
                  Launch AI Auto Detect Vision Scanner
                </button>
              </div>
            )}

            {activeTab === 'analytics' && <AnalyticsPage />}
            {activeTab === 'activity' && <ActivityLogsPage />}
            {activeTab === 'jslab' && <JavaScriptLabPage />}
            {activeTab === 'notifications' && <NotificationsPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </main>
        </div>
      </div>

      {/* Item Form Modal (Add / Edit) */}
      <ItemFormModal
        isOpen={isAddItemOpen || Boolean(selectedEditItem)}
        onClose={() => {
          setIsAddItemOpen(false);
          setSelectedEditItem(null);
        }}
        onSave={handleSaveItem}
        initialData={selectedEditItem}
        suggestions={suggestions}
      />

      {/* Item Details View Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        isOpen={Boolean(selectedDetailItem)}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={(item) => {
          setSelectedDetailItem(null);
          setSelectedEditItem(item);
        }}
        onDelete={handleDeleteItem}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* AI Auto Detect Modal */}
      <AutoDetectModal
        isOpen={isAutoDetectOpen}
        onClose={() => setIsAutoDetectOpen(false)}
        onSaveToVault={handleSaveItem}
        suggestions={suggestions}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmItem)}
        title="Delete Item from Vault?"
        message={`Are you sure you want to delete ${
          typeof deleteConfirmItem === 'object' && deleteConfirmItem?.name
            ? `"${deleteConfirmItem.name}"`
            : 'this item'
        }? It will be permanently removed from your inventory and map pins.`}
        confirmLabel="Delete Item"
        onConfirm={executeDeleteItem}
        onClose={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

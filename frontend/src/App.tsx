import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { SystemHealthBanner } from './components/SystemHealthBanner';
import { DashboardPage } from './pages/DashboardPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { ResultViewPage } from './pages/ResultViewPage';
import { SavedListingsPage } from './pages/SavedListingsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { PricingPage } from './pages/PricingPage';
import { Listing, SystemHealth, ToastMessage } from './types';
import { api } from './services/api';

export function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sellcraft_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sellcraft_dark_mode', String(darkMode));
  }, [darkMode]);

  // Tab & Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // System Health State
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchHealth = async () => {
    try {
      const data = await api.getHealth();
      setSystemHealth(data);
    } catch {
      setSystemHealth({
        status: 'ollama_offline',
        ollama_connected: false,
        ollama_url: 'http://localhost:11434',
        active_model: 'qwen2.5:1.5b',
        available_models: [],
        model_ready: false,
        message: 'Unable to reach backend or Ollama.',
        setup_instructions: {
          install_linux: 'curl -fsSL https://ollama.com/install.sh | sh',
          start_service: 'ollama serve',
          pull_qwen: 'ollama pull qwen2.5:1.5b',
          pull_vision: 'ollama pull llama3.2-vision:latest',
          recommended_models: [],
        },
      });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleGenerated = (listing: Listing) => {
    setActiveListing(listing);
    setCurrentTab('result');
  };

  const handleSelectListingById = async (id: string) => {
    try {
      const listing = await api.getListingById(id);
      setActiveListing(listing);
      setCurrentTab('result');
    } catch (err) {
      showToast('error', 'Failed to load listing', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleNavigate = (tab: string, listingId?: string) => {
    if (listingId) {
      handleSelectListingById(listingId);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        systemHealth={systemHealth}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* Banner if Ollama is offline or model missing */}
          <SystemHealthBanner
            systemHealth={systemHealth}
            onNavigateToSetup={() => setCurrentTab('status')}
          />

          {/* Tab Views */}
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              showToast={showToast}
              systemHealth={systemHealth}
            />
          )}

          {currentTab === 'generator' && (
            <GeneratorPage
              onGenerated={handleGenerated}
              showToast={showToast}
              systemHealth={systemHealth}
              onNavigateToSetup={() => setCurrentTab('status')}
            />
          )}

          {currentTab === 'result' && activeListing && (
            <ResultViewPage
              listing={activeListing}
              onBack={() => setCurrentTab('dashboard')}
              onUpdateListing={(updated) => setActiveListing(updated)}
              showToast={showToast}
            />
          )}

          {currentTab === 'history' && (
            <SavedListingsPage
              onSelectListing={handleSelectListingById}
              onNavigateToCreate={() => setCurrentTab('generator')}
              showToast={showToast}
            />
          )}

          {currentTab === 'status' && (
            <SystemStatusPage
              systemHealth={systemHealth}
              onRefreshHealth={fetchHealth}
              showToast={showToast}
            />
          )}

          {currentTab === 'pricing' && (
            <PricingPage
              onNavigateToGenerator={() => setCurrentTab('generator')}
            />
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;

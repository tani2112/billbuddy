import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Bookmark,
  Layers,
  Sparkles,
  TrendingUp,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';
import { DashboardStats, ListingListItem, SystemHealth } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  onNavigate: (tab: string, listingId?: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  systemHealth: SystemHealth | null;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  onNavigate,
  showToast,
  systemHealth,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      showToast('error', 'Failed to load dashboard metrics', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCopyText = (item: ListingListItem) => {
    navigator.clipboard.writeText(`${item.seo_title}\n\nCategory: ${item.category} | Platform: ${item.platform}`);
    showToast('success', 'Copied to Clipboard!', `Title for "${item.product_name}" copied.`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteListing(id);
      showToast('info', 'Listing Deleted', `Removed "${name}" from local history.`);
      loadStats();
    } catch (err) {
      showToast('error', 'Delete failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleExport = (id: string) => {
    window.open(api.getExportTxtUrl(id), '_blank');
    showToast('success', 'Download Started', 'Listing exported as TXT file.');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Quick Action Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-slate-900 to-brand-950 p-6 sm:p-8 text-white shadow-xl border border-brand-800/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Open-Source Local AI E-Commerce Copilot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Generate High-Converting Listings in Seconds
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Craft SEO titles, 5 key selling points, Instagram captions with hashtags, and marketplace copy. Powered 100% locally by open-weight AI with zero API fees.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('generator')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-98 text-white font-semibold text-sm shadow-md shadow-brand-500/30 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span>Create New Listing</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-medium border border-white/10 transition-colors"
            >
              <span>View Saved Listings</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Generated
            </span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats?.total_listings ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Stored in local SQLite database
          </p>
        </div>

        {/* Saved Listings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saved / Bookmarked
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats?.saved_listings ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Favorites ready for publishing
          </p>
        </div>

        {/* Active AI Model */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Local AI Engine
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white truncate">
            {systemHealth?.active_model || 'Qwen 2.5'}
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Zero-token cost inference
          </p>
        </div>

        {/* Privacy Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Privacy Mode
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
            100% On-Device
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            No cloud transmission
          </p>
        </div>
      </div>

      {/* Platform & Category Distribution */}
      {stats && (stats.total_listings > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Platforms */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Platforms Breakdown
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.platform_breakdown).map(([platform, count]) => (
                <div
                  key={platform}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <span className="font-semibold">{platform}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Categories Breakdown
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.category_breakdown).map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <span>{cat}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Product Listings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quickly preview, copy, or export your recently crafted listings.
            </p>
          </div>
          <button
            onClick={loadStats}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading recent listings...
          </div>
        ) : !stats?.recent_listings || stats.recent_listings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No product listings yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Ready to craft your first e-commerce listing? Submit your product details to generate SEO titles and copy.
            </p>
            <button
              onClick={() => onNavigate('generator')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Listing</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recent_listings.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors gap-3"
              >
                <div
                  onClick={() => onNavigate('result', item.id)}
                  className="flex items-start gap-3.5 cursor-pointer flex-1"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate hover:text-brand-600 transition-colors">
                        {item.product_name}
                      </h4>
                      {item.is_saved && (
                        <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-md">
                      {item.seo_title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {item.platform}
                      </span>
                      <span>•</span>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handleCopyText(item)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy Title"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExport(item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download Clean TXT"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('result', item.id)}
                    className="p-2 rounded-lg text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                    title="View Full Listing"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.product_name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

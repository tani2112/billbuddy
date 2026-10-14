import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  ShoppingBag,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ListingListItem } from '../types';
import { api } from '../services/api';

interface SavedListingsProps {
  onSelectListing: (id: string) => void;
  onNavigateToCreate: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const SavedListingsPage: React.FC<SavedListingsProps> = ({
  onSelectListing,
  onNavigateToCreate,
  showToast,
}) => {
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [savedOnly, setSavedOnly] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const items = await api.getListings({
        q: searchQuery || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        platform: platformFilter !== 'All' ? platformFilter : undefined,
        saved_only: savedOnly,
      });
      setListings(items);
    } catch (err) {
      showToast('error', 'Failed to load listings', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, platformFilter, savedOnly]);

  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.toggleSaveListing(id);
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_saved: updated.is_saved } : item))
      );
      showToast(
        updated.is_saved ? 'success' : 'info',
        updated.is_saved ? 'Added to Saved' : 'Removed from Saved'
      );
    } catch (err) {
      showToast('error', 'Failed to toggle save', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete listing "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((item) => item.id !== id));
      showToast('info', 'Listing Deleted', `Removed "${name}" from SQLite history.`);
    } catch (err) {
      showToast('error', 'Delete failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleCopyTitle = (item: ListingListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.seo_title);
    showToast('success', 'Title Copied', `"${item.product_name}" SEO title copied.`);
  };

  const handleDownloadTxt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(api.getExportTxtUrl(id), '_blank');
    showToast('success', 'Download Started', 'Clean TXT listing exported.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Listing History & Saved Items
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, edit, and export previously generated product listings stored in SQLite.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Listing</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Handcrafted & Art">Handcrafted & Art</option>
              <option value="Jewelry & Accessories">Jewelry & Accessories</option>
              <option value="Fashion & Apparel">Fashion & Apparel</option>
              <option value="Home & Living">Home & Living</option>
              <option value="Beauty & Skincare">Beauty & Skincare</option>
              <option value="Electronics & Gadgets">Electronics & Gadgets</option>
              <option value="Food & Gourmet">Food & Gourmet</option>
            </select>

            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none"
            >
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="Etsy">Etsy</option>
              <option value="eBay">eBay</option>
              <option value="Shopify">Shopify</option>
              <option value="Amazon">Amazon</option>
            </select>

            {/* Saved Only Toggle */}
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                savedOnly
                  ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-amber-500' : ''}`} />
              <span>Saved Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Listings List / Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
          <span>Searching local listings...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No listings found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'All' || platformFilter !== 'All' || savedOnly
              ? 'Try adjusting your search query or filters.'
              : 'You have not generated any product listings yet.'}
          </p>
          <button
            onClick={onNavigateToCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate First Listing</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectListing(item.id)}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                      {item.platform}
                    </span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleToggleSave(item.id, e)}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors"
                    title={item.is_saved ? 'Remove from saved' : 'Save listing'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        item.is_saved ? 'text-amber-500 fill-amber-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                  {item.product_name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.seo_title}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleCopyTitle(item, e)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Copy SEO Title"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDownloadTxt(item.id, e)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Export TXT"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(item.id, item.product_name, e)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

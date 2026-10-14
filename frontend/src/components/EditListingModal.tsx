import React, { useState } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { Listing } from '../types';

interface EditModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Listing) => void;
}

export const EditListingModal: React.FC<EditModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(listing.seo_title);
  const [description, setDescription] = useState(listing.description);
  const [sellingPoints, setSellingPoints] = useState<string[]>([...listing.selling_points]);
  const [keywords, setKeywords] = useState(listing.keywords.join(', '));
  const [instagramCaption, setInstagramCaption] = useState(listing.instagram_caption);
  const [callToAction, setCallToAction] = useState(listing.call_to_action);
  const [isSaving, setIsSaving] = useState(false);

  const handlePointChange = (index: number, val: string) => {
    const updated = [...sellingPoints];
    updated[index] = val;
    setSellingPoints(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedKeywords = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const updatedPayload: Partial<Listing> = {
        seo_title: title,
        description,
        selling_points: sellingPoints,
        keywords: parsedKeywords,
        instagram_caption: instagramCaption,
        call_to_action: callToAction,
      };

      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) throw new Error('Failed to update listing');
      const savedListing = await res.json();
      onSave(savedListing);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating listing');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Edit Generated Listing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* SEO Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Primary SEO Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Product Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>

          {/* Selling Points */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Key Selling Points (5 Bullets)
            </label>
            <div className="space-y-2">
              {sellingPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-4">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handlePointChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Instagram Caption */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Instagram Caption & Hashtags
            </label>
            <textarea
              rows={4}
              value={instagramCaption}
              onChange={(e) => setInstagramCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>

          {/* Call to action */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Call to Action
            </label>
            <input
              type="text"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Keywords (Comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-98 text-white text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

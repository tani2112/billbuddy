import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Bookmark,
  Edit3,
  ArrowLeft,
  Share2,
  Sparkles,
  ShoppingBag,
  Tag,
  Camera,
  CheckCircle2,
  ListOrdered,
  FileText
} from 'lucide-react';
import { Listing } from '../types';
import { api } from '../services/api';
import { EditListingModal } from '../components/EditListingModal';

interface ResultViewProps {
  listing: Listing;
  onBack: () => void;
  onUpdateListing: (updated: Listing) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ResultViewPage: React.FC<ResultViewProps> = ({
  listing,
  onBack,
  onUpdateListing,
  showToast,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(listing.is_saved);

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    showToast('success', 'Copied to Clipboard!', `${sectionName} copied.`);
    setTimeout(() => {
      setCopiedSection((prev) => (prev === sectionName ? null : prev));
    }, 2000);
  };

  const copyCompleteListing = () => {
    const fullText = `TITLE:
${listing.seo_title}

ALTERNATIVE TITLES:
${listing.alternative_titles.map((t) => `- ${t}`).join('\n')}

DESCRIPTION:
${listing.description}

KEY SELLING POINTS:
${listing.selling_points.map((p) => `• ${p}`).join('\n')}

CALL TO ACTION:
${listing.call_to_action}

INSTAGRAM CAPTION & HASHTAGS:
${listing.instagram_caption}

SEARCH KEYWORDS & TAGS:
${listing.keywords.join(', ')}
`;
    copyToClipboard(fullText, 'Complete Listing');
  };

  const handleToggleSave = async () => {
    try {
      const updated = await api.toggleSaveListing(listing.id);
      setIsSaved(updated.is_saved);
      onUpdateListing(updated);
      showToast(
        updated.is_saved ? 'success' : 'info',
        updated.is_saved ? 'Listing Bookmarked' : 'Removed from Saved',
        `"${listing.product_name}" status updated in SQLite database.`
      );
    } catch (err) {
      showToast('error', 'Failed to update bookmark', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDownloadTxt = () => {
    window.open(api.getExportTxtUrl(listing.id), '_blank');
    showToast('success', 'Download Started', 'Clean marketplace-ready TXT exported.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bookmark Button */}
          <button
            onClick={handleToggleSave}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* Export TXT */}
          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TXT</span>
          </button>

          {/* Copy Entire Listing */}
          <button
            onClick={copyCompleteListing}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
          >
            {copiedSection === 'Complete Listing' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedSection === 'Complete Listing' ? 'All Copied!' : 'Copy Entire Listing'}</span>
          </button>
        </div>
      </div>

      {/* Listing Metadata Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs gap-4">
        <div className="flex items-center gap-4">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.product_name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
              <ShoppingBag className="w-8 h-8" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                {listing.category}
              </span>
              <span>•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Target: {listing.platform}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {listing.product_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>Model: {listing.model_used}</span>
              <span>•</span>
              <span>Tone: {listing.tone}</span>
              <span>•</span>
              <span>Lang: {listing.language}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Results Content Cards */}
      <div className="grid grid-cols-1 gap-5">
        {/* Card 1: Primary SEO Title */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Primary SEO Product Title
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(listing.seo_title, 'Primary SEO Title')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'Primary SEO Title' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedSection === 'Primary SEO Title' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {listing.seo_title}
          </p>
        </div>

        {/* Card 2: Alternative Titles */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <ListOrdered className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Three Alternative Titles (A/B Testing)
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            {listing.alternative_titles.map((altTitle, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span>{altTitle}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(altTitle, `Alternative Title ${idx + 1}`)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Copy this title"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Detailed Description */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Detailed Product Story & Description
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(listing.description, 'Product Description')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'Product Description' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedSection === 'Product Description' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            {listing.description}
          </div>
        </div>

        {/* Card 4: Key Selling Points */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                4. Five Key Selling Points
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(listing.selling_points.map((p) => `• ${p}`).join('\n'), 'Key Selling Points')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'Key Selling Points' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedSection === 'Key Selling Points' ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>
          <ul className="space-y-2.5">
            {listing.selling_points.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-800 dark:text-slate-200">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 5: Search Keywords & Tags */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                5. Search Keywords & Marketplace Tags
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(listing.keywords.join(', '), 'Keywords')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'Keywords' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedSection === 'Keywords' ? 'Copied' : 'Copy Tags'}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.keywords.map((kw, idx) => (
              <span
                key={idx}
                onClick={() => copyToClipboard(kw, `Tag: ${kw}`)}
                className="cursor-pointer px-3 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-brand-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                title="Click to copy single tag"
              >
                #{kw.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
        </div>

        {/* Card 6: Instagram Caption */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                6. Ready-to-Post Instagram Caption & Hashtags
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(listing.instagram_caption, 'Instagram Caption')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'Instagram Caption' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedSection === 'Instagram Caption' ? 'Copied' : 'Copy Caption'}</span>
            </button>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            {listing.instagram_caption}
          </div>
        </div>

        {/* Card 7: Call to Action */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                7. Closing Call-To-Action Sentence
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(listing.call_to_action, 'Call to Action')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedSection === 'Call to Action' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedSection === 'Call to Action' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-base font-semibold text-brand-700 dark:text-brand-300 bg-brand-50/50 dark:bg-brand-950/30 p-4 rounded-xl border border-brand-200 dark:border-brand-900">
            "{listing.call_to_action}"
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <EditListingModal
        listing={listing}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(updated) => {
          onUpdateListing(updated);
          showToast('success', 'Changes Saved', 'Listing updated successfully in SQLite.');
        }}
      />
    </div>
  );
};

import React from 'react';
import { Check, Sparkles, Shield, Cpu, Zap, ArrowRight, Star } from 'lucide-react';

interface PricingProps {
  onNavigateToGenerator: () => void;
}

export const PricingPage: React.FC<PricingProps> = ({ onNavigateToGenerator }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fair & Transparent Freemium Model</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Simple Plans for Every Growing Shop
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Start generating listings 100% free with your own hardware. Upgrade to Cloud Batch when your shop scales.
        </p>
      </div>

      {/* MVP Transparent Notice */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-center max-w-xl mx-auto">
        <span className="font-bold text-slate-900 dark:text-white">MVP Transparency Note: </span>
        SellCraft Community Edition is currently 100% functional, free, and open-source. Pro features below represent our planned roadmap for cloud multi-store synchronization.
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Tier 1: Community (Active Now) */}
        <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-xl shadow-brand-500/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Community Edition
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  Local Open-Source
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-200 text-xs font-extrabold">
                CURRENT MVP
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ forever free</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ideal for small boutique sellers, Instagram DM shops, and handmade crafters running inference on their personal computers.
            </p>

            <ul className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span><strong>Unlimited</strong> listing generations via local Ollama</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Support for <strong>Qwen 2.5</strong>, <strong>Llama 3.2</strong>, and any open model</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>English, Hindi & Hinglish multilingual copy</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Local SQLite database history & favorites</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Single-click clean <strong>TXT export</strong> for Etsy & eBay</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span><strong>100% private:</strong> No product data leaves your device</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={onNavigateToGenerator}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Use Free Edition Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 2: Pro Cloud (Proposed Roadmap) */}
        <div className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between opacity-95">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Proposed Future
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  Pro Cloud & Sync
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                ROADMAP
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$12</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ month (projected)</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Designed for high-volume resellers and multi-channel stores who need cloud batch processing and automatic marketplace sync.
            </p>

            <ul className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span><strong>CSV Batch Processing:</strong> Generate 100 listings in 1 click</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>1-Click direct publish to <strong>Shopify, Etsy & eBay APIs</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>Cloud GPU inference (no local RAM requirements)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>Custom fine-tuned LoRA models trained on your brand tone</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>Multi-photo 360° visual feature extraction</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-sm cursor-not-allowed text-center"
            >
              Planned for Pro Release (No Payment Required)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

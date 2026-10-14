import React, { useState, useRef } from 'react';
import {
  Wand2,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { GeneratePayload, Listing, SystemHealth } from '../types';
import { api } from '../services/api';

interface GeneratorProps {
  onGenerated: (listing: Listing) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  systemHealth: SystemHealth | null;
  onNavigateToSetup: () => void;
}

const CATEGORIES = [
  'Handcrafted & Art',
  'Jewelry & Accessories',
  'Fashion & Apparel',
  'Home & Living',
  'Beauty & Skincare',
  'Electronics & Gadgets',
  'Food & Gourmet',
  'Books & Stationery',
  'Fitness & Sports',
  'Other / Custom'
];

const PLATFORMS = [
  { id: 'Instagram', name: 'Instagram', desc: 'Visual hooks, engaging captions & hashtags' },
  { id: 'Etsy', name: 'Etsy', desc: 'Artisanal focus, craftsmanship & gift appeal' },
  { id: 'eBay', name: 'eBay', desc: 'Detailed specs, condition & high search keywords' },
  { id: 'Shopify', name: 'Shopify / Store', desc: 'Brand storytelling & high-converting layout' },
  { id: 'Amazon', name: 'Amazon', desc: 'Keyword-dense titles & feature-benefit bullets' },
  { id: 'General', name: 'General Online Store', desc: 'Clean, versatile e-commerce copy' },
];

const TONES = [
  { id: 'persuasive', name: 'Persuasive', desc: 'High-converting with urgency' },
  { id: 'premium', name: 'Premium & Luxury', desc: 'Sophisticated and exclusive' },
  { id: 'friendly', name: 'Friendly & Warm', desc: 'Welcoming & community-first' },
  { id: 'professional', name: 'Professional', desc: 'Polished, authoritative & factual' },
  { id: 'playful', name: 'Playful & Witty', desc: 'Fun, witty & memorable' },
];

const LANGUAGES = [
  { id: 'English', label: 'English', desc: 'Global e-commerce copywriting' },
  { id: 'Hindi', label: 'Hindi', desc: 'Culturally resonant Devanagari copy' },
  { id: 'Hinglish', label: 'Hinglish', desc: 'Conversational Indian social commerce' },
];

export const GeneratorPage: React.FC<GeneratorProps> = ({
  onGenerated,
  showToast,
  systemHealth,
  onNavigateToSetup,
}) => {
  // Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [featuresSpecs, setFeaturesSpecs] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('persuasive');
  const [language, setLanguage] = useState('English');
  const [selectedModel, setSelectedModel] = useState(systemHealth?.active_model || 'qwen2.5:1.5b');

  // Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageNotes, setImageNotes] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation Loading State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please upload a PNG, JPG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Maximum image size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setImageNotes(null);
      showToast('success', 'Image Uploaded', 'Product image ready for listing.');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageNotes(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeImageWithAI = async () => {
    if (!imagePreview) return;
    setIsAnalyzingImage(true);
    try {
      const res = await api.analyzeImage(imagePreview);
      if (res.success && res.detected_features.length > 0) {
        showToast('success', 'Visual Features Detected!', `Extracted ${res.detected_features.length} characteristics.`);
        setFeaturesSpecs((prev) => {
          const added = `Visible features: ${res.detected_features.join(', ')}`;
          return prev ? `${prev}\n${added}` : added;
        });
        if (res.suggested_category && !category) {
          setCategory(res.suggested_category);
        }
        setImageNotes(res.notes);
      } else {
        setImageNotes(res.notes);
        showToast('info', 'Vision Model Info', res.notes);
      }
    } catch (err) {
      showToast('error', 'Image Analysis Note', err instanceof Error ? err.message : 'Could not inspect image.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productName.trim()) {
      showToast('error', 'Required Field', 'Please enter a product name.');
      return;
    }

    if (!featuresSpecs.trim() || featuresSpecs.length < 5) {
      showToast('error', 'Required Field', 'Please provide at least a few product features or specs.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    // Simulate progress steps for responsive feedback while waiting on local inference
    const stepTimer1 = setTimeout(() => setGenerationStep(2), 2500);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 6000);

    try {
      const payload: GeneratePayload = {
        product_name: productName.trim(),
        category,
        features_specs: featuresSpecs.trim(),
        target_audience: targetAudience.trim() || undefined,
        platform,
        tone,
        language,
        image_data: imagePreview || null,
        model_override: selectedModel,
      };

      const result = await api.generateListing(payload);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      showToast('success', 'Listing Generated!', `Crafted with ${result.model_used}`);
      onGenerated(result);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setErrorMessage(msg);
      showToast('error', 'Generation Error', msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <Sparkles className="w-4 h-4" />
          <span>Local Open-Source AI Generator</span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Create Product Listing
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Fill in your product specifications. Your local open model will formulate high-converting titles, descriptions, and hashtags.
        </p>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Generation Failed</h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">{errorMessage}</p>
              {errorMessage.includes('Ollama is offline') && (
                <button
                  type="button"
                  onClick={onNavigateToSetup}
                  className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300 underline hover:no-underline"
                >
                  View Ollama setup instructions &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Product Basics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span>1. Product Basics</span>
            <span className="text-xs font-normal text-slate-400">Required fields</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Handmade Ceramic Matcha Bowl"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Product Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Features and specifications */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Features & Specifications <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Dimensions, materials, care, warranty</span>
            </div>
            <textarea
              rows={4}
              value={featuresSpecs}
              onChange={(e) => setFeaturesSpecs(e.target.value)}
              placeholder="e.g. Hand-thrown stoneware clay, speckled matte glaze, 450ml capacity, microwave & dishwasher safe, lead-free food grade, includes bamboo whisk holder."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              required
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Matcha tea lovers, aesthetic home decor seekers, thoughtful gift shoppers"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Section 2: Platform, Tone & Language */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            2. Marketing & Audience Targeting
          </h2>

          {/* Selling Platform Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Primary Selling Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PLATFORMS.map((p) => {
                const selected = platform === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs sm:text-sm">{p.name}</span>
                      {selected && <CheckCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-tight truncate">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Copywriting Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                {TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Output Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label} ({lang.desc})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Product Image (Optional) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Product Photo (Optional)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload a photo to preview or inspect verifiable visual attributes.
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
              Max 5MB
            </span>
          </div>

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Click to upload product photo
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supports JPG, PNG, WebP up to 5MB. Photo stays 100% on your device.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="max-h-64 rounded-xl object-contain bg-slate-950"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-md transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={analyzeImageWithAI}
                  disabled={isAnalyzingImage}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAnalyzingImage ? 'Inspecting image...' : 'Detect Visual Features (Vision AI)'}</span>
                </button>
                <span className="text-xs text-slate-400">
                  Or enter verified features directly in specifications above.
                </span>
              </div>

              {imageNotes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Image Analysis: </span>
                  {imageNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 4: Engine Selection & Submit */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Model:
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-brand-500 outline-none"
            >
              {systemHealth?.available_models && systemHealth.available_models.length > 0 ? (
                systemHealth.available_models.map((m) => (
                  <option key={m} value={m}>
                    {m} {m.includes('qwen') ? '★ Recommended' : ''}
                  </option>
                ))
              ) : (
                <option value="qwen2.5:1.5b">qwen2.5:1.5b</option>
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing with Open AI...' : 'Generate Full Listing'}</span>
          </button>
        </div>
      </form>

      {/* Progressive Generation Loading Modal / Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-900" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generating Your Listing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Running inference locally via <span className="font-mono text-brand-600 dark:text-brand-400">{selectedModel}</span>
              </p>
            </div>

            {/* Stepped progress indicators */}
            <div className="space-y-3 text-left">
              <div className={`flex items-center gap-3 text-xs ${generationStep >= 1 ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-slate-400'}`}>
                <div className={`w-2 h-2 rounded-full ${generationStep >= 1 ? 'bg-brand-600 animate-pulse' : 'bg-slate-300'}`} />
                <span>Analyzing product attributes & category intent...</span>
              </div>
              <div className={`flex items-center gap-3 text-xs ${generationStep >= 2 ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-slate-400'}`}>
                <div className={`w-2 h-2 rounded-full ${generationStep >= 2 ? 'bg-brand-600 animate-pulse' : 'bg-slate-300'}`} />
                <span>Crafting SEO-optimized title & 5 key selling points...</span>
              </div>
              <div className={`flex items-center gap-3 text-xs ${generationStep >= 3 ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-slate-400'}`}>
                <div className={`w-2 h-2 rounded-full ${generationStep >= 3 ? 'bg-brand-600 animate-pulse' : 'bg-slate-300'}`} />
                <span>Generating Instagram caption, hashtags & call-to-action...</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              100% private. No data is transmitted to third-party cloud servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

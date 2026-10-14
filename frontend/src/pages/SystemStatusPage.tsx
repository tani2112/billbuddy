import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  Shield,
  Layers,
  HardDrive,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { SystemHealth } from '../types';
import { api } from '../services/api';

interface SystemStatusProps {
  systemHealth: SystemHealth | null;
  onRefreshHealth: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const SystemStatusPage: React.FC<SystemStatusProps> = ({
  systemHealth,
  onRefreshHealth,
  showToast,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyToClipboard = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    showToast('success', 'Command Copied', cmd);
    setTimeout(() => {
      setCopiedCmd((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshHealth();
    setIsRefreshing(false);
    showToast('info', 'Status Refreshed', 'Checked connection to local Ollama daemon.');
  };

  const isHealthy = systemHealth?.status === 'healthy';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <Cpu className="w-4 h-4" />
            <span>Local Engine Diagnostics</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            AI Engine Status & Setup
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            SellCraft connects directly to your local Ollama runtime. Verify daemon health and model weights.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Main Status Indicator Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isHealthy
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {isHealthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isHealthy ? 'Ollama Daemon Connected & Ready' : 'Ollama Offline or Model Missing'}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isHealthy
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {systemHealth?.status || 'unknown'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {systemHealth?.message || 'Inspecting local Ollama endpoint...'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
            <div>Target URL: {systemHealth?.ollama_url || 'http://localhost:11434'}</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Active Model: {systemHealth?.active_model || 'None'}
            </div>
          </div>
        </div>

        {/* Installed Models Grid */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Installed Models on Your Machine:
          </h4>
          {systemHealth?.available_models && systemHealth.available_models.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {systemHealth.available_models.map((model) => (
                <div
                  key={model}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono">{model}</span>
                  {model.includes('qwen') && (
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 px-1 rounded bg-brand-50 dark:bg-brand-950">
                      Recommended
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No models currently detected in local Ollama repository. Follow the pull instructions below.
            </p>
          )}
        </div>
      </div>

      {/* Linux / Ubuntu Quick Setup Guide */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Quick Installation & Model Download (Ubuntu / Linux)
          </h2>
        </div>

        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Step 1: Install Ollama (Official Script)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800">
            <code>curl -fsSL https://ollama.com/install.sh | sh</code>
            <button
              onClick={() => copyToClipboard('curl -fsSL https://ollama.com/install.sh | sh', 'step1')}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title="Copy command"
            >
              {copiedCmd === 'step1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Step 2: Start Ollama Service</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800">
            <code>ollama serve</code>
            <button
              onClick={() => copyToClipboard('ollama serve', 'step2')}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title="Copy command"
            >
              {copiedCmd === 'step2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Step 3: Recommended Models */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Step 3: Download Open-Weight Models for E-Commerce
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Qwen 2.5 1.5B */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Qwen 2.5 1.5B (Recommended)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">986 MB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Lightning fast, low RAM usage, superb Hindi/Hinglish and structured JSON generation.
              </p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-200">
                <code>ollama pull qwen2.5:1.5b</code>
                <button
                  onClick={() => copyToClipboard('ollama pull qwen2.5:1.5b', 'qwen1.5')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'qwen1.5' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Qwen 2.5 3B */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Qwen 2.5 3B</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">1.9 GB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Enhanced creative tone, deeper emotional storytelling hooks, and higher nuance.
              </p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-200">
                <code>ollama pull qwen2.5:3b</code>
                <button
                  onClick={() => copyToClipboard('ollama pull qwen2.5:3b', 'qwen3')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'qwen3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Llama 3.2 3B */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Llama 3.2 3B</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">2.0 GB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Meta's lightweight open model, versatile across general e-commerce descriptions.
              </p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-200">
                <code>ollama pull llama3.2:latest</code>
                <button
                  onClick={() => copyToClipboard('ollama pull llama3.2:latest', 'llama32')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'llama32' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Llama 3.2 Vision */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Llama 3.2 Vision (Vision AI)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">7.9 GB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Allows SellCraft to visually inspect uploaded product photos and extract visible details.
              </p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-200">
                <code>ollama pull llama3.2-vision:latest</code>
                <button
                  onClick={() => copyToClipboard('ollama pull llama3.2-vision:latest', 'vision')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'vision' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Open-Source AI Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-bold text-white">
            The Open-Weight AI Advantage for Small Business
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
          <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white text-sm">Zero Token Tax</h4>
            <p className="leading-relaxed">
              Proprietary APIs charge per 1,000 tokens for every draft. SellCraft runs locally on your machine with infinite free generations.
            </p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white text-sm">True Privacy</h4>
            <p className="leading-relaxed">
              Proprietary AI vendors log your product photos and unpublished product ideas. With SellCraft, not a single byte leaves your computer.
            </p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white text-sm">Offline & Swappable</h4>
            <p className="leading-relaxed">
              Works completely offline once models are pulled. You can swap in any GGUF or open-source checkpoint anytime.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          Honest Trade-off: Local generation requires device RAM/VRAM. On older laptops without GPUs, 1.5B parameters provides the optimal speed/quality sweet spot.
        </p>
      </div>
    </div>
  );
};

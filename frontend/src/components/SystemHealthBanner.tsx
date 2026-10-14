import React from 'react';
import { AlertTriangle, Terminal, ChevronRight } from 'lucide-react';
import { SystemHealth } from '../types';

interface HealthBannerProps {
  systemHealth: SystemHealth | null;
  onNavigateToSetup: () => void;
}

export const SystemHealthBanner: React.FC<HealthBannerProps> = ({
  systemHealth,
  onNavigateToSetup,
}) => {
  if (!systemHealth || systemHealth.status === 'healthy') {
    return null;
  }

  const isOffline = systemHealth.status === 'ollama_offline';
  const isModelMissing = systemHealth.status === 'model_missing';

  return (
    <div className="mb-6 p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">
              {isOffline ? 'Ollama AI is not running locally' : 'Configured Open AI model needs to be pulled'}
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              {isOffline
                ? 'SellCraft uses local open-weight inference. Start Ollama with `ollama serve` to generate listings.'
                : `Run \`ollama pull ${systemHealth.active_model}\` in your terminal to download the weights.`}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToSetup}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors shadow-xs w-fit flex-shrink-0"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>View Setup Guide</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

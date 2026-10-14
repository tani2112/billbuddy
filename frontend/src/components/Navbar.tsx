import React from 'react';
import { Sun, Moon, Sparkles, Cpu, Menu, ShieldCheck } from 'lucide-react';
import { SystemHealth } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  systemHealth: SystemHealth | null;
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  systemHealth,
  onOpenMobileMenu,
  onNavigate,
}) => {
  const isHealthy = systemHealth?.status === 'healthy';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-brand-600 dark:from-white dark:via-brand-300 dark:to-emerald-400 bg-clip-text text-transparent">
              SellCraft
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Open AI
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model status pill */}
        <button
          onClick={() => onNavigate('status')}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{
            borderColor: isHealthy ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
            backgroundColor: isHealthy ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          }}
          title={systemHealth?.message || 'Check AI status'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline text-slate-700 dark:text-slate-300">
            {systemHealth?.active_model || 'Ollama Local'}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            {isHealthy ? 'Online' : 'Offline'}
          </span>
        </button>

        {/* Local privacy badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>100% Local Inference</span>
        </div>

        {/* Dark / Light toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>
    </header>
  );
};

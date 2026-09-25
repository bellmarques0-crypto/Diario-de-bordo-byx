import React, { useState } from 'react';
import {
  BookOpen,
  Settings,
  Moon,
  Sun,
  Bell,
  Radio,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Occurrence } from '../types';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminSubTab: string;
  setAdminSubTab: (subTab: string) => void;
  neonConnected: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: (enabled: boolean) => void;
  occurrences?: Occurrence[];
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  adminSubTab,
  setAdminSubTab,
  neonConnected,
  isDarkMode = false,
  onToggleDarkMode,
  occurrences = []
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearedBadge, setClearedBadge] = useState(false);

  // Unread / Open occurrences
  const openOccurrences = occurrences.filter(
    (o) => o.status === 'Aberto' || o.status === 'Em Andamento' || o.status === 'Monitorando'
  );
  const displayCount = clearedBadge ? 0 : openOccurrences.length;

  const handleMarkAllRead = () => {
    setClearedBadge(true);
  };
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / System Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                Diário de Bordo
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                Sistema Operacional
              </span>
            </div>
          </div>

          {/* Navigation Items (Only Diário de Bordo & Administração as requested) */}
          <nav className="flex items-center gap-2 py-2">
            <button
              onClick={() => setActiveTab('diario')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'diario'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Diário de Bordo
            </button>

            {/* Administração tab */}
            <button
              onClick={() => setActiveTab('administracao')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'administracao'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Administração
            </button>
          </nav>

          {/* Right Area: Notification Bell (Sininho de Sinalizações) + Dark Mode Quick Toggle */}
          <div className="hidden lg:flex items-center gap-2.5 relative">
            {/* Sininho de Sinalizações */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-2xs relative"
                title="Sinalizações e Alertas de Novas Ocorrências"
              >
                <Bell className={`w-4 h-4 ${displayCount > 0 ? 'text-amber-500 animate-bounce' : ''}`} />
                {displayCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                    {displayCount > 9 ? '9+' : displayCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Sinalizações Operacionais
                      </span>
                      {displayCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 text-[10px] font-bold">
                          {displayCount} nova(s)
                        </span>
                      )}
                    </div>
                    {displayCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                    {openOccurrences.length > 0 ? (
                      openOccurrences.slice(0, 6).map((occ) => (
                        <div
                          key={occ.id}
                          onClick={() => {
                            setActiveTab('sinalizacoes');
                            setShowNotifications(false);
                          }}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {occ.produto} — {occ.sistemaImpactado}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {occ.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                            {occ.descricaoOcorrencia}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {occ.dataOcorrencia} {occ.horaOcorrencia}
                            </span>
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              Resp: {occ.responsavelOcorrencia}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center space-y-1.5">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Nenhuma sinalização pendente
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Todas as ocorrências estão resolvidas ou fechadas.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('sinalizacoes');
                        setShowNotifications(false);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center justify-center gap-1.5 w-full py-1"
                    >
                      <span>Ver todas as sinalizações</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Quick Toggle */}
            {onToggleDarkMode && (
              <button
                onClick={() => onToggleDarkMode(!isDarkMode)}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-2xs"
                title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

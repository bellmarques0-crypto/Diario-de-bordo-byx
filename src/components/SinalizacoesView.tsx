import React from 'react';
import { Radio, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Occurrence } from '../types';

interface SinalizacoesViewProps {
  occurrences: Occurrence[];
}

export const SinalizacoesView: React.FC<SinalizacoesViewProps> = ({ occurrences }) => {
  const activeAlerts = occurrences.filter((o) => o.status !== 'Resolvido');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Painel de Sinalizações em Tempo Real
            </h2>
            <p className="text-xs text-slate-500">
              Mural de alertas críticos e monitoramento contínuo de contingência.
            </p>
          </div>
        </div>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Operação Normal</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há sinalizações ou incidentes ativos de alto impacto no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeAlerts.map((o) => (
            <div
              key={o.id}
              className="bg-white p-5 rounded-2xl border-l-4 border-amber-500 border-y border-r border-slate-200/80 shadow-xs flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                    Sinalização Ativa
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {o.dataOcorrencia} às {o.horaOcorrencia}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{o.sistemaImpactado}</h4>
                <p className="text-xs text-slate-600">{o.descricaoOcorrencia}</p>
                <div className="text-[11px] text-slate-500 font-medium pt-2">
                  Produto: <span className="font-semibold text-slate-800">{o.produto}</span> | Responsável: <span className="font-semibold text-slate-800">{o.responsavelOcorrencia}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

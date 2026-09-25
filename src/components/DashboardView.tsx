import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Clock, FileSpreadsheet, FileText } from 'lucide-react';
import { Occurrence } from '../types';

interface DashboardViewProps {
  occurrences: Occurrence[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ occurrences }) => {
  const total = occurrences.length;
  const abertas = occurrences.filter((o) => o.status === 'Aberto' || o.status === 'Em Andamento').length;
  const resolvidas = occurrences.filter((o) => o.status === 'Resolvido').length;

  // Breakdown by product
  const byProduct: Record<string, number> = {};
  occurrences.forEach((o) => {
    byProduct[o.produto] = (byProduct[o.produto] || 0) + 1;
  });

  // Breakdown by impact
  const byImpact = {
    Baixo: occurrences.filter((o) => o.tipoImpacto === 'Baixo').length,
    Médio: occurrences.filter((o) => o.tipoImpacto === 'Médio').length,
    Alto: occurrences.filter((o) => o.tipoImpacto === 'Alto').length,
    Crítico: occurrences.filter((o) => o.tipoImpacto === 'Crítico').length
  };

  const handleExportExcel = () => {
    const headers = ['ID,Data,Hora,Produto,Impacto,Sistema,Responsável,Status,Solução\n'];
    const rows = occurrences.map(
      (o) =>
        `"${o.id}","${o.dataOcorrencia}","${o.horaOcorrencia}","${o.produto}","${o.tipoImpacto}","${o.sistemaImpactado}","${o.responsavelOcorrencia}","${o.status}","${o.descricaoSolucao || ''}"`
    );
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Dashboard e Métricas Operacionais
            </h2>
            <p className="text-xs text-slate-500">
              Visão consolidada do volume de incidentes, tempos de solução e estabilidade dos sistemas.
            </p>
          </div>
        </div>

        {/* Action Buttons: Export PDF & Export Excel */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all"
            title="Exportar Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all"
            title="Exportar PDF"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              TOTAL DE OCORRÊNCIAS
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              EM ABERTO / ANDAMENTO
            </span>
            <span className="text-2xl font-extrabold text-amber-500 font-mono">
              {abertas}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              RESOLVIDAS
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 font-mono">
              {resolvidas}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              TAXA DE RESOLUÇÃO
            </span>
            <span className="text-2xl font-extrabold text-blue-600 font-mono">
              {total > 0 ? Math.round((resolvidas / total) * 100) : 100}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Produto */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Distribuição por Produto
          </h3>
          <div className="space-y-3">
            {Object.entries(byProduct).map(([prod, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={prod} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{prod}</span>
                    <span className="font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nível de Impacto */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Severidade & Impacto das Ocorrências
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-800 uppercase block">Impacto Baixo</span>
              <span className="text-xl font-bold text-blue-900 font-mono">{byImpact.Baixo}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Impacto Médio</span>
              <span className="text-xl font-bold text-amber-900 font-mono">{byImpact.Médio}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[11px] font-bold text-rose-800 uppercase block">Impacto Alto</span>
              <span className="text-xl font-bold text-rose-900 font-mono">{byImpact.Alto}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-red-100 border border-red-200">
              <span className="text-[11px] font-bold text-red-900 uppercase block">Impacto Crítico</span>
              <span className="text-xl font-bold text-red-950 font-mono">{byImpact.Crítico}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

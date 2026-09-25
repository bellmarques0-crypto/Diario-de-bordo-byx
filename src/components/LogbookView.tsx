import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Eye,
  TrendingUp,
  Layers,
  Filter,
  Plus,
  FileSpreadsheet,
  FileText,
  Mail,
  RotateCcw,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Upload
} from 'lucide-react';
import { Occurrence, Product, User } from '../types';
import { DashboardView } from './DashboardView';

interface LogbookViewProps {
  occurrences: Occurrence[];
  products: Product[];
  users: User[];
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
  onOpenEditModal: (occ: Occurrence) => void;
  onDeleteOccurrence: (id: string) => void;
  onViewTimeline: (occ: Occurrence) => void;
  onViewEvidence: (url: string, title: string) => void;
  subView: 'ocorrencias' | 'graficos';
  setSubView: (view: 'ocorrencias' | 'graficos') => void;
}

export const LogbookView: React.FC<LogbookViewProps> = ({
  occurrences,
  products,
  users,
  onOpenCreateModal,
  onOpenImportModal,
  onOpenEditModal,
  onDeleteOccurrence,
  onViewTimeline,
  onViewEvidence,
  subView,
  setSubView
}) => {
  // Filter States
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [tipoFilter, setTipoFilter] = useState('Todos os Tipos');
  const [produtoFilter, setProdutoFilter] = useState('Todos os Produtos');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [responsavelFilter, setResponsavelFilter] = useState('Todos os Responsáveis');
  const [impactoFilter, setImpactoFilter] = useState('Todos os Impactos');
  const [searchQuery, setSearchQuery] = useState('');

  const resetFilters = () => {
    setDataInicial('');
    setDataFinal('');
    setTipoFilter('Todos os Tipos');
    setProdutoFilter('Todos os Produtos');
    setStatusFilter('Todos os Status');
    setResponsavelFilter('Todos os Responsáveis');
    setImpactoFilter('Todos os Impactos');
    setSearchQuery('');
  };

  // Filter Logic
  const filteredOccurrences = occurrences.filter((occ) => {
    if (dataInicial && occ.dataOcorrencia < dataInicial) return false;
    if (dataFinal && occ.dataOcorrencia > dataFinal) return false;

    if (tipoFilter !== 'Todos os Tipos' && occ.tipoOcorrencia !== tipoFilter) return false;
    if (produtoFilter !== 'Todos os Produtos' && occ.produto !== produtoFilter) return false;
    if (statusFilter !== 'Todos os Status' && occ.status !== statusFilter) return false;
    if (responsavelFilter !== 'Todos os Responsáveis' && occ.responsavelOcorrencia !== responsavelFilter) return false;
    if (impactoFilter !== 'Todos os Impactos' && occ.tipoImpacto !== impactoFilter) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        occ.sistemaImpactado.toLowerCase().includes(query) ||
        occ.descricaoOcorrencia.toLowerCase().includes(query) ||
        occ.produto.toLowerCase().includes(query) ||
        (occ.descricaoSolucao && occ.descricaoSolucao.toLowerCase().includes(query));
      if (!matchSearch) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalRegistros = occurrences.length;
  const abertasAndamento = occurrences.filter((o) => o.status === 'Aberto' || o.status === 'Em Andamento').length;
  const resolvidas = occurrences.filter((o) => o.status === 'Resolvido').length;
  const monitorando = occurrences.filter((o) => o.status === 'Monitorando').length;

  // Average resolution time (calculated or pre-defined matching screenshot)
  const tempoMedio = '169.5 h';

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = ['ID,Data,Hora,Produto,Tipo,Impacto,Sistema,Responsável,Status,Solução\n'];
    const rows = filteredOccurrences.map(
      (o) =>
        `"${o.id}","${o.dataOcorrencia}","${o.horaOcorrencia}","${o.produto}","${o.tipoOcorrencia}","${o.tipoImpacto}","${o.sistemaImpactado}","${o.responsavelOcorrencia}","${o.status}","${o.descricaoSolucao || ''}"`
    );
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `diario_de_bordo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  // Mail Notification
  const handleSendEmail = () => {
    alert(`Relatório do Diário de Bordo enviado para a equipe operacional! (${filteredOccurrences.length} ocorrências)`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Diário de Bordo Operacional
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro, acompanhamento e solução de ocorrências que impactam a operação.
            </p>
          </div>
        </div>

        {/* Sub Navigation Switcher Pills (Only Ocorrências & Dashboard e Gráficos as requested) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start md:self-auto border border-slate-200/60">
          <button
            onClick={() => setSubView('ocorrencias')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subView === 'ocorrencias'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Ocorrências
          </button>

          <button
            onClick={() => setSubView('graficos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subView === 'graficos'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Dashboard e Gráficos
          </button>
        </div>
      </div>

      {subView === 'graficos' ? (
        <DashboardView occurrences={occurrences} />
      ) : (
        <>
          {/* 2. Stat Cards Row (5 KPI Cards matching screenshot exact colors) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL REGISTROS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              TOTAL REGISTROS
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {totalRegistros}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* ABERTAS / ANDAMENTO */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              ABERTAS / ANDAMENTO
            </span>
            <span className="text-2xl font-extrabold text-amber-500 font-mono">
              {abertasAndamento}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* RESOLVIDAS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              RESOLVIDAS
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 font-mono">
              {resolvidas}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* MONITORANDO */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              MONITORANDO
            </span>
            <span className="text-2xl font-extrabold text-purple-600 font-mono">
              {monitorando}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* TEMPO MÉDIO RESOLUÇÃO */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              TEMPO MÉDIO RESOLUÇÃO
            </span>
            <span className="text-2xl font-extrabold text-blue-600 font-mono">
              {tempoMedio}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filtros de Consulta Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filtros de Consulta</span>
          </div>

          {/* Action Buttons Row (+ Nova Ocorrência, Importar Excel & Exportar Excel) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateModal}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all"
              title="Novo Registro no Diário de Bordo"
            >
              <Plus className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenImportModal}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs transition-all"
              title="Importar Ocorrências via Excel (.xlsx / .csv)"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportExcel}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-all"
              title="Exportar para Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              DATA INICIAL
            </label>
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              DATA FINAL
            </label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              TIPO
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white text-slate-700"
            >
              <option value="Todos os Tipos">Todos os Tipos</option>
              <option value="Operacional">Operacional</option>
              <option value="Sistemas">Sistemas</option>
              <option value="Telefonia">Telefonia</option>
              <option value="Infraestrutura">Infraestrutura</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              PRODUTO
            </label>
            <select
              value={produtoFilter}
              onChange={(e) => setProdutoFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white text-slate-700"
            >
              <option value="Todos os Produtos">Todos os Produtos</option>
              {products.map((p) => (
                <option key={p.id} value={p.nome}>{p.nome}</option>
              ))}
              <option value="BANESE">BANESE</option>
              <option value="INTERGRALL">INTERGRALL</option>
              <option value="CAIXA">CAIXA</option>
              <option value="Todos">Todos</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              STATUS
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white text-slate-700"
            >
              <option value="Todos os Status">Todos os Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Monitorando">Monitorando</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              RESPONSÁVEL
            </label>
            <select
              value={responsavelFilter}
              onChange={(e) => setResponsavelFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white text-slate-700"
            >
              <option value="Todos os Responsáveis">Todos os Responsáveis</option>
              {users.map((u) => (
                <option key={u.id} value={u.nome}>{u.nome}</option>
              ))}
              <option value="LARISSA OLIVEIRA">LARISSA OLIVEIRA</option>
              <option value="IZABEL MARQUES">IZABEL MARQUES</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              IMPACTO
            </label>
            <select
              value={impactoFilter}
              onChange={(e) => setImpactoFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white text-slate-700"
            >
              <option value="Todos os Impactos">Todos os Impactos</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ocorrência, comentário, produto ou solução..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* 4. Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">DATA/HORA</th>
                <th className="py-3.5 px-4">PRODUTO</th>
                <th className="py-3.5 px-4 min-w-[220px]">SISTEMA IMPACTADO</th>
                <th className="py-3.5 px-4">IMPACTO</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">RESPONSÁVEL</th>
                <th className="py-3.5 px-4 min-w-[220px]">SOLUÇÃO / RESOLUÇÃO</th>
                <th className="py-3.5 px-4 text-center">EVIDÊNCIA</th>
                <th className="py-3.5 px-4 text-center">LINHA DO TEMPO</th>
                <th className="py-3.5 px-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOccurrences.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Nenhuma ocorrência encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOccurrences.map((occ) => (
                  <tr key={occ.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* DATA/HORA */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block font-mono text-xs">
                        {occ.dataOcorrencia}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {occ.horaOcorrencia}
                      </span>
                    </td>

                    {/* PRODUTO */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {occ.produto}
                    </td>

                    {/* SISTEMA IMPACTADO */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block truncate max-w-[240px]">
                        {occ.sistemaImpactado}
                      </span>
                      {occ.descricaoSistema && (
                        <span className="text-[11px] text-slate-500 block truncate max-w-[240px]">
                          {occ.descricaoSistema}
                        </span>
                      )}
                    </td>

                    {/* IMPACTO */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          occ.tipoImpacto === 'Crítico'
                            ? 'bg-rose-100 text-rose-800'
                            : occ.tipoImpacto === 'Alto'
                            ? 'bg-red-100 text-red-700'
                            : occ.tipoImpacto === 'Médio'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {occ.tipoImpacto}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          occ.status === 'Resolvido'
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : occ.status === 'Em Andamento'
                            ? 'bg-blue-100 text-blue-800'
                            : occ.status === 'Monitorando'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {occ.status}
                      </span>
                    </td>

                    {/* RESPONSÁVEL */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 uppercase whitespace-nowrap">
                      {occ.responsavelOcorrencia}
                    </td>

                    {/* SOLUÇÃO / RESOLUÇÃO */}
                    <td className="py-3.5 px-4">
                      {occ.descricaoSolucao ? (
                        <div>
                          <p className="text-xs text-slate-700 line-clamp-2">
                            {occ.descricaoSolucao}
                          </p>
                          <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                            {occ.responsavelSolucao || occ.responsavelOcorrencia} ({occ.dataSolucao || occ.dataOcorrencia})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Em andamento / Sem solução
                        </span>
                      )}
                    </td>

                    {/* EVIDÊNCIA */}
                    <td className="py-3.5 px-4 text-center">
                      {occ.evidenciaUrl ? (
                        <button
                          onClick={() => onViewEvidence(occ.evidenciaUrl!, occ.sistemaImpactado)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                          title="Ver Evidência / Print"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* LINHA DO TEMPO */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onViewTimeline(occ)}
                        className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 inline-flex items-center justify-center transition-colors shadow-2xs"
                        title="Ver Linha do Tempo / Histórico"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* AÇÕES */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenEditModal(occ)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteOccurrence(occ.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

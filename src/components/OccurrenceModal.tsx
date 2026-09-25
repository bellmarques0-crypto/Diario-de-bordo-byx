import React, { useState, useEffect } from 'react';
import { X, BookOpen, Check, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Occurrence, Product, User } from '../types';

interface OccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (occurrenceData: Partial<Occurrence>) => Promise<void>;
  editingOccurrence?: Occurrence | null;
  products: Product[];
  users: User[];
}

export const OccurrenceModal: React.FC<OccurrenceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingOccurrence,
  products,
  users
}) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'solucao'>('dados');
  const [loading, setLoading] = useState(false);

  // Form State
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [horaOcorrencia, setHoraOcorrencia] = useState('');
  const [produto, setProduto] = useState('BANESE');
  const [tipoOcorrencia, setTipoOcorrencia] = useState('Operacional');
  const [tipoImpacto, setTipoImpacto] = useState<'Baixo' | 'Médio' | 'Alto' | 'Crítico'>('Médio');
  const [sistemaImpactado, setSistemaImpactado] = useState('');
  const [responsavelOcorrencia, setResponsavelOcorrencia] = useState('IZABEL MARQUES');
  const [status, setStatus] = useState<'Aberto' | 'Em Andamento' | 'Resolvido' | 'Monitorando'>('Aberto');
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState('');
  const [evidenciaUrl, setEvidenciaUrl] = useState<string | null>(null);

  // Solution Fields
  const [dataSolucao, setDataSolucao] = useState('');
  const [horaSolucao, setHoraSolucao] = useState('');
  const [responsavelSolucao, setResponsavelSolucao] = useState('IZABEL MARQUES');
  const [descricaoSolucao, setDescricaoSolucao] = useState('');

  useEffect(() => {
    if (editingOccurrence) {
      setDataOcorrencia(editingOccurrence.dataOcorrencia);
      setHoraOcorrencia(editingOccurrence.horaOcorrencia);
      setProduto(editingOccurrence.produto);
      setTipoOcorrencia(editingOccurrence.tipoOcorrencia);
      setTipoImpacto(editingOccurrence.tipoImpacto);
      setSistemaImpactado(editingOccurrence.sistemaImpactado);
      setResponsavelOcorrencia(editingOccurrence.responsavelOcorrencia);
      setStatus(editingOccurrence.status);
      setDescricaoOcorrencia(editingOccurrence.descricaoOcorrencia || '');
      setEvidenciaUrl(editingOccurrence.evidenciaUrl || null);

      setDataSolucao(editingOccurrence.dataSolucao || '');
      setHoraSolucao(editingOccurrence.horaSolucao || '');
      setResponsavelSolucao(editingOccurrence.responsavelSolucao || editingOccurrence.responsavelOcorrencia || 'IZABEL MARQUES');
      setDescricaoSolucao(editingOccurrence.descricaoSolucao || '');
    } else {
      const now = new Date();
      setDataOcorrencia(now.toISOString().split('T')[0]);
      setHoraOcorrencia(now.toTimeString().slice(0, 5));
      setProduto(products[0]?.nome || 'BANESE');
      setTipoOcorrencia('Operacional');
      setTipoImpacto('Médio');
      setSistemaImpactado('');
      setResponsavelOcorrencia(users[0]?.nome || 'IZABEL MARQUES');
      setStatus('Aberto');
      setDescricaoOcorrencia('');
      setEvidenciaUrl(null);

      setDataSolucao('');
      setHoraSolucao('');
      setResponsavelSolucao(users[0]?.nome || 'IZABEL MARQUES');
      setDescricaoSolucao('');
    }
    setActiveTab('dados');
  }, [editingOccurrence, isOpen, products, users]);

  // Handle Ctrl+V paste event for screenshot attachment
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setEvidenciaUrl(event.target?.result as string);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEvidenciaUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({
        dataOcorrencia,
        horaOcorrencia,
        produto,
        tipoOcorrencia,
        tipoImpacto,
        sistemaImpactado,
        responsavelOcorrencia,
        status,
        descricaoOcorrencia,
        evidenciaUrl,
        dataSolucao: dataSolucao || (status === 'Resolvido' ? dataOcorrencia : null),
        horaSolucao: horaSolucao || (status === 'Resolvido' ? horaOcorrencia : null),
        responsavelSolucao: responsavelSolucao || responsavelOcorrencia,
        descricaoSolucao: descricaoSolucao || null
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 border border-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {editingOccurrence ? 'Editar Registro no Diário de Bordo' : 'Novo Registro no Diário de Bordo'}
              </h3>
              <p className="text-xs text-slate-500">
                Preencha as informações detalhadas da ocorrência operacional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="border-b border-slate-200 px-6 flex gap-8 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'dados'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Dados da Ocorrência
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('solucao')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'solucao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Solução e Resolução
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
            {activeTab === 'dados' && (
              <>
                {/* Row 1: Data & Hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Data da Ocorrência *
                    </label>
                    <input
                      type="date"
                      required
                      value={dataOcorrencia}
                      onChange={(e) => setDataOcorrencia(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Hora da Ocorrência *
                    </label>
                    <input
                      type="time"
                      required
                      value={horaOcorrencia}
                      onChange={(e) => setHoraOcorrencia(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Produto & Impacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Produto *
                    </label>
                    <input
                      type="text"
                      required
                      list="products-list"
                      placeholder="Ex: BANESE, INTERGRALL"
                      value={produto}
                      onChange={(e) => setProduto(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                    <datalist id="products-list">
                      {products.map((p) => (
                        <option key={p.id} value={p.nome} />
                      ))}
                      <option value="BANESE" />
                      <option value="INTERGRALL" />
                      <option value="CAIXA" />
                      <option value="Todos" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tipo de Impacto *
                    </label>
                    <select
                      value={tipoImpacto}
                      onChange={(e) => setTipoImpacto(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    >
                      <option value="Baixo">Baixo</option>
                      <option value="Médio">Médio</option>
                      <option value="Alto">Alto</option>
                      <option value="Crítico">Crítico</option>
                    </select>
                  </div>
                </div>

                {/* Sistema Impactado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sistema Impactado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: INSTABILIDADE INTERGRALL, Telefonia..."
                    value={sistemaImpactado}
                    onChange={(e) => setSistemaImpactado(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>

                {/* Responsável & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Responsável pela Ocorrência *
                    </label>
                    <input
                      type="text"
                      required
                      list="users-list"
                      placeholder="Ex: LARISSA OLIVEIRA"
                      value={responsavelOcorrencia}
                      onChange={(e) => setResponsavelOcorrencia(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                    <datalist id="users-list">
                      {users.map((u) => (
                        <option key={u.id} value={u.nome} />
                      ))}
                      <option value="LARISSA OLIVEIRA" />
                      <option value="IZABEL MARQUES" />
                      <option value="CARLOS SILVA" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Monitorando">Monitorando</option>
                    </select>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Descrição da Ocorrência
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {descricaoOcorrencia.length}/2000 caracteres
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    placeholder="Descreva os detalhes da ocorrência..."
                    value={descricaoOcorrencia}
                    onChange={(e) => setDescricaoOcorrencia(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
                  />
                </div>

                {/* Evidência / Print */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Evidência de Print / Anexo (Cole Ctrl+V ou selecione o arquivo)
                  </label>
                  {evidenciaUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 p-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={evidenciaUrl}
                          alt="Evidência"
                          className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800 block">Print / Anexo Carregado</span>
                          <span className="text-slate-500 text-[11px]">Pronto para envio</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvidenciaUrl(null)}
                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-blue-600">
                        Clique para selecionar arquivo ou cole com <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-[11px]">Ctrl + V</code>
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        PNG, JPG ou WebP até 10MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </>
            )}

            {activeTab === 'solucao' && (
              <>
                {/* Solution Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Orientações de Solução</span>
                    Registre a solução definitiva ou contorno para a ocorrência operacional. Ao salvar com a solução, altere o status para <strong>Resolvido</strong>.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Data da Solução
                    </label>
                    <input
                      type="date"
                      value={dataSolucao}
                      onChange={(e) => setDataSolucao(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Hora da Solução
                    </label>
                    <input
                      type="time"
                      value={horaSolucao}
                      onChange={(e) => setHoraSolucao(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Responsável pela Solução
                  </label>
                  <input
                    type="text"
                    list="users-list-solucao"
                    placeholder="Ex: IZABEL MARQUES"
                    value={responsavelSolucao}
                    onChange={(e) => setResponsavelSolucao(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                  <datalist id="users-list-solucao">
                    {users.map((u) => (
                      <option key={u.id} value={u.nome} />
                    ))}
                    <option value="IZABEL MARQUES" />
                    <option value="LARISSA OLIVEIRA" />
                    <option value="CARLOS SILVA" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Descrição da Solução Aplicada
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descreva detalhadamente a ação corretiva adotada..."
                    value={descricaoSolucao}
                    onChange={(e) => setDescricaoSolucao(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Salvando...' : editingOccurrence ? 'Salvar Alterações' : 'Cadastrar Ocorrência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle, Download, FileCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Occurrence } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (occurrences: Partial<Occurrence>[]) => Promise<void>;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Partial<Occurrence>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseExcelDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
      // Excel serial date number
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    const str = String(val).trim();
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
      return str.split(' ')[0];
    }
    if (str.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      const [d, m, y] = str.split('/');
      return `${y}-${m}-${d}`;
    }
    return str;
  };

  const parseExcelTime = (val: any): string => {
    if (!val) return '00:00';
    if (typeof val === 'number') {
      const totalSeconds = Math.round(val * 86400);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    const str = String(val).trim();
    if (str.match(/^\d{2}:\d{2}/)) {
      return str.substring(0, 5);
    }
    return str;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (json.length === 0) {
          setErrorMsg('O arquivo está vazio ou não possui linhas válidas.');
          setParsedData([]);
          return;
        }

        // Map column names flexibly matching screenshot columns
        const mappedRows: Partial<Occurrence>[] = json.map((row) => {
          // Find key by fuzzy matching header names
          const getKey = (...names: string[]) => {
            const found = Object.keys(row).find((k) =>
              names.some((n) => k.toLowerCase().trim().includes(n.toLowerCase()))
            );
            return found ? row[found] : '';
          };

          const rawId = getKey('id');
          const rawTipo = getKey('tipo');
          const rawDataOcc = getKey('data ocorrência', 'data ocorri', 'data_ocorrencia', 'dataocorrencia');
          const rawHoraOcc = getKey('hora ocorrência', 'hora ocorri', 'hora_ocorrencia', 'horaocorrencia');
          const rawProduto = getKey('produto');
          const rawOcorrencia = getKey('ocorrência', 'ocorrencia', 'sistema');
          const rawTipoImpacto = getKey('tipo de im', 'impacto', 'tipo_impacto');
          const rawStatus = getKey('status');
          const rawResponsavel = getKey('responsáv', 'responsavel');
          const rawComentarios = getKey('comentári', 'comentario', 'descrição', 'descricao');
          const rawDataSolucao = getKey('data soluç', 'data solucao', 'data_solucao');
          const rawHoraSolucao = getKey('hora soluç', 'hora solucao', 'hora_solucao');
          const rawResponsavelSolucao = getKey('responsáv soluç', 'responsavel solucao', 'responsavel_solucao');
          const rawSolucao = getKey('solução', 'solucao');
          const rawDataCadastro = getKey('data cadastro', 'data_cadastro', 'data_criacao');

          return {
            id: rawId ? String(rawId) : undefined,
            tipoOcorrencia: rawTipo || 'Operacional',
            dataOcorrencia: parseExcelDate(rawDataOcc) || new Date().toISOString().split('T')[0],
            horaOcorrencia: parseExcelTime(rawHoraOcc),
            produto: rawProduto || 'Todos',
            sistemaImpactado: rawOcorrencia || 'Sistema Operacional',
            tipoImpacto: rawTipoImpacto || 'Médio',
            status: rawStatus || 'Aberto',
            responsavelOcorrencia: rawResponsavel || 'SISTEMA',
            descricaoOcorrencia: rawComentarios || rawOcorrencia || 'Sem descrição',
            dataSolucao: rawDataSolucao ? parseExcelDate(rawDataSolucao) : undefined,
            horaSolucao: rawHoraSolucao ? parseExcelTime(rawHoraSolucao) : undefined,
            responsavelSolucao: rawResponsavelSolucao || undefined,
            descricaoSolucao: rawSolucao || undefined,
            dataCriacao: rawDataCadastro ? String(rawDataCadastro) : new Date().toISOString()
          };
        });

        setParsedData(mappedRows);
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Erro ao ler arquivo Excel. Verifique se o formato está correto.');
      }
    };
    reader.readAsBinaryString(selected);
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;
    setIsLoading(true);
    try {
      await onImport(parsedData);
      onClose();
    } catch (err) {
      setErrorMsg('Falha ao importar dados para o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        ID: 77,
        Tipo: 'Operacional',
        'Data Ocorrência': '2026-09-24',
        'Hora Ocorrência': '09:35',
        Produto: 'Todos',
        Ocorrência: 'INSTABILIDADE',
        'Tipo de Impacto': 'Médio',
        Status: 'Resolvido',
        Responsável: 'LARISSA GONÇALVES',
        Comentários: 'Intergrall timeout na consulta',
        'Data Solução': '2026-09-24',
        'Hora Solução': '09:59',
        'Responsável Solução': 'LARISSA GONÇALVES',
        Solução: 'Resolvido após restart no serviço',
        'Usuário Registro': 'LARISSA GONÇALVES',
        'Data Cadastro': '24/09/2026 10:00:01'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo_Ocorrencias');
    XLSX.writeFile(wb, 'Modelo_Importacao_Diario_de_Bordo.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Importar Ocorrências via Excel / CSV
              </h2>
              <p className="text-xs text-slate-500">
                Suba sua planilha de ocorrências para carregar os registros em lote.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Instructions & Template Download */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-900 block">
                Colunas Suportadas no Arquivo Excel:
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                ID, Tipo, Data Ocorrência, Hora Ocorrência, Produto, Ocorrência, Tipo de Impacto, Status, Responsável, Comentários, Data Solução, Hora Solução, Responsável Solução, Solução, Usuário Registro, Data Cadastro.
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Modelo Excel
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer group">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 flex items-center justify-center shadow-xs transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">
                  {file ? file.name : 'Clique para selecionar ou arraste o arquivo Excel/CSV'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Suporta arquivos .xlsx, .xls e .csv
                </span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Pré-visualização ({parsedData.length} ocorrências identificadas)
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Data/Hora</th>
                      <th className="py-2.5 px-3">Produto</th>
                      <th className="py-2.5 px-3">Sistema</th>
                      <th className="py-2.5 px-3">Impacto</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.map((occ, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{occ.id || '#'}</td>
                        <td className="py-2 px-3 whitespace-nowrap">{occ.dataOcorrencia} {occ.horaOcorrencia}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{occ.produto}</td>
                        <td className="py-2 px-3 max-w-[150px] truncate">{occ.sistemaImpactado}</td>
                        <td className="py-2 px-3">{occ.tipoImpacto}</td>
                        <td className="py-2 px-3 font-semibold text-emerald-700">{occ.status}</td>
                        <td className="py-2 px-3">{occ.responsavelOcorrencia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedData.length === 0 || isLoading}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            {isLoading ? (
              'Importando...'
            ) : (
              <>
                <Check className="w-4 h-4" /> Importar {parsedData.length} Ocorrência(s)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

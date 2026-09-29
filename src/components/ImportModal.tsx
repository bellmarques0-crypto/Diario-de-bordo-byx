import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle, Download, FileCheck, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Occurrence } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (occurrences: Partial<Occurrence>[]) => Promise<void>;
}

const MAPPING_FIELDS = [
  { key: 'id', label: 'ID da Ocorrência', required: false },
  { key: 'dataOcorrencia', label: 'Data da Ocorrência', required: true },
  { key: 'horaOcorrencia', label: 'Hora da Ocorrência', required: true },
  { key: 'produto', label: 'Produto / Serviço', required: true },
  { key: 'sistemaImpactado', label: 'Sistema Impactado', required: true },
  { key: 'descricaoSistema', label: 'Descrição do Sistema', required: false },
  { key: 'tipoImpacto', label: 'Tipo de Impacto (Baixo/Médio/Alto/Crítico)', required: true },
  { key: 'status', label: 'Status (Aberto/Resolvido/etc.)', required: true },
  { key: 'responsavelOcorrencia', label: 'Responsável', required: true },
  { key: 'descricaoOcorrencia', label: 'Descrição / Comentários', required: false },
  { key: 'evidenciaUrl', label: 'URL da Evidência / Print', required: false },
  { key: 'dataSolucao', label: 'Data da Solução', required: false },
  { key: 'horaSolucao', label: 'Hora da Solução', required: false },
  { key: 'responsavelSolucao', label: 'Responsável da Solução', required: false },
  { key: 'descricaoSolucao', label: 'Descrição da Solução', required: false },
];

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawJson, setRawJson] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [parsedData, setParsedData] = useState<Partial<Occurrence>[]>([]);
  const [showMappingPanel, setShowMappingPanel] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseExcelDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
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

  const autoDetectMapping = (headers: string[]) => {
    const findHeader = (exactList: string[], fuzzyList: string[]) => {
      for (const target of exactList) {
        const found = headers.find((h) => h.trim().toLowerCase() === target.toLowerCase());
        if (found) return found;
      }
      for (const sub of fuzzyList) {
        const found = headers.find((h) => h.trim().toLowerCase().includes(sub.toLowerCase()));
        if (found) return found;
      }
      return '';
    };

    const initialMapping: Record<string, string> = {
      id: findHeader(['ID', 'id', 'Código'], ['id']),
      tipoOcorrencia: findHeader(['Tipo Ocorrência', 'Tipo Ocorrencia', 'Tipo'], ['tipo']),
      dataOcorrencia: findHeader(['Data Ocorrência', 'Data Ocorrencia', 'Data'], ['data ocorr', 'data_ocor']),
      horaOcorrencia: findHeader(['Hora Ocorrência', 'Hora Ocorrencia', 'Hora'], ['hora ocorr', 'hora_ocor']),
      produto: findHeader(['Produto', 'produto'], ['produt']),
      sistemaImpactado: findHeader(['Sistema Impactado', 'Sistema', 'sistema'], ['sistema impact']),
      descricaoSistema: findHeader(['Descrição do Sistema', 'Descricao do Sistema'], ['descrição do sistema', 'descricao do sistema']),
      tipoImpacto: findHeader(['Tipo de Impacto', 'Impacto'], ['impacto']),
      status: findHeader(['Status', 'Estado'], ['status']),
      responsavelOcorrencia: findHeader(['Responsável Ocorrência', 'Responsável', 'Responsavel'], ['responsável', 'responsavel']),
      descricaoOcorrencia: findHeader(['Descrição da Ocorrência', 'Comentários', 'Descrição'], ['comentá', 'descrição da ocorr']),
      evidenciaUrl: findHeader(['URL Evidência', 'Evidência', 'Print'], ['evidênc']),
      dataSolucao: findHeader(['Data Solução'], ['data soluç']),
      horaSolucao: findHeader(['Hora Solução'], ['hora soluç']),
      responsavelSolucao: findHeader(['Responsável Solução'], ['responsável soluç']),
      descricaoSolucao: findHeader(['Descrição da Solução', 'Solução'], ['solução'])
    };

    setColumnMapping(initialMapping);
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
        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

        if (json.length === 0) {
          setErrorMsg('O arquivo está vazio ou não possui linhas válidas.');
          setRawJson([]);
          setExcelHeaders([]);
          setParsedData([]);
          return;
        }

        const headers = Object.keys(json[0] || {});
        setExcelHeaders(headers);
        setRawJson(json);
        autoDetectMapping(headers);
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Erro ao ler arquivo Excel. Verifique se o formato está correto.');
      }
    };
    reader.readAsBinaryString(selected);
  };

  // Re-compute parsedData whenever rawJson or columnMapping changes
  useEffect(() => {
    if (rawJson.length === 0) {
      setParsedData([]);
      return;
    }

    const mapped = rawJson.map((row) => {
      const getVal = (fieldKey: string) => {
        const colName = columnMapping[fieldKey];
        if (!colName || row[colName] === undefined || row[colName] === null) return '';
        return String(row[colName]).trim();
      };

      const rawDataOcc = getVal('dataOcorrencia');
      const rawHoraOcc = getVal('horaOcorrencia');
      const rawDataSol = getVal('dataSolucao');
      const rawHoraSol = getVal('horaSolucao');

      const sysName = getVal('sistemaImpactado');
      const sysDesc = getVal('descricaoSistema');

      return {
        id: getVal('id') || undefined,
        tipoOcorrencia: getVal('tipoOcorrencia') || 'Operacional',
        dataOcorrencia: parseExcelDate(rawDataOcc) || new Date().toISOString().split('T')[0],
        horaOcorrencia: parseExcelTime(rawHoraOcc),
        produto: getVal('produto') || 'Todos',
        sistemaImpactado: sysName || 'Sistema Operacional',
        descricaoSistema: sysDesc || undefined,
        tipoImpacto: (getVal('tipoImpacto') || 'Médio') as any,
        status: (getVal('status') || 'Aberto') as any,
        responsavelOcorrencia: getVal('responsavelOcorrencia') || 'SISTEMA',
        descricaoOcorrencia: getVal('descricaoOcorrencia') || sysDesc || 'Sem descrição',
        evidenciaUrl: getVal('evidenciaUrl') || null,
        dataSolucao: rawDataSol ? parseExcelDate(rawDataSol) : undefined,
        horaSolucao: rawHoraSol ? parseExcelTime(rawHoraSol) : undefined,
        responsavelSolucao: getVal('responsavelSolucao') || undefined,
        descricaoSolucao: getVal('descricaoSolucao') || undefined,
        dataCriacao: getVal('dataCriacao') || new Date().toISOString()
      };
    });

    setParsedData(mapped);
  }, [rawJson, columnMapping]);

  const handleMappingChange = (fieldKey: string, excelColName: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [fieldKey]: excelColName
    }));
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
        'ID': '101',
        'Tipo Ocorrência': 'Operacional',
        'Data Ocorrência': '2026-09-24',
        'Hora Ocorrência': '09:35',
        'Produto': 'INTERGRALL',
        'Sistema Impactado': 'INSTABILIDADE INTERGRALL',
        'Descrição do Sistema': 'Intergrall teve uma queda temporária na rota de integração de dados.',
        'Tipo de Impacto': 'Médio',
        'Status': 'Resolvido',
        'Responsável Ocorrência': 'LARISSA OLIVEIRA',
        'Descrição da Ocorrência': 'Verificada perda de pacotes na API de transmissão durante a rotina matutina.',
        'URL Evidência': 'https://exemplo.com/evidencia.png',
        'Data Solução': '2026-09-24',
        'Hora Solução': '11:20',
        'Responsável Solução': 'LARISSA OLIVEIRA',
        'Descrição da Solução': 'Resolvido sem necessidade de intervenção técnica prolongada. Rota reestabelecida.',
        'Usuário Registro': 'LARISSA OLIVEIRA',
        'Data Cadastro': '2026-09-24 09:35:00'
      },
      {
        'ID': '102',
        'Tipo Ocorrência': 'Sistemas',
        'Data Ocorrência': '2026-09-23',
        'Hora Ocorrência': '14:10',
        'Produto': 'BANESE',
        'Sistema Impactado': 'PIX FORA DO AR',
        'Descrição do Sistema': 'Serviço de liquidação PIX indisponível.',
        'Tipo de Impacto': 'Alto',
        'Status': 'Aberto',
        'Responsável Ocorrência': 'IZABEL MARQUES',
        'Descrição da Ocorrência': 'Instabilidade no gateway de pagamentos enviando timeout de resposta.',
        'URL Evidência': '',
        'Data Solução': '',
        'Hora Solução': '',
        'Responsável Solução': '',
        'Descrição da Solução': '',
        'Usuário Registro': 'IZABEL MARQUES',
        'Data Cadastro': '2026-09-23 14:10:00'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 16 }, // Tipo Ocorrência
      { wch: 15 }, // Data Ocorrência
      { wch: 15 }, // Hora Ocorrência
      { wch: 15 }, // Produto
      { wch: 26 }, // Sistema Impactado
      { wch: 35 }, // Descrição do Sistema
      { wch: 15 }, // Tipo de Impacto
      { wch: 14 }, // Status
      { wch: 22 }, // Responsável Ocorrência
      { wch: 45 }, // Descrição da Ocorrência
      { wch: 30 }, // URL Evidência
      { wch: 15 }, // Data Solução
      { wch: 14 }, // Hora Solução
      { wch: 22 }, // Responsável Solução
      { wch: 45 }, // Descrição da Solução
      { wch: 22 }, // Usuário Registro
      { wch: 20 }  // Data Cadastro
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Diario_de_Bordo');
    XLSX.writeFile(wb, 'Template_Importacao_Diario_de_Bordo.xlsx');
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
                Template de Importação com Todas as Colunas (15 Colunas):
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                ID, Tipo Ocorrência, Data Ocorrência, Hora Ocorrência, Produto, Sistema Impactado, Descrição do Sistema, Tipo de Impacto, Status, Responsável Ocorrência, Descrição da Ocorrência, URL Evidência, Data Solução, Hora Solução, Responsável Solução, Descrição da Solução.
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" /> Baixar Template (.xlsx)
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

          {/* Column Mapping Panel (De / Para) */}
          {excelHeaders.length > 0 && (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setShowMappingPanel(!showMappingPanel)}
                className="w-full p-4 flex items-center justify-between bg-slate-100/70 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Relacionar Colunas da Planilha (Mapeamento De / Para)
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {excelHeaders.length} colunas encontradas
                  </span>
                </div>
                {showMappingPanel ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showMappingPanel && (
                <div className="p-4 border-t border-slate-200/60 space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Confirme qual coluna da sua planilha corresponde a cada campo do sistema:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MAPPING_FIELDS.map((field) => (
                      <div key={field.key} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 gap-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 min-w-[140px]">
                          <span>{field.label}</span>
                          {field.required && <span className="text-rose-500 font-bold">*</span>}
                        </label>
                        <select
                          value={columnMapping[field.key] || ''}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium flex-1 max-w-[200px]"
                        >
                          <option value="">--(Não Mapear)--</option>
                          {excelHeaders.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        <td className="py-2 px-3 max-w-[150px] truncate font-bold text-blue-700">{occ.sistemaImpactado}</td>
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

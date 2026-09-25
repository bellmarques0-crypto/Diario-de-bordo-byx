import React, { useEffect, useState } from 'react';
import { X, History, Clock, User, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Occurrence, TimelineEvent } from '../types';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  occurrence: Occurrence | null;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  occurrence
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (occurrence && isOpen) {
      setLoading(true);
      fetch(`/api/occurrences/${occurrence.id}/timeline`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            setEvents([]);
          }
        })
        .catch(() => setEvents([]))
        .finally(() => setLoading(false));
    }
  }, [occurrence, isOpen]);

  if (!isOpen || !occurrence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Linha do Tempo e Histórico
              </h3>
              <p className="text-xs text-slate-500">
                Ocorrência: <span className="font-semibold text-slate-800">{occurrence.sistemaImpactado}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Carregando histórico...</div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Nenhum registro histórico adicional encontrado para esta ocorrência.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {events.map((evt, index) => (
                <div key={evt.id || index} className="relative pl-6">
                  {/* Dot */}
                  <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </span>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">{evt.acao}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(evt.dataHora).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs mb-2">{evt.detalhes}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {evt.autor}
                      </span>
                      {evt.statusNovo && (
                        <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                          Status: {evt.statusNovo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

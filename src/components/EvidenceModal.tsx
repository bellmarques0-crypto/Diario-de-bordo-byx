import React from 'react';
import { X, Image as ImageIcon, Download } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 my-8">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">
              Evidência / Print: {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex items-center justify-center bg-slate-950/90 max-h-[75vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Evidência"
            className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg border border-slate-800"
          />
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Formato original preservado</span>
          <a
            href={imageUrl}
            download="evidencia_ocorrencia.png"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Baixar Print
          </a>
        </div>
      </div>
    </div>
  );
};

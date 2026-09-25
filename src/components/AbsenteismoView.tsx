import React, { useState } from 'react';
import { UserCheck, UserX, Calendar, Plus, Clock, FileSpreadsheet } from 'lucide-react';
import { User } from '../types';

interface AbsenteismoViewProps {
  users: User[];
}

interface AbsenceRecord {
  id: string;
  usuario: string;
  data: string;
  tipo: 'Falta Justificada' | 'Falta Injustificada' | 'Atestado Médico' | 'Atraso';
  horas: string;
  motivo: string;
}

export const AbsenteismoView: React.FC<AbsenteismoViewProps> = ({ users }) => {
  const [records, setRecords] = useState<AbsenceRecord[]>([
    {
      id: 'abs_1',
      usuario: 'CARLOS SILVA',
      data: '2026-09-20',
      tipo: 'Atestado Médico',
      horas: '8h',
      motivo: 'Consulta médica emergencial com atestado homologado.'
    },
    {
      id: 'abs_2',
      usuario: 'FERNANDA SOUZA',
      data: '2026-09-22',
      tipo: 'Atraso',
      horas: '1h 30m',
      motivo: 'Problemas no transporte público.'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuario, setUsuario] = useState(users[0]?.nome || 'CARLOS SILVA');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<AbsenceRecord['tipo']>('Atestado Médico');
  const [horas, setHoras] = useState('8h');
  const [motivo, setMotivo] = useState('');

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: AbsenceRecord = {
      id: 'abs_' + Date.now(),
      usuario,
      data,
      tipo,
      horas,
      motivo
    };
    setRecords([newRec, ...records]);
    setIsModalOpen(false);
    setMotivo('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Controle de Absenteísmo e Presença
            </h2>
            <p className="text-xs text-slate-500">
              Registro de ausências, atestados médicos, atrasos e banco de horas da equipe.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Registrar Ausência / Atestado
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              TOTAL REGISTROS
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {records.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              ATESTADOS HOMOLOGADOS
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 font-mono">
              {records.filter((r) => r.tipo === 'Atestado Médico').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              ATRASOS / SAÍDAS
            </span>
            <span className="text-2xl font-extrabold text-amber-500 font-mono">
              {records.filter((r) => r.tipo === 'Atraso').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Usuário</th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4">Tipo de Ocorrência</th>
                <th className="py-3.5 px-4">Carga Horária</th>
                <th className="py-3.5 px-4">Motivo / Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{r.usuario}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{r.data}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.tipo === 'Atestado Médico'
                          ? 'bg-indigo-100 text-indigo-700'
                          : r.tipo === 'Atraso'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.tipo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{r.horas}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Absence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Registrar Ausência / Atestado</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleAddRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Colaborador / Usuário *</label>
                <select
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.nome}>{u.nome}</option>
                  ))}
                  <option value="CARLOS SILVA">CARLOS SILVA</option>
                  <option value="FERNANDA SOUZA">FERNANDA SOUZA</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo *</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Atestado Médico">Atestado Médico</option>
                    <option value="Falta Justificada">Falta Justificada</option>
                    <option value="Falta Injustificada">Falta Injustificada</option>
                    <option value="Atraso">Atraso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Carga Horária / Período *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 8h, 1h 30m"
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo / Observações</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre a ausência ou atestado..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

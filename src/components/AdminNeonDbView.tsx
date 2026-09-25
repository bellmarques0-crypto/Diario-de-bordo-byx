import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, Server, ShieldCheck, ArrowRight, Table, DatabaseZap } from 'lucide-react';
import { NeonDbStatus } from '../types';

export const AdminNeonDbView: React.FC = () => {
  const [status, setStatus] = useState<NeonDbStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionString, setConnectionString] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = () => {
    setLoading(true);
    fetch('/api/neon/status')
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionString) return;

    setLoading(true);
    setMessage(null);

    // Clean connection string parameters (like channel_binding=require)
    const cleanedString = connectionString
      .trim()
      .replace(/([?&])channel_binding=[^&]*(&|$)/gi, '$1')
      .replace(/\?&/g, '?')
      .replace(/&&/g, '&')
      .replace(/[?&]$/, '');

    try {
      const res = await fetch('/api/neon/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: cleanedString })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Conectado ao Neon DB com sucesso!' });
        fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao conectar com Neon DB.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Falha de comunicação ao conectar com o Neon DB. Verifique a URL.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/neon/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Sincronização com Neon DB concluída!' });
        fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro na sincronização.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Falha de comunicação no servidor.' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
              Integração Neon PostgreSQL
              {status?.isConnected && (
                <span className="text-[11px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Conectado
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Conexão com servidor de banco de dados PostgreSQL sem servidor (Neon Cloud DB).
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Status
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Status do Banco
          </span>
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <span
              className={`w-3 h-3 rounded-full ${
                status?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            {status?.isConnected ? 'Neon DB Ativo' : 'Armazenamento Local / Emulação'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {status?.isConnected
              ? 'Todas as gravações e leituras são direcionadas para o Neon DB.'
              : 'Execute com URL do Neon DB para persistência remota.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Servidor
          </span>
          <div className="text-sm font-semibold text-slate-900 font-mono truncate">
            {status?.connectionStringMasked || 'postgres://neon.tech/neondb'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            PostgreSQL v16 + SSL Enforced
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Registros Armazenados
          </span>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-3">
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-mono">
              {status?.recordCounts?.occurrences || 0} Ocorrências
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-mono">
              {status?.recordCounts?.users || 0} Usuários
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tabelas auto-criadas no Neon DB
          </p>
        </div>
      </div>

      {/* Form & Config Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <DatabaseZap className="w-5 h-5 text-emerald-600" />
            Configurar String de Conexão do Neon DB
          </h3>
          <p className="text-xs text-slate-500">
            Insira sua URL do Neon PostgreSQL para sincronizar as tabelas <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">occurrences</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">users</code> e <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">products</code>.
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              URL de Conexão Neon (PostgreSQL Connection String)
            </label>
            <input
              type="text"
              placeholder="postgresql://username:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !connectionString}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Server className="w-4 h-4" />
              {loading ? 'Conectando...' : 'Testar e Conectar com Neon DB'}
            </button>

            {status?.isConnected && (
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Dados em Lote'}
              </button>
            )}
          </div>
        </form>

        <div className="border-t border-slate-100 pt-5 text-xs text-slate-500 space-y-2">
          <span className="font-bold text-slate-800 block">Como obter sua string de conexão no Neon:</span>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
            <li>Acesse <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">https://neon.tech</a> e crie um projeto gratuito.</li>
            <li>No Dashboard do Neon, copie a linha de conexão com a opção <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">Pooled Connection</span> ou <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">Direct</span>.</li>
            <li>Cole a string no campo acima e clique em <strong>Testar e Conectar</strong>. As tabelas serão inicializadas automaticamente.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

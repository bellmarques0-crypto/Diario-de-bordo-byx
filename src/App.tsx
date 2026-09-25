import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { LogbookView } from './components/LogbookView';
import { OccurrenceModal } from './components/OccurrenceModal';
import { TimelineModal } from './components/TimelineModal';
import { EvidenceModal } from './components/EvidenceModal';
import { ImportModal } from './components/ImportModal';
import { AdminUsersView } from './components/AdminUsersView';
import { AdminNeonDbView } from './components/AdminNeonDbView';
import { AdminAccessView } from './components/AdminAccessView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { DashboardView } from './components/DashboardView';
import { SinalizacoesView } from './components/SinalizacoesView';
import { AbsenteismoView } from './components/AbsenteismoView';
import { Occurrence, User, Product, RoleProfile } from './types';
import { Package, Plus, Trash2, Edit3, Save, X, KeyRound, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('diario');
  const [adminSubTab, setAdminSubTab] = useState<string>('usuarios');
  const [logbookSubView, setLogbookSubView] = useState<'ocorrencias' | 'graficos'>('ocorrencias');

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const handleLogout = () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      setIsAuthenticated(false);
    }
  };

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const result = await safeJsonFetch('/api/users');

  if (!result.ok || !Array.isArray(result.data)) {
    alert('Não foi possível validar o acesso. Tente novamente.');
    return;
  }

  const user = result.data.find(
    (u: User) =>
      (u.usuario || '').trim().toLowerCase() === loginUser.trim().toLowerCase() &&
      u.senha === loginPass &&
      u.status === 'Ativo'
  );

  if (!user) {
    alert('Usuário ou senha inválidos.');
    return;
  }

  setIsAuthenticated(true);
  setLoginUser('');
  setLoginPass('');
};

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // App Data State
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [roles, setRoles] = useState<RoleProfile[]>([]);
  const [neonConnected, setNeonConnected] = useState<boolean>(false);

  // Modals
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);
  const [editingOccurrence, setEditingOccurrence] = useState<Occurrence | null>(null);

  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [timelineOccurrence, setTimelineOccurrence] = useState<Occurrence | null>(null);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceData, setEvidenceData] = useState<{ url: string; title: string } | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductStatus, setNewProductStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  const safeJsonFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (isJson) {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
      }
      const text = await res.text();
      return { ok: false, status: res.status, error: text || 'Resposta não-JSON do servidor' };
    } catch (err: any) {
      return { ok: false, status: 0, error: err.message || 'Falha na conexão de rede' };
    }
  };

  // Initial Data Fetching
  const fetchOccurrences = async () => {
    const result = await safeJsonFetch('/api/occurrences');
    if (result.ok && Array.isArray(result.data)) {
      setOccurrences(result.data);
    } else {
      console.warn('Ocorrências fetch:', result.error || result.data?.error);
    }
  };

  const fetchUsers = async () => {
    const result = await safeJsonFetch('/api/users');
    if (result.ok && Array.isArray(result.data)) {
      setUsers(result.data);
    } else {
      console.warn('Usuários fetch:', result.error || result.data?.error);
    }
  };

  const fetchProducts = async () => {
    const result = await safeJsonFetch('/api/products');
    if (result.ok && Array.isArray(result.data)) {
      setProducts(result.data);
    } else {
      console.warn('Produtos fetch:', result.error || result.data?.error);
    }
  };

  const fetchRoles = async () => {
    const result = await safeJsonFetch('/api/roles');
    if (result.ok && Array.isArray(result.data)) {
      setRoles(result.data);
    } else {
      console.warn('Roles fetch:', result.error || result.data?.error);
    }
  };

  const checkNeonStatus = async () => {
    const result = await safeJsonFetch('/api/neon/status');
    if (result.ok && result.data) {
      setNeonConnected(Boolean(result.data.isConnected));
    } else {
      setNeonConnected(false);
    }
  };

  useEffect(() => {
    fetchOccurrences();
    fetchUsers();
    fetchProducts();
    fetchRoles();
    checkNeonStatus();

    const interval = setInterval(() => {
      checkNeonStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Occurrences CRUD
  const handleSaveOccurrence = async (data: Partial<Occurrence>) => {
    if (editingOccurrence) {
      const res = await fetch(`/api/occurrences/${editingOccurrence.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchOccurrences();
      }
    } else {
      const res = await fetch('/api/occurrences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchOccurrences();
      }
    }
  };

  const handleDeleteOccurrence = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ocorrência do Diário de Bordo?')) {
      const res = await fetch(`/api/occurrences/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOccurrences(occurrences.filter((o) => o.id !== id));
      }
    }
  };

  const handleBatchImport = async (importedItems: Partial<Occurrence>[]) => {
    const res = await fetch('/api/occurrences/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importedItems)
    });
    if (res.ok) {
      fetchOccurrences();
    }
  };

  // Users CRUD
  const handleAddUser = async (userData: Omit<User, 'id' | 'dataCadastro'>) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (res.ok) {
      fetchUsers();
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (res.ok) {
      fetchUsers();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      }
    }
  };

  // Products CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;

    if (editingProduct) {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newProductName,
          codigo: newProductCode,
          status: newProductStatus
        })
      });
      if (res.ok) {
        setEditingProduct(null);
        setNewProductName('');
        setNewProductCode('');
        setNewProductStatus('Ativo');
        fetchProducts();
      }
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newProductName,
          codigo: newProductCode || 'PROD-' + Date.now().toString().slice(-3),
          status: newProductStatus
        })
      });
      if (res.ok) {
        setNewProductName('');
        setNewProductCode('');
        setNewProductStatus('Ativo');
        fetchProducts();
      }
    }
  };

  const handleStartEditProduct = (p: Product) => {
    setEditingProduct(p);
    setNewProductName(p.nome);
    setNewProductCode(p.codigo);
    setNewProductStatus(p.status);
  };

  const handleCancelEditProduct = () => {
    setEditingProduct(null);
    setNewProductName('');
    setNewProductCode('');
    setNewProductStatus('Ativo');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        if (editingProduct?.id === id) {
          handleCancelEditProduct();
        }
      }
    }
  };

  // Roles CRUD
  const handleAddRole = async (roleData: Omit<RoleProfile, 'id'>) => {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData)
    });
    if (res.ok) {
      fetchRoles();
    }
  };

  const handleUpdateRole = async (id: string, roleData: Partial<RoleProfile>) => {
    const res = await fetch(`/api/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData)
    });
    if (res.ok) {
      fetchRoles();
    }
  };

  const handleDeleteRole = async (id: string) => {
    const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRoles(roles.filter((r) => r.id !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-700/50 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <BookOpen className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Diário de Bordo
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sistema Operacional de Registro e Monitoramento
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Usuário / Operador
              </label>
<input
  type="text"
  name="login-user"
  autoComplete="username"
  value={loginUser}
  onChange={(e) => setLoginUser(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Senha de Acesso
              </label>
<input
  type="password"
  name="login-password"
  autoComplete="current-password"
  value={loginPass}
  onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 pt-2"
            >
              <span>Entrar no Sistema</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            Acesso Restrito — Controle de Ocorrências Operacionais
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminSubTab={adminSubTab}
        setAdminSubTab={setAdminSubTab}
        neonConnected={neonConnected}
        isDarkMode={isDarkMode}
        onToggleDarkMode={setIsDarkMode}
        onLogout={handleLogout}
        occurrences={occurrences}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && <DashboardView occurrences={occurrences} />}

        {/* TAB 2: SINALIZAÇÕES */}
        {activeTab === 'sinalizacoes' && <SinalizacoesView occurrences={occurrences} />}

        {/* TAB 3: DIÁRIO DE BORDO */}
        {activeTab === 'diario' && (
          <LogbookView
            occurrences={occurrences}
            products={products}
            users={users}
            onOpenCreateModal={() => {
              setEditingOccurrence(null);
              setIsOccurrenceModalOpen(true);
            }}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenEditModal={(occ) => {
              setEditingOccurrence(occ);
              setIsOccurrenceModalOpen(true);
            }}
            onDeleteOccurrence={handleDeleteOccurrence}
            onViewTimeline={(occ) => {
              setTimelineOccurrence(occ);
              setIsTimelineModalOpen(true);
            }}
            onViewEvidence={(url, title) => {
              setEvidenceData({ url, title });
              setIsEvidenceModalOpen(true);
            }}
            subView={logbookSubView}
            setSubView={setLogbookSubView}
          />
        )}

        {/* TAB 4: CONTROLE DE ABSENTEÍSMO */}
        {activeTab === 'absenteismo' && <AbsenteismoView users={users} />}

        {/* TAB 5: ADMINISTRAÇÃO */}
        {activeTab === 'administracao' && (
          <div className="space-y-6">
            {/* Admin Subtabs bar */}
            <div className="flex border-b border-slate-200 gap-6">
              <button
                onClick={() => setAdminSubTab('usuarios')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                  adminSubTab === 'usuarios'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cadastro de Usuários
              </button>

              <button
                onClick={() => setAdminSubTab('produtos')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                  adminSubTab === 'produtos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Produtos e Sistemas
              </button>

              <button
                onClick={() => setAdminSubTab('acessos')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                  adminSubTab === 'acessos'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Ajuste de Acessos
              </button>

              <button
                onClick={() => setAdminSubTab('config')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  adminSubTab === 'config'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Segurança & Preferências
              </button>

              <button
                onClick={() => setAdminSubTab('neon')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  adminSubTab === 'neon'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Banco de Dados Neon DB
                <span className={`w-2 h-2 rounded-full ${neonConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
              </button>
            </div>

            {/* Subtab Content */}
            {adminSubTab === 'usuarios' && (
              <AdminUsersView
                users={users}
                roles={roles}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {adminSubTab === 'acessos' && (
              <AdminAccessView
                roles={roles}
                onAddRole={handleAddRole}
                onUpdateRole={handleUpdateRole}
                onDeleteRole={handleDeleteRole}
              />
            )}

            {adminSubTab === 'config' && (
              <AdminSettingsView
                isDarkMode={isDarkMode}
                onToggleDarkMode={setIsDarkMode}
              />
            )}

            {adminSubTab === 'produtos' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">
                        Cadastro de Produtos & Sistemas
                      </h2>
                      <p className="text-xs text-slate-500">
                        Gerencie os produtos operacionais disponíveis para associação nas ocorrências.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Form */}
                  <form onSubmit={handleSaveProduct} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                      </h3>
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={handleCancelEditProduct}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Cancelar
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Produto *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: BANESE, INTERGRALL"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      {editingProduct ? (
                        <>
                          <Save className="w-4 h-4" /> Salvar Alterações
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Cadastrar Produto
                        </>
                      )}
                    </button>
                  </form>

                  {/* List */}
                  <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="py-3.5 px-4">Produto</th>
                          <th className="py-3.5 px-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.nome}</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleStartEditProduct(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Editar Produto"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Excluir Produto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminSubTab === 'neon' && <AdminNeonDbView />}
          </div>
        )}
      </main>

      {/* Modals */}
      <OccurrenceModal
        isOpen={isOccurrenceModalOpen}
        onClose={() => setIsOccurrenceModalOpen(false)}
        onSave={handleSaveOccurrence}
        editingOccurrence={editingOccurrence}
        products={products}
        users={users}
      />

      <TimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
        occurrence={timelineOccurrence}
      />

      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        imageUrl={evidenceData?.url || null}
        title={evidenceData?.title || ''}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBatchImport}
      />
    </div>
  );
}

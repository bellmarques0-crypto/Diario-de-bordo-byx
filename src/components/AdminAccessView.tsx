import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Search,
  CheckSquare,
  Square,
  Save,
  Lock,
  Users,
  Layers,
  BarChart3,
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { RoleProfile } from '../types';

interface AdminAccessViewProps {
  roles: RoleProfile[];
  onAddRole: (role: Omit<RoleProfile, 'id'>) => Promise<void>;
  onUpdateRole: (id: string, role: Partial<RoleProfile>) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
}

export interface PermissionCategory {
  categoria: string;
  icon: React.ElementType;
  items: {
    id: string;
    label: string;
    descricao: string;
  }[];
}

export const SYSTEM_PERMISSIONS: PermissionCategory[] = [
  {
    categoria: 'Diário de Bordo & Ocorrências',
    icon: Layers,
    items: [
      { id: 'ver_diario', label: 'Visualizar Diário de Bordo', descricao: 'Acesso à listagem e busca de ocorrências no sistema.' },
      { id: 'criar_ocorrencia', label: 'Criar Ocorrências', descricao: 'Permite registrar novos incidentes e eventos.' },
      { id: 'editar_ocorrencia', label: 'Editar Ocorrências', descricao: 'Permite alterar status, responsável e detalhes da solução.' },
      { id: 'excluir_ocorrencia', label: 'Excluir Ocorrências', descricao: 'Permite remover registros do Diário de Bordo.' },
      { id: 'importar_excel', label: 'Importar Planilha Excel', descricao: 'Permite subir ocorrências em lote via arquivo Excel/CSV.' },
      { id: 'exportar_relatorios', label: 'Exportar Relatórios', descricao: 'Permite baixar os dados em formato Excel e PDF.' }
    ]
  },
  {
    categoria: 'Métricas & Painéis Operacionais',
    icon: BarChart3,
    items: [
      { id: 'ver_dashboard', label: 'Visualizar Dashboard', descricao: 'Acesso às estatísticas, taxas de resolução e gráficos.' },
      { id: 'ver_sinalizacoes', label: 'Visualizar Sinalizações', descricao: 'Acesso ao painel de sinalizações de operação.' },
      { id: 'ver_absenteismo', label: 'Gestão de Absenteísmo', descricao: 'Acesso ao módulo de controle de absenteísmo da equipe.' }
    ]
  },
  {
    categoria: 'Módulo de Administração',
    icon: Settings,
    items: [
      { id: 'acesso_administracao', label: 'Acessar Administração', descricao: 'Permissão para visualizar o menu de Administração.' },
      { id: 'gerenciar_usuarios', label: 'Gerenciar Usuários', descricao: 'Cadastrar, editar e inativar usuários do sistema.' },
      { id: 'gerenciar_produtos', label: 'Gerenciar Produtos & Sistemas', descricao: 'Cadastrar e editar produtos operacionais.' },
      { id: 'gerenciar_acessos', label: 'Ajuste de Acessos (Perfis)', descricao: 'Cadastrar e configurar regras de acesso dos perfis.' },
      { id: 'gerenciar_banco_neon', label: 'Gerenciar Banco Neon DB', descricao: 'Acesso ao diagnóstico e testes de conexão com Neon DB.' }
    ]
  }
];

export const ALL_PERMISSION_IDS = SYSTEM_PERMISSIONS.flatMap((cat) => cat.items.map((i) => i.id));

export const AdminAccessView: React.FC<AdminAccessViewProps> = ({
  roles,
  onAddRole,
  onUpdateRole,
  onDeleteRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleProfile | null>(
    roles.length > 0 ? roles[0] : null
  );

  // Form State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState<{
    nome: string;
    descricao: string;
    status: 'Ativo' | 'Inativo';
    permissoes: string[];
  }>({
    nome: '',
    descricao: '',
    status: 'Ativo',
    permissoes: ALL_PERMISSION_IDS
  });

  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // When clicking a role in the left list to edit
  const handleSelectRole = (role: RoleProfile) => {
    setIsCreatingNew(false);
    setSelectedRole(role);
    setFormData({
      nome: role.nome,
      descricao: role.descricao,
      status: role.status,
      permissoes: [...role.permissoes]
    });
    setFeedbackMsg(null);
  };

  // When clicking "+ Novo Perfil"
  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedRole(null);
    setFormData({
      nome: '',
      descricao: '',
      status: 'Ativo',
      permissoes: ['ver_diario', 'criar_ocorrencia', 'ver_dashboard']
    });
    setFeedbackMsg(null);
  };

  // Toggle single permission
  const handleTogglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissoes.includes(permId);
      const newPerms = exists
        ? prev.permissoes.filter((id) => id !== permId)
        : [...prev.permissoes, permId];
      return { ...prev, permissoes: newPerms };
    });
  };

  // Toggle category permissions
  const handleToggleCategory = (categoryItems: { id: string }[]) => {
    const catIds = categoryItems.map((i) => i.id);
    const allSelected = catIds.every((id) => formData.permissoes.includes(id));

    setFormData((prev) => {
      if (allSelected) {
        // Remove all category permissions
        return {
          ...prev,
          permissoes: prev.permissoes.filter((id) => !catIds.includes(id))
        };
      } else {
        // Add missing category permissions
        const merged = Array.from(new Set([...prev.permissoes, ...catIds]));
        return { ...prev, permissoes: merged };
      }
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({ ...prev, permissoes: ALL_PERMISSION_IDS }));
  };

  const handleDeselectAllPermissions = () => {
    setFormData((prev) => ({ ...prev, permissoes: [] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Informe o nome do perfil de acesso.' });
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    try {
      if (isCreatingNew) {
        await onAddRole(formData);
        setFeedbackMsg({ type: 'success', text: 'Perfil criado com sucesso!' });
        setIsCreatingNew(false);
      } else if (selectedRole) {
        await onUpdateRole(selectedRole.id, formData);
        setFeedbackMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o perfil "${nome}"?`)) {
      await onDeleteRole(id);
      if (selectedRole?.id === id) {
        if (roles.length > 1) {
          const remaining = roles.filter((r) => r.id !== id);
          handleSelectRole(remaining[0]);
        } else {
          handleStartCreateNew();
        }
      }
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Ajuste de Acessos & Perfis de Usuário
            </h2>
            <p className="text-xs text-slate-500">
              Defina os níveis de acesso (RBAC) e quais módulos/ações cada perfil pode executar.
            </p>
          </div>
        </div>

        <button
          onClick={handleStartCreateNew}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Perfil
        </button>
      </div>

      {/* Main Grid: Left List + Right Detail Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roles List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" /> Perfis Cadastrados
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {roles.length}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar perfil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Role Cards List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredRoles.map((r) => {
              const isSelected = !isCreatingNew && selectedRole?.id === r.id;
              const permCount = r.permissoes.length;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{r.nome}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            r.status === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {r.descricao}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r.id, r.nome);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Excluir Perfil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Permissões ativas</span>
                    <span className="font-bold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                      {permCount} / {ALL_PERMISSION_IDS.length}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredRoles.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum perfil encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Permission Config Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isCreatingNew
                    ? 'Novo Perfil de Acesso'
                    : `Configurar Permissões - ${formData.nome}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Defina o nome, descrição e marque o que este perfil tem autorização para executar.
                </p>
              </div>

              {isCreatingNew && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  Modo de Criação
                </span>
              )}
            </div>

            {feedbackMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Perfil *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Analista de NOC, Supervisor de TI..."
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Inativo' })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição do Perfil
                </label>
                <input
                  type="text"
                  placeholder="Resumo das responsabilidades e nível de acesso de quem possui este perfil"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Permissions Selection Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" /> Matriz de Permissões de Acesso
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Marcar Todas
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllPermissions}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Desmarcar Todas
                  </button>
                </div>
              </div>

              {/* Permission Categories Accordion / Lists */}
              <div className="space-y-5">
                {SYSTEM_PERMISSIONS.map((cat) => {
                  const CategoryIcon = cat.icon;
                  const catIds = cat.items.map((i) => i.id);
                  const isCatAllSelected = catIds.every((id) =>
                    formData.permissoes.includes(id)
                  );
                  const selectedCountInCat = catIds.filter((id) =>
                    formData.permissoes.includes(id)
                  ).length;

                  return (
                    <div
                      key={cat.categoria}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs"
                    >
                      {/* Category Header */}
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {cat.categoria}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            {selectedCountInCat} de {cat.items.length} ativas
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat.items)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                        >
                          {isCatAllSelected ? (
                            <>
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Desmarcar Categoria
                            </>
                          ) : (
                            <>
                              <Square className="w-3.5 h-3.5 text-slate-400" /> Selecionar Categoria
                            </>
                          )}
                        </button>
                      </div>

                      {/* Permission Items List */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                        {cat.items.map((item) => {
                          const isChecked = formData.permissoes.includes(item.id);

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleTogglePermission(item.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                isChecked
                                  ? 'bg-indigo-50/40 border-indigo-200/80'
                                  : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? 'bg-indigo-600 text-white'
                                      : 'border border-slate-300 bg-white'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <span className="block text-xs font-bold text-slate-900">
                                  {item.label}
                                </span>
                                <p className="text-[11px] text-slate-500 leading-normal">
                                  {item.descricao}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : isCreatingNew ? 'Salvar Novo Perfil' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

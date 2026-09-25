export type ImpactType = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
export type StatusType = 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Monitorando';
export type OccurrenceType = 'Operacional' | 'Sistemas' | 'Telefonia' | 'Infraestrutura' | 'Atendimento' | 'Outros';

export type UserRole = 'Administrador' | 'Supervisor' | 'Operador';
export type UserStatus = 'Ativo' | 'Inativo';

export interface Occurrence {
  id: string;
  dataOcorrencia: string; // YYYY-MM-DD
  horaOcorrencia: string; // HH:mm
  produto: string;
  tipoOcorrencia: OccurrenceType | string;
  tipoImpacto: ImpactType;
  sistemaImpactado: string;
  descricaoSistema?: string;
  responsavelOcorrencia: string;
  status: StatusType;
  descricaoOcorrencia: string;
  evidenciaUrl?: string | null;
  dataSolucao?: string | null;
  horaSolucao?: string | null;
  responsavelSolucao?: string | null;
  descricaoSolucao?: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface RoleProfile {
  id: string;
  nome: string;
  descricao: string;
  status: 'Ativo' | 'Inativo';
  permissoes: string[];
  dataCriacao?: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  usuario: string;
  senha: string;
  cargo: string;
  perfil: string;
  status: UserStatus;
  departamento: string;
  dataCadastro: string;
}

export interface Product {
  id: string;
  nome: string;
  codigo: string;
  status: 'Ativo' | 'Inativo';
}

export interface TimelineEvent {
  id: string;
  ocorrenciaId: string;
  dataHora: string;
  autor: string;
  acao: string;
  detalhes: string;
  statusAnterior?: string;
  statusNovo?: string;
}

export interface NeonDbStatus {
  isConnected: boolean;
  usingNeon: boolean;
  connectionStringMasked?: string;
  tablesCreated?: boolean;
  recordCounts?: {
    occurrences: number;
    users: number;
    products: number;
  };
  lastError?: string | null;
}

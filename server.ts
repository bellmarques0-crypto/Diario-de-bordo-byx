import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Vercel Serverless URL Normalization middleware
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace(/^\/api\/index/, '/api');
    if (req.url === '') req.url = '/';
  }
  next();
});

// Initial seed data matching user screenshots
let mockUsers = [
  {
    id: 'usr_1',
    nome: 'LARISSA OLIVEIRA',
    email: 'larissa.oliveira@empresa.com.br',
    cargo: 'Analista de Operações Senior',
    perfil: 'Administrador' as const,
    status: 'Ativo' as const,
    departamento: 'Operações / NOC',
    dataCadastro: '2025-01-15'
  },
  {
    id: 'usr_2',
    nome: 'IZABEL MARQUES',
    email: 'izabel.marques@empresa.com.br',
    cargo: 'Coordenadora Operacional',
    perfil: 'Administrador' as const,
    status: 'Ativo' as const,
    departamento: 'Gestão Operacional',
    dataCadastro: '2025-02-01'
  },
  {
    id: 'usr_3',
    nome: 'CARLOS SILVA',
    email: 'carlos.silva@empresa.com.br',
    cargo: 'Supervisor de Atendimento',
    perfil: 'Supervisor' as const,
    status: 'Ativo' as const,
    departamento: 'Atendimento ao Cliente',
    dataCadastro: '2025-03-10'
  },
  {
    id: 'usr_4',
    nome: 'FERNANDA SOUZA',
    email: 'fernanda.souza@empresa.com.br',
    cargo: 'Operador de Monitoramento',
    perfil: 'Operador' as const,
    status: 'Ativo' as const,
    departamento: 'Monitoramento',
    dataCadastro: '2025-04-12'
  }
];

let mockRoles = [
  {
    id: 'role_1',
    nome: 'Administrador',
    descricao: 'Acesso total e irrestrito a todas as funcionalidades e configurações do sistema.',
    status: 'Ativo' as const,
    permissoes: [
      'ver_diario', 'criar_ocorrencia', 'editar_ocorrencia', 'excluir_ocorrencia',
      'importar_excel', 'exportar_relatorios', 'ver_dashboard', 'ver_sinalizacoes',
      'ver_absenteismo', 'acesso_administracao', 'gerenciar_usuarios', 'gerenciar_produtos',
      'gerenciar_acessos', 'gerenciar_banco_neon'
    ]
  },
  {
    id: 'role_2',
    nome: 'Supervisor de Operações',
    descricao: 'Gestão operacional completa, abertura e edição de chamados, relatórios e dashboards.',
    status: 'Ativo' as const,
    permissoes: [
      'ver_diario', 'criar_ocorrencia', 'editar_ocorrencia', 'importar_excel',
      'exportar_relatorios', 'ver_dashboard', 'ver_sinalizacoes', 'ver_absenteismo'
    ]
  },
  {
    id: 'role_3',
    nome: 'Operador de NOC',
    descricao: 'Registro e acompanhamento do Diário de Bordo e sinalizações de incidentes.',
    status: 'Ativo' as const,
    permissoes: [
      'ver_diario', 'criar_ocorrencia', 'editar_ocorrencia', 'ver_dashboard', 'ver_sinalizacoes'
    ]
  },
  {
    id: 'role_4',
    nome: 'Visualizador / Auditor',
    descricao: 'Acesso somente leitura para consulta de registros e indicadores operacionais.',
    status: 'Ativo' as const,
    permissoes: [
      'ver_diario', 'exportar_relatorios', 'ver_dashboard', 'ver_sinalizacoes'
    ]
  }
];

let mockProducts = [
  { id: 'prod_1', nome: 'BANESE', codigo: 'BAN-01', status: 'Ativo' as const },
  { id: 'prod_2', nome: 'INTERGRALL', codigo: 'INT-02', status: 'Ativo' as const },
  { id: 'prod_3', nome: 'CAIXA', codigo: 'CX-03', status: 'Ativo' as const },
  { id: 'prod_4', nome: 'Todos os Produtos', codigo: 'TODOS', status: 'Ativo' as const }
];

let mockOccurrences = [
  {
    id: 'occ_101',
    dataOcorrencia: '2026-09-24',
    horaOcorrencia: '09:35',
    produto: 'Todos',
    tipoOcorrencia: 'Operacional',
    tipoImpacto: 'Médio' as const,
    sistemaImpactado: 'INSTABILIDADE INTERGRALL',
    descricaoSistema: 'Intergrall teve uma queda temporária na rota de integração de dados.',
    responsavelOcorrencia: 'LARISSA OLIVEIRA',
    status: 'Resolvido' as const,
    descricaoOcorrencia: 'Verificada perda de pacotes na API de transmissão durante a rotina matutina.',
    evidenciaUrl: null,
    dataSolucao: '2026-09-24',
    horaSolucao: '11:20',
    responsavelSolucao: 'LARISSA OLIVEIRA',
    descricaoSolucao: 'Resolvido sem necessidade de intervenção técnica prolongada. Rota reestabelecida.',
    dataCriacao: new Date('2026-09-24T09:35:00').toISOString(),
    dataAtualizacao: new Date('2026-09-24T11:20:00').toISOString()
  },
  {
    id: 'occ_102',
    dataOcorrencia: '2026-09-23',
    horaOcorrencia: '14:10',
    produto: 'BANESE',
    tipoOcorrencia: 'Telefonia',
    tipoImpacto: 'Alto' as const,
    sistemaImpactado: 'PAX TELEFONIA',
    descricaoSistema: 'Lentidão no atendimento e queda de chamadas ativas na fila receptiva.',
    responsavelOcorrencia: 'IZABEL MARQUES',
    status: 'Resolvido' as const,
    descricaoOcorrencia: 'Fila de chamadas estagnada por mais de 15 minutos com acúmulo de clientes.',
    evidenciaUrl: null,
    dataSolucao: '2026-09-23',
    horaSolucao: '16:00',
    responsavelSolucao: 'IZABEL MARQUES',
    descricaoSolucao: 'Reiniciado gateway de voz SIP e realocada equipe de contingência.',
    dataCriacao: new Date('2026-09-23T14:10:00').toISOString(),
    dataAtualizacao: new Date('2026-09-23T16:00:00').toISOString()
  },
  {
    id: 'occ_103',
    dataOcorrencia: '2026-09-22',
    horaOcorrencia: '08:00',
    produto: 'CAIXA',
    tipoOcorrencia: 'Sistemas',
    tipoImpacto: 'Baixo' as const,
    sistemaImpactado: 'PORTAL DE CONSULTAS',
    descricaoSistema: 'Atraso na sincronização de relatórios do turno da noite.',
    responsavelOcorrencia: 'CARLOS SILVA',
    status: 'Resolvido' as const,
    descricaoOcorrencia: 'Relatório diário demorando mais de 30 minutos para exportação.',
    evidenciaUrl: null,
    dataSolucao: '2026-09-22',
    horaSolucao: '09:15',
    responsavelSolucao: 'CARLOS SILVA',
    descricaoSolucao: 'Sincronização manual executada no banco de staging com sucesso.',
    dataCriacao: new Date('2026-09-22T08:00:00').toISOString(),
    dataAtualizacao: new Date('2026-09-22T09:15:00').toISOString()
  }
];

let mockTimeline: Record<string, any[]> = {
  'occ_101': [
    {
      id: 'time_1',
      ocorrenciaId: 'occ_101',
      dataHora: '2026-09-24T09:35:00Z',
      autor: 'LARISSA OLIVEIRA',
      acao: 'Abertura de Ocorrência',
      detalhes: 'Ocorrência cadastrada com status Aberto.',
      statusNovo: 'Aberto'
    },
    {
      id: 'time_2',
      ocorrenciaId: 'occ_101',
      dataHora: '2026-09-24T11:20:00Z',
      autor: 'LARISSA OLIVEIRA',
      acao: 'Resolução Concluída',
      detalhes: 'Solução registrada: Resolvido sem necessidade de intervenção técnica prolongada.',
      statusAnterior: 'Aberto',
      statusNovo: 'Resolvido'
    }
  ]
};

// Helper to sanitize Neon connection strings
function cleanNeonConnectionString(url: string): string {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();

  // Convert postgres:// to postgresql://
  if (cleaned.startsWith('postgres://')) {
    cleaned = 'postgresql://' + cleaned.substring(11);
  }

  // Remove channel_binding query params which break JS SCRAM authentication
  cleaned = cleaned.replace(/([?&])channel_binding=[^&]*(&|$)/gi, '$1');

  // Fix URL query formatting
  cleaned = cleaned.replace(/\?&/g, '?').replace(/&&/g, '&').replace(/[?&]$/, '');

  return cleaned;
}

// Log database connection details securely without exposing sensitive credentials
function logDatabaseConnectionInfo(url: string) {
  if (!url) {
    console.log('[Neon DB Info] DATABASE_URL configured: false');
    return;
  }
  try {
    const match = url.match(/postgresql:\/\/([^:]+):[^@]+@([^:\/]+)(?::\d+)?\/([^?]+)/);
    if (match) {
      console.log(`[Neon DB Info] DATABASE_URL configured: true`);
      console.log(`[Neon DB Info] Database user: ${match[1]}`);
      console.log(`[Neon DB Info] Database host: ${match[2]}`);
      console.log(`[Neon DB Info] Database name: ${match[3]}`);
    } else {
      console.log('[Neon DB Info] DATABASE_URL configured: true (custom format)');
    }
  } catch (e) {
    console.log('[Neon DB Info] DATABASE_URL configured: true');
  }
}

// Global serverless Pool management
let globalPool: Pool | null = null;
let activeDbUrl: string = '';

function getEffectiveDbUrl(): string {
  return activeDbUrl || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
}

function setDbUrl(url: string) {
  const cleaned = cleanNeonConnectionString(url);
  if (cleaned !== activeDbUrl) {
    if (globalPool) {
      try { globalPool.end(); } catch (e) {}
      globalPool = null;
    }
    activeDbUrl = cleaned;
  }
}

function getPool(url?: string): Pool {
  const targetUrl = cleanNeonConnectionString(url || getEffectiveDbUrl());
  if (!targetUrl) {
    throw new Error('DATABASE_URL não configurada no ambiente da Vercel.');
  }
  if (!globalPool || activeDbUrl !== targetUrl) {
    if (globalPool) {
      try { globalPool.end(); } catch (e) {}
    }
    activeDbUrl = targetUrl;
    globalPool = new Pool({
      connectionString: targetUrl,
      connectionTimeoutMillis: 10000
    });
  }
  return globalPool;
}

// Database helper functions
async function initDbTablesWithDetails(): Promise<{ success: boolean; error?: string; code?: string }> {
  const dbUrl = getEffectiveDbUrl();
  if (!dbUrl) {
    return { success: false, error: 'DATABASE_URL não configurada no servidor.' };
  }

  let pool: Pool;
  try {
    pool = getPool(dbUrl);
  } catch (err: any) {
    return { success: false, error: err.message, code: 'POOL_INIT_ERROR' };
  }

  let client;
  try {
    client = await pool.connect();
  } catch (connectErr: any) {
    console.error('[Neon Connection Error]', connectErr);
    return {
      success: false,
      error: connectErr.message || String(connectErr),
      code: connectErr.code || 'CONNECT_ERROR'
    };
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        cargo VARCHAR(100),
        perfil VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        departamento VARCHAR(100),
        data_cadastro VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        codigo VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS occurrences (
        id VARCHAR(50) PRIMARY KEY,
        data_ocorrencia VARCHAR(10) NOT NULL,
        hora_ocorrencia VARCHAR(5) NOT NULL,
        produto VARCHAR(100) NOT NULL,
        tipo_ocorrencia VARCHAR(100) NOT NULL,
        tipo_impacto VARCHAR(20) NOT NULL,
        sistema_impactado VARCHAR(255) NOT NULL,
        descricao_sistema TEXT,
        responsavel_ocorrencia VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        descricao_ocorrencia TEXT,
        evidencia_url TEXT,
        data_solucao VARCHAR(10),
        hora_solucao VARCHAR(5),
        responsavel_solucao VARCHAR(255),
        descricao_solucao TEXT,
        data_criacao VARCHAR(50),
        data_atualizacao VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS timeline_events (
        id VARCHAR(50) PRIMARY KEY,
        ocorrencia_id VARCHAR(50) NOT NULL,
        data_hora VARCHAR(50) NOT NULL,
        autor VARCHAR(255) NOT NULL,
        acao VARCHAR(100) NOT NULL,
        detalhes TEXT NOT NULL,
        status_anterior VARCHAR(50),
        status_novo VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        status VARCHAR(20) NOT NULL,
        permissoes TEXT,
        data_criacao VARCHAR(50)
      );
    `);

    // Check if seeded
    const res = await client.query('SELECT count(*) FROM occurrences');
    if (parseInt(res.rows[0].count, 10) === 0) {
      for (const u of mockUsers) {
        await client.query(
          `INSERT INTO users (id, nome, email, cargo, perfil, status, departamento, data_cadastro) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
          [u.id, u.nome, u.email, u.cargo, u.perfil, u.status, u.departamento, u.dataCadastro]
        );
      }
      for (const p of mockProducts) {
        await client.query(
          `INSERT INTO products (id, nome, codigo, status) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [p.id, p.nome, p.codigo, p.status]
        );
      }
      for (const o of mockOccurrences) {
        await client.query(
          `INSERT INTO occurrences (id, data_ocorrencia, hora_ocorrencia, produto, tipo_ocorrencia, tipo_impacto, sistema_impactado, descricao_sistema, responsavel_ocorrencia, status, descricao_ocorrencia, evidencia_url, data_solucao, hora_solucao, responsavel_solucao, descricao_solucao, data_criacao, data_atualizacao)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) ON CONFLICT DO NOTHING`,
          [o.id, o.dataOcorrencia, o.horaOcorrencia, o.produto, o.tipoOcorrencia, o.tipoImpacto, o.sistemaImpactado, o.descricaoSistema, o.responsavelOcorrencia, o.status, o.descricaoOcorrencia, o.evidenciaUrl, o.dataSolucao, o.horaSolucao, o.responsavelSolucao, o.descricaoSolucao, o.dataCriacao, o.dataAtualizacao]
        );
      }
      for (const r of mockRoles) {
        await client.query(
          `INSERT INTO roles (id, nome, descricao, status, permissoes) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
          [r.id, r.nome, r.descricao, r.status, JSON.stringify(r.permissoes || [])]
        );
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Neon Table Init Error]', err);
    return {
      success: false,
      error: err.message || String(err),
      code: err.code || 'INIT_TABLES_ERROR'
    };
  } finally {
    if (client) {
      client.release();
    }
  }
}

// API Routes

// Neon DB Status
app.get(['/api/neon/status', '/neon/status'], async (_req: Request, res: Response) => {
  const dbUrl = getEffectiveDbUrl();
  logDatabaseConnectionInfo(dbUrl);

  if (!dbUrl) {
    return res.json({
      success: true,
      isConnected: false,
      usingNeon: false,
      message: 'DATABASE_URL não configurada no ambiente Vercel.',
      recordCounts: { occurrences: mockOccurrences.length, users: mockUsers.length, products: mockProducts.length }
    });
  }

  try {
    const pool = getPool(dbUrl);
    const client = await pool.connect();
    try {
      const testRes = await client.query('SELECT NOW() as now_time');
      const occRes = await client.query('SELECT count(*) FROM occurrences').catch(() => ({ rows: [{ count: 0 }] }));
      const usrRes = await client.query('SELECT count(*) FROM users').catch(() => ({ rows: [{ count: 0 }] }));
      const prdRes = await client.query('SELECT count(*) FROM products').catch(() => ({ rows: [{ count: 0 }] }));

      return res.json({
        success: true,
        isConnected: true,
        usingNeon: true,
        serverTime: testRes.rows[0]?.now_time,
        connectionStringMasked: dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        recordCounts: {
          occurrences: parseInt(occRes.rows[0].count, 10),
          users: parseInt(usrRes.rows[0].count, 10),
          products: parseInt(prdRes.rows[0].count, 10)
        }
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Neon Status Error]', err);
    return res.status(500).json({
      success: false,
      isConnected: false,
      usingNeon: false,
      error: 'Erro na conexão com Neon PostgreSQL: ' + (err.message || String(err)),
      code: err.code || 'DB_STATUS_ERROR'
    });
  }
});

// Configure / Connect Neon Database URL
app.post(['/api/neon/connect', '/neon/connect'], async (req: Request, res: Response) => {
  try {
    const connectionString = req.body?.connectionString || getEffectiveDbUrl();
    if (!connectionString) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma string de conexão fornecida e DATABASE_URL não está configurada.'
      });
    }

    const cleanedUrl = cleanNeonConnectionString(connectionString);
    logDatabaseConnectionInfo(cleanedUrl);

    setDbUrl(cleanedUrl);
    const result = await initDbTablesWithDetails();

    if (result.success) {
      return res.json({
        success: true,
        message: 'Conexão com o Neon DB testada e tabelas sincronizadas com sucesso!'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao testar conexão com Neon DB: ' + (result.error || 'Erro desconhecido'),
        code: result.code
      });
    }
  } catch (err: any) {
    console.error('[Neon Connect Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Erro de conexão com o banco Neon: ' + (err.message || String(err)),
      code: err.code || 'DB_CONNECT_ERROR'
    });
  }
});

// Sync local data to Neon DB
app.post(['/api/neon/sync', '/neon/sync'], async (_req: Request, res: Response) => {
  const dbUrl = getEffectiveDbUrl();
  if (!dbUrl) {
    return res.status(400).json({ success: false, error: 'DATABASE_URL não configurada.' });
  }

  try {
    const result = await initDbTablesWithDetails();
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    const pool = getPool(dbUrl);
    const client = await pool.connect();
    try {
      // Sync users
      for (const u of mockUsers) {
        await client.query(
          `INSERT INTO users (id, nome, email, cargo, perfil, status, departamento, data_cadastro)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id) DO UPDATE SET nome=$2, email=$3, cargo=$4, perfil=$5, status=$6, departamento=$7`,
          [u.id, u.nome, u.email, u.cargo, u.perfil, u.status, u.departamento, u.dataCadastro]
        );
      }
      // Sync occurrences
      for (const o of mockOccurrences) {
        await client.query(
          `INSERT INTO occurrences (id, data_ocorrencia, hora_ocorrencia, produto, tipo_ocorrencia, tipo_impacto, sistema_impactado, descricao_sistema, responsavel_ocorrencia, status, descricao_ocorrencia, evidencia_url, data_solucao, hora_solucao, responsavel_solucao, descricao_solucao, data_criacao, data_atualizacao)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (id) DO UPDATE SET status=$10, descricao_solucao=$16, data_solucao=$13, hora_solucao=$14, responsavel_solucao=$15, data_atualizacao=$18`,
          [o.id, o.dataOcorrencia, o.horaOcorrencia, o.produto, o.tipoOcorrencia, o.tipoImpacto, o.sistemaImpactado, o.descricaoSistema, o.responsavelOcorrencia, o.status, o.descricaoOcorrencia, o.evidenciaUrl, o.dataSolucao, o.horaSolucao, o.responsavelSolucao, o.descricaoSolucao, o.dataCriacao, o.dataAtualizacao]
        );
      }
      return res.json({ success: true, message: 'Dados sincronizados com o Neon DB com sucesso!' });
    } finally {
      client.release();
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Erro de sincronização: ' + (err.message || String(err)) });
  }
});

// Occurrences CRUD
app.get(['/api/occurrences', '/occurrences'], async (_req: Request, res: Response) => {
  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM occurrences ORDER BY data_criacao DESC');
        const formatted = result.rows.map(r => ({
          id: r.id,
          dataOcorrencia: r.data_ocorrencia,
          horaOcorrencia: r.hora_ocorrencia,
          produto: r.produto,
          tipoOcorrencia: r.tipo_ocorrencia,
          tipoImpacto: r.tipo_impacto,
          sistemaImpactado: r.sistema_impactado,
          descricaoSistema: r.descricao_sistema,
          responsavelOcorrencia: r.responsavel_ocorrencia,
          status: r.status,
          descricaoOcorrencia: r.descricao_ocorrencia,
          evidenciaUrl: r.evidencia_url,
          dataSolucao: r.data_solucao,
          horaSolucao: r.hora_solucao,
          responsavelSolucao: r.responsavel_solucao,
          descricaoSolucao: r.descricao_solucao,
          dataCriacao: r.data_criacao,
          dataAtualizacao: r.data_atualizacao
        }));
        return res.json(formatted);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon DB Error on GET /api/occurrences]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar ocorrências no Neon PostgreSQL: ' + (err.message || String(err)),
        code: err.code || 'DB_QUERY_ERROR'
      });
    }
  }
  return res.json(mockOccurrences);
});

app.post(['/api/occurrences/batch', '/occurrences/batch'], async (req: Request, res: Response) => {
  const items: any[] = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'O corpo da requisição deve ser um array' });
  }

  const createdItems: any[] = [];
  const dbUrl = getEffectiveDbUrl();

  for (const raw of items) {
    const occId = raw.id ? String(raw.id) : 'occ_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newOcc = {
      id: occId,
      dataOcorrencia: raw.dataOcorrencia || new Date().toISOString().split('T')[0],
      horaOcorrencia: raw.horaOcorrencia || '00:00',
      produto: raw.produto || 'Todos',
      tipoOcorrencia: raw.tipoOcorrencia || 'Operacional',
      tipoImpacto: raw.tipoImpacto || 'Médio',
      sistemaImpactado: raw.sistemaImpactado || raw.ocorrencia || 'Geral',
      descricaoSistema: raw.descricaoSistema || '',
      responsavelOcorrencia: raw.responsavelOcorrencia || 'SISTEMA',
      status: raw.status || 'Aberto',
      descricaoOcorrencia: raw.descricaoOcorrencia || raw.comentarios || 'Importado via Excel',
      evidenciaUrl: raw.evidenciaUrl || null,
      dataSolucao: raw.dataSolucao || null,
      horaSolucao: raw.horaSolucao || null,
      responsavelSolucao: raw.responsavelSolucao || null,
      descricaoSolucao: raw.descricaoSolucao || raw.solucao || null,
      dataCriacao: raw.dataCadastro || raw.dataCriacao || new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };

    mockOccurrences = mockOccurrences.filter(o => o.id !== newOcc.id);
    mockOccurrences.unshift(newOcc);
    createdItems.push(newOcc);

    if (dbUrl) {
      try {
        const pool = getPool(dbUrl);
        const client = await pool.connect();
        try {
          await client.query(
            `INSERT INTO occurrences (id, data_ocorrencia, hora_ocorrencia, produto, tipo_ocorrencia, tipo_impacto, sistema_impactado, descricao_sistema, responsavel_ocorrencia, status, descricao_ocorrencia, evidencia_url, data_solucao, hora_solucao, responsavel_solucao, descricao_solucao, data_criacao, data_atualizacao)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
             ON CONFLICT (id) DO UPDATE SET
               data_ocorrencia=EXCLUDED.data_ocorrencia,
               hora_ocorrencia=EXCLUDED.hora_ocorrencia,
               produto=EXCLUDED.produto,
               tipo_impacto=EXCLUDED.tipo_impacto,
               sistema_impactado=EXCLUDED.sistema_impactado,
               responsavel_ocorrencia=EXCLUDED.responsavel_ocorrencia,
               status=EXCLUDED.status,
               descricao_ocorrencia=EXCLUDED.descricao_ocorrencia,
               data_solucao=EXCLUDED.data_solucao,
               hora_solucao=EXCLUDED.hora_solucao,
               responsavel_solucao=EXCLUDED.responsavel_solucao,
               descricao_solucao=EXCLUDED.descricao_solucao`,
            [newOcc.id, newOcc.dataOcorrencia, newOcc.horaOcorrencia, newOcc.produto, newOcc.tipoOcorrencia, newOcc.tipoImpacto, newOcc.sistemaImpactado, newOcc.descricaoSistema || '', newOcc.responsavelOcorrencia, newOcc.status, newOcc.descricaoOcorrencia, newOcc.evidenciaUrl || null, newOcc.dataSolucao || null, newOcc.horaSolucao || null, newOcc.responsavelSolucao || null, newOcc.descricaoSolucao || null, newOcc.dataCriacao, newOcc.dataAtualizacao]
          );
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.error('[Neon Batch Insert Error]', err);
      }
    }
  }

  res.status(201).json({ success: true, count: createdItems.length, occurrences: createdItems });
});

app.post(['/api/occurrences', '/occurrences'], async (req: Request, res: Response) => {
  const newOcc = {
    id: 'occ_' + Date.now(),
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    ...req.body
  };

  mockOccurrences.unshift(newOcc);

  const timelineEvent = {
    id: 'time_' + Date.now(),
    ocorrenciaId: newOcc.id,
    dataHora: new Date().toISOString(),
    autor: newOcc.responsavelOcorrencia || 'SISTEMA',
    acao: 'Abertura de Ocorrência',
    detalhes: `Registro de nova ocorrência no sistema com status "${newOcc.status}".`,
    statusNovo: newOcc.status
  };
  if (!mockTimeline[newOcc.id]) mockTimeline[newOcc.id] = [];
  mockTimeline[newOcc.id].push(timelineEvent);

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO occurrences (id, data_ocorrencia, hora_ocorrencia, produto, tipo_ocorrencia, tipo_impacto, sistema_impactado, descricao_sistema, responsavel_ocorrencia, status, descricao_ocorrencia, evidencia_url, data_solucao, hora_solucao, responsavel_solucao, descricao_solucao, data_criacao, data_atualizacao)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
          [newOcc.id, newOcc.dataOcorrencia, newOcc.horaOcorrencia, newOcc.produto, newOcc.tipoOcorrencia, newOcc.tipoImpacto, newOcc.sistemaImpactado, newOcc.descricaoSistema || '', newOcc.responsavelOcorrencia, newOcc.status, newOcc.descricaoOcorrencia, newOcc.evidenciaUrl || null, newOcc.dataSolucao || null, newOcc.horaSolucao || null, newOcc.responsavelSolucao || null, newOcc.descricaoSolucao || null, newOcc.dataCriacao, newOcc.dataAtualizacao]
        );
        await client.query(
          `INSERT INTO timeline_events (id, ocorrencia_id, data_hora, autor, acao, detalhes, status_novo)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [timelineEvent.id, timelineEvent.ocorrenciaId, timelineEvent.dataHora, timelineEvent.autor, timelineEvent.acao, timelineEvent.detalhes, timelineEvent.statusNovo]
        );
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Save Occurrence Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao salvar ocorrência no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.status(201).json(newOcc);
});

app.put(['/api/occurrences/:id', '/occurrences/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = mockOccurrences.findIndex(o => o.id === id);
  const oldOcc: any = idx !== -1 ? mockOccurrences[idx] : {};
  const updatedOcc = {
    ...oldOcc,
    ...req.body,
    dataAtualizacao: new Date().toISOString()
  };

  if (idx !== -1) mockOccurrences[idx] = updatedOcc;

  let timelineEvent = null;
  if (oldOcc.status !== updatedOcc.status) {
    timelineEvent = {
      id: 'time_' + Date.now(),
      ocorrenciaId: id,
      dataHora: new Date().toISOString(),
      autor: updatedOcc.responsavelSolucao || updatedOcc.responsavelOcorrencia || 'SISTEMA',
      acao: 'Alteração de Status',
      detalhes: `Status alterado de "${oldOcc.status}" para "${updatedOcc.status}".`,
      statusAnterior: oldOcc.status,
      statusNovo: updatedOcc.status
    };
    if (!mockTimeline[id]) mockTimeline[id] = [];
    mockTimeline[id].push(timelineEvent);
  }

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE occurrences SET
            data_ocorrencia=$1, hora_ocorrencia=$2, produto=$3, tipo_ocorrencia=$4, tipo_impacto=$5,
            sistema_impactado=$6, descricao_sistema=$7, responsavel_ocorrencia=$8, status=$9,
            descricao_ocorrencia=$10, evidencia_url=$11, data_solucao=$12, hora_solucao=$13,
            responsavel_solucao=$14, descricao_solucao=$15, data_atualizacao=$16
           WHERE id=$17`,
          [
            updatedOcc.dataOcorrencia, updatedOcc.horaOcorrencia, updatedOcc.produto, updatedOcc.tipoOcorrencia, updatedOcc.tipoImpacto,
            updatedOcc.sistemaImpactado, updatedOcc.descricaoSistema || '', updatedOcc.responsavelOcorrencia, updatedOcc.status,
            updatedOcc.descricaoOcorrencia, updatedOcc.evidenciaUrl || null, updatedOcc.dataSolucao || null, updatedOcc.horaSolucao || null,
            updatedOcc.responsavelSolucao || null, updatedOcc.descricaoSolucao || null, updatedOcc.dataAtualizacao, id
          ]
        );
        if (timelineEvent) {
          await client.query(
            `INSERT INTO timeline_events (id, ocorrencia_id, data_hora, autor, acao, detalhes, status_anterior, status_novo)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [timelineEvent.id, timelineEvent.ocorrenciaId, timelineEvent.dataHora, timelineEvent.autor, timelineEvent.acao, timelineEvent.detalhes, timelineEvent.statusAnterior || null, timelineEvent.statusNovo || null]
          );
        }
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Update Occurrence Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar ocorrência no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json(updatedOcc);
});

app.delete(['/api/occurrences/:id', '/occurrences/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  mockOccurrences = mockOccurrences.filter(o => o.id !== id);
  delete mockTimeline[id];

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query('DELETE FROM timeline_events WHERE ocorrencia_id=$1', [id]);
        await client.query('DELETE FROM occurrences WHERE id=$1', [id]);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Delete Occurrence Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao excluir ocorrência no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json({ success: true });
});

// Timeline route
app.get(['/api/occurrences/:id/timeline', '/occurrences/:id/timeline'], async (req: Request, res: Response) => {
  const { id } = req.params;
  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM timeline_events WHERE ocorrencia_id=$1 ORDER BY data_hora ASC', [id]);
        const formatted = result.rows.map(r => ({
          id: r.id,
          ocorrenciaId: r.ocorrencia_id,
          dataHora: r.data_hora,
          autor: r.autor,
          acao: r.acao,
          detalhes: r.detalhes,
          statusAnterior: r.status_anterior,
          statusNovo: r.status_novo
        }));
        return res.json(formatted);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Timeline Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar histórico no Neon DB: ' + (err.message || String(err))
      });
    }
  }
  return res.json(mockTimeline[id] || []);
});

// Users Management (Cadastro de Usuários)
app.get(['/api/users', '/users'], async (_req: Request, res: Response) => {
  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM users ORDER BY nome ASC');
        const formatted = result.rows.map(r => ({
          id: r.id,
          nome: r.nome,
          email: r.email,
          cargo: r.cargo,
          perfil: r.perfil,
          status: r.status,
          departamento: r.departamento,
          dataCadastro: r.data_cadastro
        }));
        return res.json(formatted);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon GET Users Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar usuários no Neon DB: ' + (err.message || String(err))
      });
    }
  }
  return res.json(mockUsers);
});

app.post(['/api/users', '/users'], async (req: Request, res: Response) => {
  const newUser = {
    id: 'usr_' + Date.now(),
    dataCadastro: new Date().toISOString().split('T')[0],
    ...req.body
  };

  mockUsers.push(newUser);

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO users (id, nome, email, cargo, perfil, status, departamento, data_cadastro)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [newUser.id, newUser.nome, newUser.email, newUser.cargo, newUser.perfil, newUser.status, newUser.departamento, newUser.dataCadastro]
        );
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Save User Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao salvar usuário no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.status(201).json(newUser);
});

app.put(['/api/users/:id', '/users/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = mockUsers.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
  }

  const updatedUser = { ...mockUsers[idx], ...req.body };
  mockUsers[idx] = updatedUser;

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE users SET nome=$1, email=$2, cargo=$3, perfil=$4, status=$5, departamento=$6 WHERE id=$7`,
          [updatedUser.nome, updatedUser.email, updatedUser.cargo, updatedUser.perfil, updatedUser.status, updatedUser.departamento, id]
        );
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Update User Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar usuário no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json(updatedUser);
});

app.delete(['/api/users/:id', '/users/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  mockUsers = mockUsers.filter(u => u.id !== id);

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query('DELETE FROM users WHERE id=$1', [id]);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Delete User Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao excluir usuário no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json({ success: true });
});

// Products CRUD
app.get(['/api/products', '/products'], async (_req: Request, res: Response) => {
  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM products ORDER BY nome ASC');
        return res.json(result.rows);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon GET Products Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar produtos no Neon DB: ' + (err.message || String(err))
      });
    }
  }
  return res.json(mockProducts);
});

app.post(['/api/products', '/products'], async (req: Request, res: Response) => {
  const newProd = {
    id: 'prod_' + Date.now(),
    ...req.body
  };
  mockProducts.push(newProd);

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO products (id, nome, codigo, status) VALUES ($1,$2,$3,$4)`,
          [newProd.id, newProd.nome, newProd.codigo || '', newProd.status || 'Ativo']
        );
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Save Product Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao salvar produto no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.status(201).json(newProd);
});

app.put(['/api/products/:id', '/products/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = mockProducts.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Produto não encontrado' });
  }

  const updatedProd = { ...mockProducts[idx], ...req.body };
  mockProducts[idx] = updatedProd;

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE products SET nome=$1, codigo=$2, status=$3 WHERE id=$4`,
          [updatedProd.nome, updatedProd.codigo, updatedProd.status, id]
        );
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Update Product Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar produto no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json(updatedProd);
});

app.delete(['/api/products/:id', '/products/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  mockProducts = mockProducts.filter(p => p.id !== id);

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query('DELETE FROM products WHERE id=$1', [id]);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Delete Product Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao excluir produto no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json({ success: true });
});

// Roles & Permissions CRUD (Ajuste de Acessos)
app.get(['/api/roles', '/roles'], async (_req: Request, res: Response) => {
  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM roles ORDER BY nome ASC');
        const formatted = result.rows.map(r => ({
          id: r.id,
          nome: r.nome,
          descricao: r.descricao,
          status: r.status,
          permissoes: typeof r.permissoes === 'string' ? JSON.parse(r.permissoes) : (r.permissoes || []),
          dataCriacao: r.data_criacao
        }));
        return res.json(formatted);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon GET Roles Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar perfis no Neon DB: ' + (err.message || String(err))
      });
    }
  }
  return res.json(mockRoles);
});

app.post(['/api/roles', '/roles'], async (req: Request, res: Response) => {
  const newRole = {
    id: 'role_' + Date.now(),
    dataCriacao: new Date().toISOString(),
    ...req.body
  };
  mockRoles.push(newRole);

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO roles (id, nome, descricao, status, permissoes) VALUES ($1,$2,$3,$4,$5)`,
          [newRole.id, newRole.nome, newRole.descricao, newRole.status, JSON.stringify(newRole.permissoes || [])]
        );
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Save Role Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao salvar perfil no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.status(201).json(newRole);
});

app.put(['/api/roles/:id', '/roles/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = mockRoles.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Perfil não encontrado' });
  }

  const updatedRole = { ...mockRoles[idx], ...req.body };
  mockRoles[idx] = updatedRole;

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE roles SET nome=$1, descricao=$2, status=$3, permissoes=$4 WHERE id=$5`,
          [updatedRole.nome, updatedRole.descricao, updatedRole.status, JSON.stringify(updatedRole.permissoes || []), id]
        );
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Update Role Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar perfil no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json(updatedRole);
});

app.delete(['/api/roles/:id', '/roles/:id'], async (req: Request, res: Response) => {
  const { id } = req.params;
  mockRoles = mockRoles.filter(r => r.id !== id);

  const dbUrl = getEffectiveDbUrl();
  if (dbUrl) {
    try {
      const pool = getPool(dbUrl);
      const client = await pool.connect();
      try {
        await client.query('DELETE FROM roles WHERE id=$1', [id]);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error('[Neon Delete Role Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao excluir perfil no Neon DB: ' + (err.message || String(err))
      });
    }
  }

  res.json({ success: true });
});

// Global Express Error Handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[Express Global Error]', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Erro interno do servidor',
    code: err?.code || 'SERVER_ERROR'
  });
});

// Vite Server initialization in Dev Mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`🚀 Diário de Bordo Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

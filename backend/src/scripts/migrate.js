// Script de migração de dados do legacy para MongoDB
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Importar models
const Link = require('../models/Link');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Variable = require('../models/Variable');

// Configuração do MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin@192.168.15.15:27017/server_hub?authSource=admin';

// Cores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.cyan}  ${msg}${colors.reset}`)
};

async function migrate() {
  try {
    // Conectar ao MongoDB
    log.info('Conectando ao MongoDB...');
    await mongoose.connect(MONGO_URI);
    log.success('Conectado ao MongoDB!');

    // Ler arquivo legacy
    log.info('Lendo arquivo legacy/links.json...');
    const legacyPath = path.join(__dirname, '../../legacy/links.json');
    const legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
    log.success(`Arquivo lido: ${legacyData.links.length} links encontrados`);

    // Estatísticas
    const stats = {
      variablesCreated: 0,
      variablesExisting: 0,
      categoriesCreated: 0,
      categoriesExisting: 0,
      tagsCreated: 0,
      tagsExisting: 0,
      linksCreated: 0,
      linksExisting: 0
    };

    // ============================================
    // 1. MIGRAR VARIÁVEIS
    // ============================================
    log.info('\n[1/4] Migrando variáveis...');
    for (const [chave, valor] of Object.entries(legacyData.variables)) {
      const existing = await Variable.findOne({ chave: chave.toUpperCase() });
      if (existing) {
        log.warning(`Variável ${chave} já existe, pulando...`);
        stats.variablesExisting++;
      } else {
        await Variable.create({
          chave: chave.toUpperCase(),
          valor,
          descricao: `Migrado de legacy - ${chave}`
        });
        log.success(`Variável ${chave} criada: ${valor}`);
        stats.variablesCreated++;
      }
    }

    // ============================================
    // 2. MIGRAR CATEGORIAS
    // ============================================
    log.info('\n[2/4] Migrando categorias...');
    const categorias = [...new Set(legacyData.links.map(link => link.categoria))];
    const categoriaMap = {}; // Nome -> ObjectId

    for (const categoriaNome of categorias) {
      let categoria = await Category.findOne({ nome: categoriaNome });
      if (categoria) {
        log.warning(`Categoria "${categoriaNome}" já existe, reutilizando...`);
        stats.categoriesExisting++;
      } else {
        categoria = await Category.create({
          nome: categoriaNome,
          descricao: `Migrado de legacy - ${categoriaNome}`,
          icone: categoriaNome === 'Server' ? '🖥️' : categoriaNome === 'Note' ? '💻' : '🌐',
          cor: categoriaNome === 'Server' ? '#3b82f6' : categoriaNome === 'Note' ? '#8b5cf6' : '#10b981'
        });
        log.success(`Categoria "${categoriaNome}" criada`);
        stats.categoriesCreated++;
      }
      categoriaMap[categoriaNome] = categoria._id;
    }

    // ============================================
    // 3. MIGRAR TAGS
    // ============================================
    log.info('\n[3/4] Migrando tags...');
    const allTags = [...new Set(legacyData.links.flatMap(link => link.tags || []))];
    const tagMap = {}; // Nome -> ObjectId

    for (const tagNome of allTags) {
      let tag = await Tag.findOne({ nome: tagNome });
      if (tag) {
        log.warning(`Tag "${tagNome}" já existe, reutilizando...`);
        stats.tagsExisting++;
      } else {
        tag = await Tag.create({
          nome: tagNome,
          descricao: `Migrado de legacy - ${tagNome}`,
          cor: '#64748b' // Cor padrão slate
        });
        log.success(`Tag "${tagNome}" criada`);
        stats.tagsCreated++;
      }
      tagMap[tagNome] = tag._id;
    }

    // ============================================
    // 4. MIGRAR LINKS
    // ============================================
    log.info('\n[4/4] Migrando links...');
    for (const linkData of legacyData.links) {
      // Verificar se link já existe (por nome e endereço)
      const existing = await Link.findOne({
        nome: linkData.nome,
        endereco: linkData.endereco
      });

      if (existing) {
        log.warning(`Link "${linkData.nome}" já existe, pulando...`);
        stats.linksExisting++;
        continue;
      }

      // Buscar ObjectId da categoria
      const categoriaId = categoriaMap[linkData.categoria];
      if (!categoriaId) {
        log.error(`Categoria "${linkData.categoria}" não encontrada para link "${linkData.nome}"`);
        continue;
      }

      // Buscar ObjectIds das tags
      const tagIds = (linkData.tags || []).map(tagNome => tagMap[tagNome]).filter(Boolean);

      // Criar link
      const link = await Link.create({
        nome: linkData.nome,
        endereco: linkData.endereco,
        observacoes: linkData.observacoes || '',
        credenciais: linkData.credenciais || '',
        categoria: categoriaId,
        tags: tagIds,
        icone: linkData.icone || '🔗',
        cor: linkData.cor || '#64748b',
        ativo: true,
        ordem: stats.linksCreated // Ordem sequencial
      });

      log.success(`Link "${linkData.nome}" criado`);
      log.data(`  → Categoria: ${linkData.categoria}`);
      log.data(`  → Tags: ${linkData.tags ? linkData.tags.join(', ') : 'nenhuma'}`);

      stats.linksCreated++;
    }

    // ============================================
    // ESTATÍSTICAS FINAIS
    // ============================================
    log.info('\n' + '='.repeat(60));
    log.info('MIGRAÇÃO CONCLUÍDA!');
    log.info('='.repeat(60));

    console.log(`\n${colors.cyan}📊 Estatísticas:${colors.reset}`);
    console.log(`\n  Variáveis:`);
    console.log(`    • Criadas: ${colors.green}${stats.variablesCreated}${colors.reset}`);
    console.log(`    • Existentes: ${colors.yellow}${stats.variablesExisting}${colors.reset}`);

    console.log(`\n  Categorias:`);
    console.log(`    • Criadas: ${colors.green}${stats.categoriesCreated}${colors.reset}`);
    console.log(`    • Existentes: ${colors.yellow}${stats.categoriesExisting}${colors.reset}`);

    console.log(`\n  Tags:`);
    console.log(`    • Criadas: ${colors.green}${stats.tagsCreated}${colors.reset}`);
    console.log(`    • Existentes: ${colors.yellow}${stats.tagsExisting}${colors.reset}`);

    console.log(`\n  Links:`);
    console.log(`    • Criados: ${colors.green}${stats.linksCreated}${colors.reset}`);
    console.log(`    • Existentes: ${colors.yellow}${stats.linksExisting}${colors.reset}`);

    console.log(`\n${colors.green}✓ Total de ${stats.linksCreated} links migrados com sucesso!${colors.reset}\n`);

    // Fechar conexão
    await mongoose.connection.close();
    log.success('Conexão com MongoDB fechada');
    process.exit(0);

  } catch (error) {
    log.error(`Erro na migração: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar migração
log.info('='.repeat(60));
log.info('INICIANDO MIGRAÇÃO DE DADOS LEGACY → MongoDB');
log.info('='.repeat(60));
migrate();

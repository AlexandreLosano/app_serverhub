// Script para importar dados exportados do MongoDB para o SQLite.
//
// Pré-requisito: exportar as coleções do MongoDB antes de rodar:
//   mongoexport --uri "mongodb://admin:admin@localhost:27017/server_hub?authSource=admin" \
//     --collection categories --out /app/data/export_categories.json --jsonArray
//   mongoexport ... --collection tags      --out /app/data/export_tags.json      --jsonArray
//   mongoexport ... --collection links     --out /app/data/export_links.json     --jsonArray
//   mongoexport ... --collection variables --out /app/data/export_variables.json --jsonArray
//
// Execução dentro do container:
//   docker exec new-server-hub-backend node src/scripts/import-from-mongo.js

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const dataDir = path.dirname(process.env.DB_PATH || '/app/data/database.db');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info:    (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error:   (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  data:    (msg) => console.log(`${colors.cyan}  ${msg}${colors.reset}`),
};

function readJson(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    log.warning(`Arquivo não encontrado: ${filePath} — pulando.`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function mongoId(obj) {
  // Suporte a ObjectId como string ou { $oid: '...' }
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  if (obj.$oid) return obj.$oid;
  return String(obj);
}

function importData() {
  const stats = { categories: 0, tags: 0, links: 0, variables: 0, skipped: 0 };

  log.info('='.repeat(60));
  log.info('IMPORTAÇÃO MongoDB → SQLite');
  log.info('='.repeat(60));

  // ── Categorias ──────────────────────────────────────────────
  log.info('\n[1/4] Importando categorias...');
  const categories = readJson('export_categories.json');
  const catIdMap = {}; // mongoId → sqliteId

  const insertCat = db.prepare(`
    INSERT OR IGNORE INTO categories (nome, descricao, icone, cor, ordem)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const c of categories) {
    const mongoObjId = mongoId(c._id);
    const existing = db.prepare('SELECT id FROM categories WHERE nome = ?').get(c.nome);
    if (existing) {
      catIdMap[mongoObjId] = existing.id;
      log.warning(`Categoria "${c.nome}" já existe (id=${existing.id}), reutilizando.`);
      stats.skipped++;
    } else {
      const result = insertCat.run(c.nome, c.descricao || '', c.icone || '📁', c.cor || '#4CAF50', c.ordem || 0);
      catIdMap[mongoObjId] = result.lastInsertRowid;
      log.success(`Categoria "${c.nome}" → id=${result.lastInsertRowid}`);
      stats.categories++;
    }
  }

  // ── Tags ─────────────────────────────────────────────────────
  log.info('\n[2/4] Importando tags...');
  const tags = readJson('export_tags.json');
  const tagIdMap = {}; // mongoId → sqliteId

  const insertTag = db.prepare(`
    INSERT OR IGNORE INTO tags (nome, descricao, cor)
    VALUES (?, ?, ?)
  `);

  for (const t of tags) {
    const mongoObjId = mongoId(t._id);
    const nome = (t.nome || '').toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM tags WHERE nome = ?').get(nome);
    if (existing) {
      tagIdMap[mongoObjId] = existing.id;
      log.warning(`Tag "${nome}" já existe (id=${existing.id}), reutilizando.`);
      stats.skipped++;
    } else {
      const result = insertTag.run(nome, t.descricao || '', t.cor || '#2196F3');
      tagIdMap[mongoObjId] = result.lastInsertRowid;
      log.success(`Tag "${nome}" → id=${result.lastInsertRowid}`);
      stats.tags++;
    }
  }

  // ── Links ────────────────────────────────────────────────────
  log.info('\n[3/4] Importando links...');
  const links = readJson('export_links.json');

  const insertLink = db.prepare(`
    INSERT OR IGNORE INTO links (nome, endereco, observacoes, credenciais, categoria_id, icone, cor, ordem, ativo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLinkTag = db.prepare('INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)');

  for (const l of links) {
    const catMongoId = mongoId(l.categoria);
    const catSqlId = catIdMap[catMongoId];

    if (!catSqlId) {
      log.error(`Link "${l.nome}": categoria MongoDB ${catMongoId} não mapeada — pulando.`);
      stats.skipped++;
      continue;
    }

    const existing = db.prepare('SELECT id FROM links WHERE nome = ? AND endereco = ?').get(l.nome, l.endereco);
    if (existing) {
      log.warning(`Link "${l.nome}" já existe, pulando.`);
      stats.skipped++;
      continue;
    }

    const result = insertLink.run(
      l.nome,
      l.endereco,
      l.observacoes || '',
      l.credenciais || '',
      catSqlId,
      l.icone || '🔗',
      l.cor || '#4CAF50',
      l.ordem || 0,
      l.ativo !== false ? 1 : 0
    );

    const linkSqlId = result.lastInsertRowid;

    const linkTags = Array.isArray(l.tags) ? l.tags : [];
    for (const tagRef of linkTags) {
      const tagMongoId = mongoId(tagRef);
      const tagSqlId = tagIdMap[tagMongoId];
      if (tagSqlId) {
        insertLinkTag.run(linkSqlId, tagSqlId);
      } else {
        log.warning(`  Tag MongoDB ${tagMongoId} não mapeada para link "${l.nome}".`);
      }
    }

    log.success(`Link "${l.nome}" → id=${linkSqlId}`);
    log.data(`  → Categoria: ${catSqlId} | Tags: ${linkTags.length}`);
    stats.links++;
  }

  // ── Variáveis ─────────────────────────────────────────────────
  log.info('\n[4/4] Importando variáveis...');
  const variables = readJson('export_variables.json');

  const insertVar = db.prepare(`
    INSERT OR IGNORE INTO variables (chave, valor, descricao)
    VALUES (?, ?, ?)
  `);

  for (const v of variables) {
    const chave = (v.chave || '').toUpperCase().trim();
    const existing = db.prepare('SELECT id FROM variables WHERE chave = ?').get(chave);
    if (existing) {
      log.warning(`Variável "${chave}" já existe, pulando.`);
      stats.skipped++;
    } else {
      insertVar.run(chave, v.valor, v.descricao || '');
      log.success(`Variável "${chave}" importada.`);
      stats.variables++;
    }
  }

  // ── Resumo ────────────────────────────────────────────────────
  log.info('\n' + '='.repeat(60));
  log.success('IMPORTAÇÃO CONCLUÍDA!');
  log.info('='.repeat(60));
  console.log(`\n${colors.cyan}📊 Resumo:${colors.reset}`);
  console.log(`  Categorias importadas : ${colors.green}${stats.categories}${colors.reset}`);
  console.log(`  Tags importadas       : ${colors.green}${stats.tags}${colors.reset}`);
  console.log(`  Links importados      : ${colors.green}${stats.links}${colors.reset}`);
  console.log(`  Variáveis importadas  : ${colors.green}${stats.variables}${colors.reset}`);
  console.log(`  Ignorados (duplicados): ${colors.yellow}${stats.skipped}${colors.reset}`);
  console.log(`\n${colors.green}✓ Abra ./data/database.db no DB Browser for SQLite para conferir.${colors.reset}\n`);
}

importData();

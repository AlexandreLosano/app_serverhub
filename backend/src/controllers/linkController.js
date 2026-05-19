const db = require('../config/database');

const LINK_SELECT = `
  SELECT
    l.*,
    c.nome  AS cat_nome,
    c.icone AS cat_icone,
    c.cor   AS cat_cor,
    (
      SELECT json_group_array(json_object('_id', CAST(t.id AS TEXT), 'nome', t.nome, 'cor', t.cor))
      FROM link_tags lt JOIN tags t ON lt.tag_id = t.id
      WHERE lt.link_id = l.id
    ) AS tags_json
  FROM links l
  LEFT JOIN categories c ON l.categoria_id = c.id
`;

function formatLink(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    nome: row.nome,
    endereco: row.endereco,
    observacoes: row.observacoes,
    credenciais: row.credenciais,
    categoria: {
      _id: String(row.categoria_id),
      nome: row.cat_nome,
      icone: row.cat_icone,
      cor: row.cat_cor,
    },
    icone: row.icone,
    cor: row.cor,
    ordem: row.ordem,
    ativo: row.ativo === 1,
    tags: row.tags_json ? JSON.parse(row.tags_json) : [],
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

// @desc    Listar todos os links
// @route   GET /api/links
// @query   ?categoria=id&tags=id1,id2&search=termo&ativo=true
const getLinks = (req, res, next) => {
  try {
    const { categoria, tags, search, ativo } = req.query;

    const conditions = [];
    const params = [];

    if (categoria) {
      conditions.push('l.categoria_id = ?');
      params.push(Number(categoria));
    }

    if (tags) {
      const tagIds = tags.split(',').map(Number).filter(Boolean);
      if (tagIds.length > 0) {
        conditions.push(
          `EXISTS (SELECT 1 FROM link_tags lt2 WHERE lt2.link_id = l.id AND lt2.tag_id IN (${tagIds.map(() => '?').join(',')}))`
        );
        params.push(...tagIds);
      }
    }

    if (search) {
      conditions.push('(l.nome LIKE ? OR l.observacoes LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (ativo !== undefined) {
      conditions.push('l.ativo = ?');
      params.push(ativo === 'true' ? 1 : 0);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = db.prepare(`${LINK_SELECT} ${where} ORDER BY l.ordem ASC`).all(params);

    res.json({ success: true, count: rows.length, data: rows.map(formatLink) });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar link por ID
// @route   GET /api/links/:id
const getLinkById = (req, res, next) => {
  try {
    const row = db.prepare(`${LINK_SELECT} WHERE l.id = ?`).get(Number(req.params.id));

    if (!row) {
      return res.status(404).json({ success: false, error: 'Link não encontrado' });
    }

    res.json({ success: true, data: formatLink(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar novo link
// @route   POST /api/links
const createLink = (req, res, next) => {
  try {
    console.log('📥 POST /api/links - Recebido:', JSON.stringify(req.body, null, 2));

    const { nome, endereco, observacoes = '', credenciais = '', categoria, icone = '🔗', cor = '#4CAF50', ordem = 0, ativo = true, tags = [] } = req.body;

    const insert = db.prepare(`
      INSERT INTO links (nome, endereco, observacoes, credenciais, categoria_id, icone, cor, ordem, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(nome, endereco, observacoes, credenciais, Number(categoria), icone, cor, ordem, ativo ? 1 : 0);
    const linkId = result.lastInsertRowid;

    if (tags && tags.length > 0) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)');
      for (const tagId of tags) {
        insertTag.run(linkId, Number(tagId));
      }
    }

    const row = db.prepare(`${LINK_SELECT} WHERE l.id = ?`).get(linkId);
    console.log('✅ Link criado com ID:', linkId);

    res.status(201).json({ success: true, data: formatLink(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar link
// @route   PUT /api/links/:id
const updateLink = (req, res, next) => {
  try {
    const linkId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM links WHERE id = ?').get(linkId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Link não encontrado' });
    }

    const { tags: newTags, categoria, ativo, ...rest } = req.body;

    const fields = [];
    const params = [];

    const allowed = ['nome', 'endereco', 'observacoes', 'credenciais', 'icone', 'cor', 'ordem'];
    for (const key of allowed) {
      if (rest[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(rest[key]);
      }
    }

    if (categoria !== undefined) {
      fields.push('categoria_id = ?');
      params.push(Number(categoria));
    }

    if (ativo !== undefined) {
      fields.push('ativo = ?');
      params.push(ativo ? 1 : 0);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(linkId);
      db.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`).run(params);
    }

    if (newTags !== undefined) {
      db.prepare('DELETE FROM link_tags WHERE link_id = ?').run(linkId);
      const insertTag = db.prepare('INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)');
      for (const tagId of newTags) {
        insertTag.run(linkId, Number(tagId));
      }
    }

    const row = db.prepare(`${LINK_SELECT} WHERE l.id = ?`).get(linkId);
    res.json({ success: true, data: formatLink(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar link
// @route   DELETE /api/links/:id
const deleteLink = (req, res, next) => {
  try {
    const linkId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM links WHERE id = ?').get(linkId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Link não encontrado' });
    }

    db.prepare('DELETE FROM links WHERE id = ?').run(linkId);

    res.json({ success: true, data: {}, message: 'Link removido com sucesso' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reordenar links (drag-and-drop)
// @route   PATCH /api/links/reorder
// @body    { links: [{ id, ordem }] }
const reorderLinks = (req, res, next) => {
  try {
    const { links } = req.body;

    if (!links || !Array.isArray(links)) {
      return res.status(400).json({ success: false, error: 'Array de links é obrigatório' });
    }

    const update = db.prepare('UPDATE links SET ordem = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const reorder = db.transaction((items) => {
      for (const { id, ordem } of items) {
        update.run(ordem, Number(id));
      }
    });

    reorder(links);

    res.json({ success: true, message: 'Ordem dos links atualizada com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLinks, getLinkById, createLink, updateLink, deleteLink, reorderLinks };

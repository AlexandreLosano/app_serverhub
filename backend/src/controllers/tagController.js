const db = require('../config/database');

function formatTag(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    nome: row.nome,
    descricao: row.descricao,
    cor: row.cor,
    usoContador: row.usoContador ?? 0,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

// @desc    Listar todas as tags
// @route   GET /api/tags
// @query   ?sort=uso (ordena por usoContador decrescente)
const getTags = (req, res, next) => {
  try {
    const { sort } = req.query;

    const orderBy = sort === 'uso' ? 'usoContador DESC' : 'nome ASC';

    const rows = db.prepare(`
      SELECT t.*, COUNT(lt.link_id) AS usoContador
      FROM tags t
      LEFT JOIN link_tags lt ON lt.tag_id = t.id
      GROUP BY t.id
      ORDER BY ${orderBy}
    `).all();

    res.json({ success: true, count: rows.length, data: rows.map(formatTag) });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar tag por ID
// @route   GET /api/tags/:id
const getTagById = (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    const row = db.prepare(`
      SELECT t.*, COUNT(lt.link_id) AS usoContador
      FROM tags t
      LEFT JOIN link_tags lt ON lt.tag_id = t.id
      WHERE t.id = ?
      GROUP BY t.id
    `).get(tagId);

    if (!row) {
      return res.status(404).json({ success: false, error: 'Tag não encontrada' });
    }

    const linkCount = db.prepare('SELECT COUNT(*) AS cnt FROM link_tags WHERE tag_id = ?').get(tagId).cnt;

    res.json({ success: true, data: { ...formatTag(row), linkCount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova tag
// @route   POST /api/tags
const createTag = (req, res, next) => {
  try {
    const { nome, descricao = '', cor = '#2196F3' } = req.body;

    const result = db.prepare(
      'INSERT INTO tags (nome, descricao, cor) VALUES (?, ?, ?)'
    ).run(nome ? nome.toLowerCase().trim() : nome, descricao, cor);

    const row = db.prepare('SELECT *, 0 AS usoContador FROM tags WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: formatTag(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar tag
// @route   PUT /api/tags/:id
const updateTag = (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM tags WHERE id = ?').get(tagId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Tag não encontrada' });
    }

    const fields = [];
    const params = [];
    const allowed = ['nome', 'descricao', 'cor'];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const val = key === 'nome' ? req.body[key].toLowerCase().trim() : req.body[key];
        fields.push(`${key} = ?`);
        params.push(val);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(tagId);
      db.prepare(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`).run(params);
    }

    const row = db.prepare(`
      SELECT t.*, COUNT(lt.link_id) AS usoContador
      FROM tags t LEFT JOIN link_tags lt ON lt.tag_id = t.id
      WHERE t.id = ? GROUP BY t.id
    `).get(tagId);

    res.json({ success: true, data: formatTag(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar tag
// @route   DELETE /api/tags/:id
const deleteTag = (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM tags WHERE id = ?').get(tagId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Tag não encontrada' });
    }

    // link_tags removidas por CASCADE no schema
    db.prepare('DELETE FROM tags WHERE id = ?').run(tagId);

    res.json({ success: true, data: {}, message: 'Tag removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTags, getTagById, createTag, updateTag, deleteTag };

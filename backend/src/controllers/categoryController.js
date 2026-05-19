const db = require('../config/database');

function formatCategory(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    nome: row.nome,
    descricao: row.descricao,
    icone: row.icone,
    cor: row.cor,
    ordem: row.ordem,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

// @desc    Listar todas as categorias
// @route   GET /api/categories
const getCategories = (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM categories ORDER BY ordem ASC').all();
    res.json({ success: true, count: rows.length, data: rows.map(formatCategory) });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar categoria por ID
// @route   GET /api/categories/:id
const getCategoryById = (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(req.params.id));

    if (!row) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }

    const linkCount = db.prepare('SELECT COUNT(*) AS cnt FROM links WHERE categoria_id = ?').get(Number(req.params.id)).cnt;

    res.json({ success: true, data: { ...formatCategory(row), linkCount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova categoria
// @route   POST /api/categories
const createCategory = (req, res, next) => {
  try {
    const { nome, descricao = '', icone = '📁', cor = '#4CAF50', ordem = 0 } = req.body;

    const result = db.prepare(
      'INSERT INTO categories (nome, descricao, icone, cor, ordem) VALUES (?, ?, ?, ?, ?)'
    ).run(nome, descricao, icone, cor, ordem);

    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: formatCategory(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar categoria
// @route   PUT /api/categories/:id
const updateCategory = (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(catId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }

    const fields = [];
    const params = [];
    const allowed = ['nome', 'descricao', 'icone', 'cor', 'ordem'];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(catId);
      db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(params);
    }

    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
    res.json({ success: true, data: formatCategory(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar categoria
// @route   DELETE /api/categories/:id
const deleteCategory = (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(catId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }

    const linkCount = db.prepare('SELECT COUNT(*) AS cnt FROM links WHERE categoria_id = ?').get(catId).cnt;
    if (linkCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível deletar. ${linkCount} link(s) estão usando esta categoria.`,
      });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
    res.json({ success: true, data: {}, message: 'Categoria removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

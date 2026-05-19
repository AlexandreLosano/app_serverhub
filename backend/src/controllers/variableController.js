const db = require('../config/database');

function formatVariable(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    chave: row.chave,
    valor: row.valor,
    descricao: row.descricao,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

// @desc    Listar todas as variáveis
// @route   GET /api/variables
const getVariables = (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM variables ORDER BY chave ASC').all();
    res.json({ success: true, count: rows.length, data: rows.map(formatVariable) });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar variável por chave
// @route   GET /api/variables/:chave
const getVariableByKey = (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM variables WHERE chave = ?').get(req.params.chave.toUpperCase());

    if (!row) {
      return res.status(404).json({ success: false, error: 'Variável não encontrada' });
    }

    res.json({ success: true, data: formatVariable(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova variável
// @route   POST /api/variables
const createVariable = (req, res, next) => {
  try {
    const { chave, valor, descricao = '' } = req.body;

    const result = db.prepare(
      'INSERT INTO variables (chave, valor, descricao) VALUES (?, ?, ?)'
    ).run(chave ? chave.toUpperCase().trim() : chave, valor, descricao);

    const row = db.prepare('SELECT * FROM variables WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: formatVariable(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar variável
// @route   PUT /api/variables/:chave
const updateVariable = (req, res, next) => {
  try {
    const chave = req.params.chave.toUpperCase();
    const existing = db.prepare('SELECT id FROM variables WHERE chave = ?').get(chave);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Variável não encontrada' });
    }

    const fields = [];
    const params = [];
    const allowed = ['valor', 'descricao'];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(chave);
      db.prepare(`UPDATE variables SET ${fields.join(', ')} WHERE chave = ?`).run(params);
    }

    const row = db.prepare('SELECT * FROM variables WHERE chave = ?').get(chave);
    res.json({ success: true, data: formatVariable(row) });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar variável
// @route   DELETE /api/variables/:chave
const deleteVariable = (req, res, next) => {
  try {
    const chave = req.params.chave.toUpperCase();
    const existing = db.prepare('SELECT id FROM variables WHERE chave = ?').get(chave);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Variável não encontrada' });
    }

    db.prepare('DELETE FROM variables WHERE chave = ?').run(chave);
    res.json({ success: true, data: {}, message: 'Variável removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVariables, getVariableByKey, createVariable, updateVariable, deleteVariable };

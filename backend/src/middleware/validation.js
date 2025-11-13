// Middleware de validação simples
// Para validações mais complexas, considerar usar Joi ou Zod

const validateLinkCreate = (req, res, next) => {
  const { nome, endereco, categoria } = req.body;

  if (!nome || nome.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Nome é obrigatório e deve ter no mínimo 3 caracteres',
    });
  }

  if (!endereco || endereco.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Endereço (URL) é obrigatório',
    });
  }

  if (!categoria) {
    return res.status(400).json({
      success: false,
      error: 'Categoria é obrigatória',
    });
  }

  next();
};

const validateCategoryCreate = (req, res, next) => {
  const { nome } = req.body;

  if (!nome || nome.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Nome da categoria é obrigatório',
    });
  }

  next();
};

const validateTagCreate = (req, res, next) => {
  const { nome } = req.body;

  if (!nome || nome.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Nome da tag é obrigatório',
    });
  }

  next();
};

const validateVariableCreate = (req, res, next) => {
  const { chave, valor } = req.body;

  if (!chave || chave.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Chave da variável é obrigatória',
    });
  }

  if (!valor || valor.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Valor da variável é obrigatório',
    });
  }

  next();
};

module.exports = {
  validateLinkCreate,
  validateCategoryCreate,
  validateTagCreate,
  validateVariableCreate,
};

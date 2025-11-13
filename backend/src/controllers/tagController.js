const Tag = require('../models/Tag');
const Link = require('../models/Link');

// @desc    Listar todas as tags
// @route   GET /api/tags
// @query   ?sort=uso (ordena por usoContador decrescente)
const getTags = async (req, res, next) => {
  try {
    const { sort } = req.query;

    let query = Tag.find();

    // Ordenação
    if (sort === 'uso') {
      query = query.sort({ usoContador: -1 });
    } else {
      query = query.sort({ nome: 1 });
    }

    const tags = await query;

    res.json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar tag por ID
// @route   GET /api/tags/:id
const getTagById = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag não encontrada',
      });
    }

    // Contar quantos links usam esta tag
    const linkCount = await Link.countDocuments({ tags: tag._id });

    res.json({
      success: true,
      data: {
        ...tag.toJSON(),
        linkCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova tag
// @route   POST /api/tags
const createTag = async (req, res, next) => {
  try {
    const tag = await Tag.create(req.body);

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar tag
// @route   PUT /api/tags/:id
const updateTag = async (req, res, next) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag não encontrada',
      });
    }

    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar tag
// @route   DELETE /api/tags/:id
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag não encontrada',
      });
    }

    // Remover tag de todos os links que a utilizam
    await Link.updateMany(
      { tags: tag._id },
      { $pull: { tags: tag._id } }
    );

    await tag.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Tag removida com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};

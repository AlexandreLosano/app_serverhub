const Category = require('../models/Category');
const Link = require('../models/Link');

// @desc    Listar todas as categorias
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ ordem: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar categoria por ID
// @route   GET /api/categories/:id
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada',
      });
    }

    // Contar quantos links usam esta categoria
    const linkCount = await Link.countDocuments({ categoria: category._id });

    res.json({
      success: true,
      data: {
        ...category.toJSON(),
        linkCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova categoria
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar categoria
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar categoria
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada',
      });
    }

    // Verificar se há links usando esta categoria
    const linkCount = await Link.countDocuments({ categoria: category._id });

    if (linkCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível deletar. ${linkCount} link(s) estão usando esta categoria.`,
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Categoria removida com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

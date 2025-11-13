const Variable = require('../models/Variable');

// @desc    Listar todas as variáveis
// @route   GET /api/variables
const getVariables = async (req, res, next) => {
  try {
    const variables = await Variable.find().sort({ chave: 1 });

    res.json({
      success: true,
      count: variables.length,
      data: variables,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar variável por chave
// @route   GET /api/variables/:chave
const getVariableByKey = async (req, res, next) => {
  try {
    const variable = await Variable.findOne({
      chave: req.params.chave.toUpperCase()
    });

    if (!variable) {
      return res.status(404).json({
        success: false,
        error: 'Variável não encontrada',
      });
    }

    res.json({
      success: true,
      data: variable,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova variável
// @route   POST /api/variables
const createVariable = async (req, res, next) => {
  try {
    const variable = await Variable.create(req.body);

    res.status(201).json({
      success: true,
      data: variable,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar variável
// @route   PUT /api/variables/:chave
const updateVariable = async (req, res, next) => {
  try {
    const variable = await Variable.findOneAndUpdate(
      { chave: req.params.chave.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!variable) {
      return res.status(404).json({
        success: false,
        error: 'Variável não encontrada',
      });
    }

    res.json({
      success: true,
      data: variable,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar variável
// @route   DELETE /api/variables/:chave
const deleteVariable = async (req, res, next) => {
  try {
    const variable = await Variable.findOneAndDelete({
      chave: req.params.chave.toUpperCase()
    });

    if (!variable) {
      return res.status(404).json({
        success: false,
        error: 'Variável não encontrada',
      });
    }

    res.json({
      success: true,
      data: {},
      message: 'Variável removida com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVariables,
  getVariableByKey,
  createVariable,
  updateVariable,
  deleteVariable,
};

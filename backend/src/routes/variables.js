const express = require('express');
const router = express.Router();
const {
  getVariables,
  getVariableByKey,
  createVariable,
  updateVariable,
  deleteVariable,
} = require('../controllers/variableController');

router.route('/')
  .get(getVariables)
  .post(createVariable);

router.route('/:chave')
  .get(getVariableByKey)
  .put(updateVariable)
  .delete(deleteVariable);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} = require('../controllers/linkController');

// Rota especial para reordenar (deve vir antes de /:id)
router.patch('/reorder', reorderLinks);

// Rotas CRUD
router.route('/')
  .get(getLinks)
  .post(createLink);

router.route('/:id')
  .get(getLinkById)
  .put(updateLink)
  .delete(deleteLink);

module.exports = router;

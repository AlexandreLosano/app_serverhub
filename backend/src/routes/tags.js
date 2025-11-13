const express = require('express');
const router = express.Router();
const {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} = require('../controllers/tagController');

router.route('/')
  .get(getTags)
  .post(createTag);

router.route('/:id')
  .get(getTagById)
  .put(updateTag)
  .delete(deleteTag);

module.exports = router;

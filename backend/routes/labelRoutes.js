const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labelController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET all labels
router.get('/', labelController.getLabels);

// POST create label
router.post('/', labelController.createLabel);

// PUT update label
router.put('/:id', labelController.updateLabel);

// DELETE label
router.delete('/:id', labelController.deleteLabel);

// Task label operations
router.post('/task/:taskId/:labelId', labelController.addLabelToTask);
router.delete('/task/:taskId/:labelId', labelController.removeLabelFromTask);

module.exports = router;

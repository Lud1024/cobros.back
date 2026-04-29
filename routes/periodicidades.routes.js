// routes/periodicidades.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/periodicidades.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las periodicidades
router.get('/', ctrl.getAll);

// Obtiene una periodicidad por ID
router.get('/:id', ctrl.getById);

// Crea una nueva periodicidad
router.post('/', ctrl.create);

// Actualiza una periodicidad existente
router.patch('/:id', authenticateToken, requirePermission('gestionar_periodicidades'), ctrl.update);

// Elimina una periodicidad
router.delete('/:id', authenticateToken, requirePermission('gestionar_periodicidades'), ctrl.remove);

module.exports = router;

// routes/carteras.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/carteras.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las carteras
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene una cartera por ID
router.get('/:id', authenticateToken, ctrl.getById);

// Crea una nueva cartera
router.post('/', authenticateToken, requirePermission('gestionar_carteras'), ctrl.create);

// Actualiza una cartera existente
router.patch('/:id', authenticateToken, requirePermission('gestionar_carteras'), ctrl.update);

// Elimina una cartera
router.delete('/:id', authenticateToken, requirePermission('gestionar_carteras'), ctrl.remove);

module.exports = router;

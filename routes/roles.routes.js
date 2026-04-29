// routes/roles.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roles.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los roles
router.get('/', ctrl.getAll);

// Obtiene un rol por ID
router.get('/:id', ctrl.getById);

// Crea un nuevo rol
router.post('/', ctrl.create);

// Actualiza un rol existente
router.patch('/:id', authenticateToken, requirePermission('gestionar_roles'), ctrl.update);

// Elimina un rol
router.delete('/:id', authenticateToken, requirePermission('gestionar_roles'), ctrl.remove);

module.exports = router;

// routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientes.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los clientes (requiere autenticación)
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene un cliente por ID (requiere autenticación)
router.get('/:id', authenticateToken, ctrl.getById);

// Crea un nuevo cliente (requiere autenticación)
router.post('/', authenticateToken, ctrl.create);

// Actualiza un cliente existente (requiere autenticación)
router.patch('/:id', authenticateToken, requirePermission('editar_clientes'), ctrl.update);

// Elimina un cliente (requiere autenticación)
router.delete('/:id', authenticateToken, requirePermission('eliminar_clientes'), ctrl.remove);

module.exports = router;

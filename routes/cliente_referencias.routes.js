// routes/cliente_referencias.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cliente_referencias.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las referencias de clientes
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene referencias de un cliente especifico
router.get('/cliente/:id_cliente', authenticateToken, ctrl.getByCliente);

// Obtiene una referencia por ID
router.get('/:id', authenticateToken, ctrl.getById);

// Crea una nueva referencia de cliente
router.post('/', authenticateToken, requirePermission('clientes'), ctrl.create);

// Actualiza una referencia existente
router.patch('/:id', authenticateToken, requirePermission(['clientes', 'editar_clientes']), ctrl.update);

// Elimina una referencia
router.delete('/:id', authenticateToken, requirePermission(['clientes', 'eliminar_clientes']), ctrl.remove);

module.exports = router;

// routes/cliente_documentos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cliente_documentos.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los documentos de clientes
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene documentos de un cliente específico
router.get('/cliente/:id_cliente', authenticateToken, ctrl.getByCliente);

// Obtiene documentos por tipo
router.get('/tipo/:tipo_documento', authenticateToken, ctrl.getByTipo);

// Obtiene un documento por ID
router.get('/:id', authenticateToken, ctrl.getById);

// Crea un nuevo documento de cliente
router.post('/', authenticateToken, ctrl.create);

// Actualiza un documento de cliente existente
router.patch('/:id', authenticateToken, requirePermission('gestionar_documentos'), ctrl.update);

// Elimina un documento de cliente
router.delete('/:id', authenticateToken, requirePermission('gestionar_documentos'), ctrl.remove);

module.exports = router;

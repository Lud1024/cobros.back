// routes/prestamos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prestamos.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los préstamos
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene préstamos por cliente
router.get('/cliente/:id_cliente', authenticateToken, ctrl.getByCliente);

// Obtiene un préstamo por ID
router.get('/:id', authenticateToken, ctrl.getById);

// Crea un nuevo préstamo
router.post('/', authenticateToken, ctrl.create);

// Actualiza un préstamo existente
router.patch('/:id', authenticateToken, requirePermission('editar_prestamos'), ctrl.update);

// Elimina un préstamo
router.delete('/:id', authenticateToken, requirePermission('eliminar_prestamos'), ctrl.remove);

module.exports = router;

// routes/prestamos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prestamos.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los préstamos
router.get('/', ctrl.getAll);

// Obtiene préstamos por cliente
router.get('/cliente/:id_cliente', ctrl.getByCliente);

// Obtiene un préstamo por ID
router.get('/:id', ctrl.getById);

// Crea un nuevo préstamo
router.post('/', ctrl.create);

// Actualiza un préstamo existente
router.patch('/:id', authenticateToken, requirePermission('editar_prestamos'), ctrl.update);

// Elimina un préstamo
router.delete('/:id', authenticateToken, requirePermission('eliminar_prestamos'), ctrl.remove);

module.exports = router;

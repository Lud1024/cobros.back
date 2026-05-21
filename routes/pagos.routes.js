// routes/pagos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pagos.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los pagos
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene pagos por préstamo
router.get('/prestamo/:id_prestamo', authenticateToken, ctrl.getByPrestamo);

// Obtiene pagos por cliente
router.get('/cliente/:id_cliente', authenticateToken, ctrl.getByCliente);

// Obtiene un pago por ID
router.get('/:id', authenticateToken, ctrl.getById);

// Crea un nuevo pago
router.post('/', authenticateToken, ctrl.create);

// Actualiza un pago existente
router.patch('/:id', authenticateToken, requirePermission('editar_pagos'), ctrl.update);

// Elimina un pago
router.delete('/:id', authenticateToken, requirePermission('eliminar_pagos'), ctrl.remove);

module.exports = router;

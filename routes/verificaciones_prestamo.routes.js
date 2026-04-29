// routes/verificaciones_prestamo.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/verificaciones_prestamo.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las verificaciones de préstamo
router.get('/', ctrl.getAll);

// Obtiene verificaciones de un cliente específico
router.get('/cliente/:id_cliente', ctrl.getByCliente);

// Obtiene verificaciones por estado
router.get('/estado/:estado', ctrl.getByEstado);

// Obtiene verificaciones por analista
router.get('/analista/:analista', ctrl.getByAnalista);

// Obtiene una verificación por ID
router.get('/:id', ctrl.getById);

// Crea una nueva verificación de préstamo
router.post('/', ctrl.create);

// Actualiza una verificación de préstamo existente
router.patch('/:id', authenticateToken, requirePermission('verificar_prestamos'), ctrl.update);

// Elimina una verificación de préstamo
router.delete('/:id', authenticateToken, requirePermission('verificar_prestamos'), ctrl.remove);

module.exports = router;

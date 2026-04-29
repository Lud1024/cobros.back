// routes/rechazos_historial.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rechazos_historial.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los rechazos de historial
router.get('/', ctrl.getAll);

// Obtiene rechazos de una verificación específica
router.get('/verificacion/:id_verificacion', ctrl.getByVerificacion);

// Obtiene un rechazo por ID
router.get('/:id', ctrl.getById);

// Crea un nuevo rechazo de historial
router.post('/', ctrl.create);

// Actualiza un rechazo de historial existente
router.patch('/:id', authenticateToken, requirePermission('rechazar_prestamos'), ctrl.update);

// Elimina un rechazo de historial
router.delete('/:id', authenticateToken, requirePermission('rechazar_prestamos'), ctrl.remove);

module.exports = router;

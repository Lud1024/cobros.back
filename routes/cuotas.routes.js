// routes/cuotas.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cuotas.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las cuotas
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene cuotas por préstamo
router.get('/prestamo/:id_prestamo', authenticateToken, ctrl.getByPrestamo);

// Obtiene una cuota por ID
router.get('/:id', authenticateToken, ctrl.getById);

// Crea una nueva cuota
router.post('/', authenticateToken, requirePermission('gestionar_cuotas'), ctrl.create);

// Actualiza una cuota existente
router.patch('/:id', authenticateToken, requirePermission('gestionar_cuotas'), ctrl.update);

// Elimina una cuota
router.delete('/:id', authenticateToken, requirePermission('gestionar_cuotas'), ctrl.remove);

module.exports = router;

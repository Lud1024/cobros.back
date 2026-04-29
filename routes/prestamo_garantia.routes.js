// routes/prestamo_garantia.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prestamo_garantia.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las relaciones préstamo-garantía
router.get('/', ctrl.getAll);

// Obtiene garantías de un préstamo específico
router.get('/prestamo/:id_prestamo', ctrl.getByPrestamo);

// Obtiene préstamos que usan un método de garantía específico
router.get('/metodo/:id_metodo', ctrl.getByMetodo);

// Crea una nueva relación préstamo-garantía
router.post('/', ctrl.create);

// Actualiza una relación préstamo-garantía existente
router.patch('/prestamo/:id_prestamo/metodo/:id_metodo', authenticateToken, requirePermission('gestionar_garantias'), ctrl.update);

// Elimina una relación préstamo-garantía
router.delete('/prestamo/:id_prestamo/metodo/:id_metodo', authenticateToken, requirePermission('gestionar_garantias'), ctrl.remove);

module.exports = router;

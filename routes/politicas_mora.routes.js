// routes/politicas_mora.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/politicas_mora.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las políticas de mora
router.get('/', ctrl.getAll);

// Obtiene políticas de una cartera específica
router.get('/cartera/:id_cartera', ctrl.getByCartera);

// Obtiene políticas vigentes (fecha actual dentro del rango)
router.get('/vigentes', ctrl.getVigentes);

// Obtiene una política por ID
router.get('/:id', ctrl.getById);

// Crea una nueva política de mora
router.post('/', ctrl.create);

// Actualiza una política de mora existente
router.patch('/:id', authenticateToken, requirePermission('editar_politicas'), ctrl.update);

// Elimina una política de mora
router.delete('/:id', authenticateToken, requirePermission('editar_politicas'), ctrl.remove);

module.exports = router;

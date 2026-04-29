// routes/mora_eventos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mora_eventos.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todos los eventos de mora
router.get('/', ctrl.getAll);

// Obtiene eventos de mora de una cuota específica
router.get('/cuota/:id_cuota', ctrl.getByCuota);

// Obtiene eventos de mora por fecha de cálculo
router.get('/fecha/:fecha_calculo', ctrl.getByFecha);

// Obtiene un evento de mora por ID
router.get('/:id', ctrl.getById);

// Crea un nuevo evento de mora
router.post('/', ctrl.create);

// Actualiza un evento de mora existente
router.patch('/:id', authenticateToken, requirePermission('gestionar_mora'), ctrl.update);

// Elimina un evento de mora
router.delete('/:id', authenticateToken, requirePermission('gestionar_mora'), ctrl.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportes.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/diario', authenticateToken, ctrl.getDiario);
router.get('/pagos', authenticateToken, ctrl.getPagos);
router.get('/prestamos-cerrados', authenticateToken, ctrl.getPrestamosCerrados);
router.get('/historial-cliente', authenticateToken, ctrl.getHistorialCliente);

module.exports = router;

// routes/visitas_cobro.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/visitas_cobro.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las visitas de cobro
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene visitas de un cliente específico
router.get('/cliente/:id_cliente', authenticateToken, ctrl.getByCliente);

// Obtiene visitas de un préstamo específico
router.get('/prestamo/:id_prestamo', authenticateToken, ctrl.getByPrestamo);

// Obtiene visitas por resultado
router.get('/resultado/:resultado', authenticateToken, ctrl.getByResultado);

// Obtiene una visita por ID
router.get('/:id', authenticateToken, ctrl.getById);

// Crea una nueva visita de cobro
router.post('/', authenticateToken, ctrl.create);

// Actualiza una visita de cobro existente
router.patch('/:id', authenticateToken, requirePermission('crear_visitas'), ctrl.update);

// Elimina una visita de cobro
router.delete('/:id', authenticateToken, requirePermission('crear_visitas'), ctrl.remove);

module.exports = router;

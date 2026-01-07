// routes/verificaciones_prestamo.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/verificaciones_prestamo.controller');

// Lista todas las verificaciones de préstamo
router.get('/', ctrl.getAll);

// Obtiene una verificación por ID
router.get('/:id', ctrl.getById);

// Obtiene verificaciones de un cliente específico
router.get('/cliente/:id_cliente', ctrl.getByCliente);

// Obtiene verificaciones por estado
router.get('/estado/:estado', ctrl.getByEstado);

// Obtiene verificaciones por analista
router.get('/analista/:analista', ctrl.getByAnalista);

// Crea una nueva verificación de préstamo
router.post('/', ctrl.create);

// Actualiza una verificación de préstamo existente
router.patch('/:id', ctrl.update);

// Elimina una verificación de préstamo
router.delete('/:id', ctrl.remove);

module.exports = router;
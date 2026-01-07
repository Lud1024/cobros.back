// routes/cuotas.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cuotas.controller');

// Lista todas las cuotas
router.get('/', ctrl.getAll);

// Obtiene una cuota por ID
router.get('/:id', ctrl.getById);

// Obtiene cuotas por préstamo
router.get('/prestamo/:id_prestamo', ctrl.getByPrestamo);

// Crea una nueva cuota
router.post('/', ctrl.create);

// Actualiza una cuota existente
router.patch('/:id', ctrl.update);

// Elimina una cuota
router.delete('/:id', ctrl.remove);

module.exports = router;
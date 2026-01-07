// routes/pagos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pagos.controller');

// Lista todos los pagos
router.get('/', ctrl.getAll);

// Obtiene un pago por ID
router.get('/:id', ctrl.getById);

// Obtiene pagos por préstamo
router.get('/prestamo/:id_prestamo', ctrl.getByPrestamo);

// Crea un nuevo pago
router.post('/', ctrl.create);

// Actualiza un pago existente
router.patch('/:id', ctrl.update);

// Elimina un pago
router.delete('/:id', ctrl.remove);

module.exports = router;
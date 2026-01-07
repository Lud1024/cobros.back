// routes/prestamos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prestamos.controller');

// Lista todos los préstamos
router.get('/', ctrl.getAll);

// Obtiene un préstamo por ID
router.get('/:id', ctrl.getById);

// Obtiene préstamos por cliente
router.get('/cliente/:id_cliente', ctrl.getByCliente);

// Crea un nuevo préstamo
router.post('/', ctrl.create);

// Actualiza un préstamo existente
router.patch('/:id', ctrl.update);

// Elimina un préstamo
router.delete('/:id', ctrl.remove);

module.exports = router;
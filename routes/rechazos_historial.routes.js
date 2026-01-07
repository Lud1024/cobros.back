// routes/rechazos_historial.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rechazos_historial.controller');

// Lista todos los rechazos de historial
router.get('/', ctrl.getAll);

// Obtiene un rechazo por ID
router.get('/:id', ctrl.getById);

// Obtiene rechazos de una verificación específica
router.get('/verificacion/:id_verificacion', ctrl.getByVerificacion);

// Crea un nuevo rechazo de historial
router.post('/', ctrl.create);

// Actualiza un rechazo de historial existente
router.patch('/:id', ctrl.update);

// Elimina un rechazo de historial
router.delete('/:id', ctrl.remove);

module.exports = router;
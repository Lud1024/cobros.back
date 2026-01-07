// routes/periodicidades.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/periodicidades.controller');

// Lista todas las periodicidades
router.get('/', ctrl.getAll);

// Obtiene una periodicidad por ID
router.get('/:id', ctrl.getById);

// Crea una nueva periodicidad
router.post('/', ctrl.create);

// Actualiza una periodicidad existente
router.patch('/:id', ctrl.update);

// Elimina una periodicidad
router.delete('/:id', ctrl.remove);

module.exports = router;
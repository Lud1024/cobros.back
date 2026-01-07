// routes/carteras.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/carteras.controller');

// Lista todas las carteras
router.get('/', ctrl.getAll);

// Obtiene una cartera por ID
router.get('/:id', ctrl.getById);

// Crea una nueva cartera
router.post('/', ctrl.create);

// Actualiza una cartera existente
router.patch('/:id', ctrl.update);

// Elimina una cartera
router.delete('/:id', ctrl.remove);

module.exports = router;
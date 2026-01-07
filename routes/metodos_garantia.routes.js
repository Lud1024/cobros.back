// routes/metodos_garantia.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/metodos_garantia.controller');

// Lista todos los métodos de garantía
router.get('/', ctrl.getAll);

// Obtiene un método de garantía por ID
router.get('/:id', ctrl.getById);

// Crea un nuevo método de garantía
router.post('/', ctrl.create);

// Actualiza un método de garantía existente
router.patch('/:id', ctrl.update);

// Elimina un método de garantía
router.delete('/:id', ctrl.remove);

module.exports = router;
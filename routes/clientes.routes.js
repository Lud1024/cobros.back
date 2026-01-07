// routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientes.controller');
const { authenticateToken } = require('../middleware/auth');

// Lista todos los clientes (requiere autenticación)
router.get('/', authenticateToken, ctrl.getAll);

// Obtiene un cliente por ID (requiere autenticación)
router.get('/:id', authenticateToken, ctrl.getById);

// Crea un nuevo cliente (requiere autenticación)
router.post('/', authenticateToken, ctrl.create);

// Actualiza un cliente existente (requiere autenticación)
router.patch('/:id', authenticateToken, ctrl.update);

// Elimina un cliente (requiere autenticación)
router.delete('/:id', authenticateToken, ctrl.remove);

module.exports = router;
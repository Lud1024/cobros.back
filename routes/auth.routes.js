// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuarios.controller');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas (no requieren autenticación)
router.post('/login', ctrl.login);
router.post('/register', ctrl.register);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, ctrl.getProfile);
router.post('/confirmar/:token', ctrl.confirm);

module.exports = router;
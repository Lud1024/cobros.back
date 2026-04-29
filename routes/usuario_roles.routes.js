// routes/usuario_roles.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuario_roles.controller');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');

// Lista todas las asignaciones de roles
router.get('/', ctrl.getAll);

// Obtiene roles de un usuario específico
router.get('/usuario/:id_usuario', ctrl.getByUsuario);

// Obtiene usuarios con un rol específico
router.get('/rol/:id_rol', ctrl.getByRol);

// Obtiene usuarios de una cartera específica
router.get('/cartera/:id_cartera', ctrl.getByCartera);

// Obtiene roles de un usuario en una cartera específica
router.get('/usuario/:id_usuario/cartera/:id_cartera', ctrl.getByUsuarioCartera);

// Asigna un rol a un usuario en una cartera
router.post('/', authenticateToken, requirePermission('asignar_roles'), ctrl.create);

// Remueve un rol de un usuario en una cartera (ruta simplificada para el frontend)
router.delete('/:id_usuario/:id_rol/:id_cartera', authenticateToken, requirePermission('asignar_roles'), ctrl.remove);

// Remueve un rol de un usuario en una cartera (ruta descriptiva alternativa)
router.delete('/usuario/:id_usuario/rol/:id_rol/cartera/:id_cartera', authenticateToken, requirePermission('asignar_roles'), ctrl.remove);

module.exports = router;

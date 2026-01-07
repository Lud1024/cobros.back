// routes/rol_cartera.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rol_cartera.controller');

// Lista todas las asignaciones de roles a carteras
router.get('/', ctrl.getAll);

// Obtiene carteras asignadas a un rol específico
router.get('/rol/:id_rol', ctrl.getByRol);

// Obtiene roles asignados a una cartera específica
router.get('/cartera/:id_cartera', ctrl.getByCartera);

// Asigna un rol a una cartera
router.post('/', ctrl.create);

// Remueve un rol de una cartera
router.delete('/rol/:id_rol/cartera/:id_cartera', ctrl.remove);

module.exports = router;
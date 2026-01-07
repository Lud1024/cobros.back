// routes/pago_aplicaciones.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pago_aplicaciones.controller');

// Lista todas las aplicaciones de pago
router.get('/', ctrl.getAll);

// Obtiene aplicaciones de un pago específico
router.get('/pago/:id_pago', ctrl.getByPago);

// Obtiene aplicaciones de una cuota específica
router.get('/cuota/:id_cuota', ctrl.getByCuota);

// Obtiene aplicaciones por concepto (CAPITAL, INTERES, MORA)
router.get('/concepto/:aplicado_a', ctrl.getByConcepto);

// Crea una nueva aplicación de pago
router.post('/', ctrl.create);

// Actualiza una aplicación de pago existente
router.patch('/pago/:id_pago/cuota/:id_cuota/concepto/:aplicado_a', ctrl.update);

// Elimina una aplicación de pago
router.delete('/pago/:id_pago/cuota/:id_cuota/concepto/:aplicado_a', ctrl.remove);

module.exports = router;
// controllers/prestamos.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const logger = require('../utils/logger');

/**
 * GET /prestamos
 */
exports.getAll = async (req, res) => {
  try {
    const prestamos = await sequelize.query(sql.listPrestamos, { type: QueryTypes.SELECT });
    res.json(prestamos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener préstamos' });
  }
};

/**
 * GET /prestamos/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const prestamos = await sequelize.query(sql.getPrestamoById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!prestamos.length) return res.status(404).json({ error: 'Préstamo no encontrado' });
    res.json(prestamos[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener préstamo' });
  }
};

/**
 * GET /prestamos/cliente/:id_cliente
 */
exports.getByCliente = async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const prestamos = await sequelize.query(sql.getPrestamosByCliente, {
      replacements: { id_cliente },
      type: QueryTypes.SELECT
    });
    res.json(prestamos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener préstamos del cliente' });
  }
};

/**
 * POST /prestamos
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_cliente, monto, tasa_interes_anual, id_periodicidad, plazo_cuotas, fecha_inicio, dia_pago } = req.body;

    // Validar dia_pago (1-31)
    if (dia_pago < 1 || dia_pago > 31) {
      await transaction.rollback();
      return res.status(400).json({ error: 'dia_pago debe estar entre 1 y 31' });
    }

    const [result] = await sequelize.query(sql.createPrestamo, {
      replacements: { id_cliente, monto, tasa_interes_anual, id_periodicidad, plazo_cuotas, fecha_inicio, dia_pago },
      type: QueryTypes.INSERT,
      transaction
    });
    await transaction.commit();
    logger.transaction('✅ PRÉSTAMO CREADO -', { id_prestamo: result, id_cliente, monto, plazo: plazo_cuotas });
    res.status(201).json({ message: 'Préstamo creado', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o periodicidad no encontrada' });
    }
    res.status(500).json({ error: 'Error al crear préstamo' });
  }
};

/**
 * PATCH /prestamos/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar dia_pago si se actualiza
    if (updates.dia_pago && (updates.dia_pago < 1 || updates.dia_pago > 31)) {
      return res.status(400).json({ error: 'dia_pago debe estar entre 1 y 31' });
    }

    const replacements = { id, ...updates };

    await sequelize.query(sql.updatePrestamo, {
      replacements,
      type: QueryTypes.UPDATE
    });
    logger.transaction('✏️ PRÉSTAMO ACTUALIZADO -', { id_prestamo: id });
    res.json({ message: 'Préstamo actualizado' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o periodicidad no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar préstamo' });
  }
};

/**
 * DELETE /prestamos/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deletePrestamo, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    logger.transaction('🗑️ PRÉSTAMO ELIMINADO -', { id_prestamo: id });
    res.json({ message: 'Préstamo eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar préstamo' });
  }
};
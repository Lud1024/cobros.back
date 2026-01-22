// controllers/pagos.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const logger = require('../utils/logger');

/**
 * GET /pagos
 */
exports.getAll = async (req, res) => {
  try {
    const pagos = await sequelize.query(sql.listPagos, { type: QueryTypes.SELECT });
    res.json(pagos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

/**
 * GET /pagos/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const pagos = await sequelize.query(sql.getPagoById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!pagos.length) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pagos[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pago' });
  }
};

/**
 * GET /pagos/prestamo/:id_prestamo
 */
exports.getByPrestamo = async (req, res) => {
  const { id_prestamo } = req.params;
  try {
    const pagos = await sequelize.query(sql.getPagosByPrestamo, {
      replacements: { id_prestamo },
      type: QueryTypes.SELECT
    });
    res.json(pagos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pagos del préstamo' });
  }
};

/**
 * POST /pagos
 * Acepta tanto monto_recibido (nombre BD) como monto (nombre frontend)
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_prestamo, fecha_pago, metodo_pago, observaciones } = req.body;
    // Mapear monto del frontend a monto_recibido de la BD
    const monto_recibido = req.body.monto_recibido ?? req.body.monto;
    const origen = req.user ? `${req.user.nombre} ${req.user.apellido}` : 'Sistema';

    // Validar monto positivo
    if (!monto_recibido || monto_recibido <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'monto_recibido debe ser mayor a 0' });
    }

    // Validar fecha no mayor a 7 días en el futuro
    const fechaPago = new Date(fecha_pago);
    const hoy = new Date();
    const limite = new Date(hoy.getTime() + (7 * 24 * 60 * 60 * 1000));

    if (fechaPago > limite) {
      await transaction.rollback();
      return res.status(400).json({ error: 'fecha_pago no puede ser mayor a 7 días en el futuro' });
    }

    const [result] = await sequelize.query(sql.createPago, {
      replacements: {
        id_prestamo: id_prestamo ?? null,
        fecha_pago: fecha_pago ?? null,
        monto_recibido: monto_recibido ?? null,
        metodo_pago: metodo_pago || 'Efectivo',
        origen: origen ?? null,
        observaciones: observaciones ?? null
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    logger.transaction('✅ PAGO CREADO -', { id_pago: result, id_prestamo, monto: monto_recibido, metodo: metodo_pago, usuario: origen });
    res.status(201).json({ message: 'Pago creado', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Préstamo no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear pago' });
  }
};

/**
 * PATCH /pagos/:id
 * Acepta tanto monto_recibido (nombre BD) como monto (nombre frontend)
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const origen = req.user ? `${req.user.nombre} ${req.user.apellido}` : 'Sistema';
  
  // Mapear monto del frontend a monto_recibido de la BD
  const monto_recibido = updates.monto_recibido ?? updates.monto ?? null;
  
  try {
    // Validar monto si se actualiza
    if (monto_recibido && monto_recibido <= 0) {
      return res.status(400).json({ error: 'monto_recibido debe ser mayor a 0' });
    }

    // Validar fecha si se actualiza
    if (updates.fecha_pago) {
      const fechaPago = new Date(updates.fecha_pago);
      const hoy = new Date();
      const limite = new Date(hoy.getTime() + (7 * 24 * 60 * 60 * 1000));

      if (fechaPago > limite) {
        return res.status(400).json({ error: 'fecha_pago no puede ser mayor a 7 días en el futuro' });
      }
    }

    const replacements = {
      id,
      id_prestamo: updates.id_prestamo ?? null,
      fecha_pago: updates.fecha_pago ?? null,
      monto_recibido: monto_recibido,
      metodo_pago: updates.metodo_pago ?? null,
      origen: origen ?? null,
      observaciones: updates.observaciones ?? null
    };

    await sequelize.query(sql.updatePago, {
      replacements,
      type: QueryTypes.UPDATE
    });
    logger.transaction('✏️ PAGO ACTUALIZADO -', { id_pago: id, usuario: origen });
    res.json({ message: 'Pago actualizado' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Préstamo no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
};

/**
 * DELETE /pagos/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deletePago, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    logger.transaction('🗑️ PAGO ELIMINADO -', { id_pago: id });
    res.json({ message: 'Pago eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
};
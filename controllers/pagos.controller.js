// controllers/pagos.controller.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const logger = require('../utils/logger');
const { applyPagoToCuotas, reversePagoApplications } = require('../services/loanAccounting');
const { isValidDateOnly, parseDateOnlyLocal, todayDateOnly } = require('../utils/dateValidation');

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
    res.status(500).json({ error: 'Error al obtener pagos del prestamo' });
  }
};

/**
 * POST /pagos
 * Acepta tanto monto_recibido (nombre BD) como monto (nombre frontend).
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_prestamo, fecha_pago, metodo_pago, observaciones } = req.body;
    const monto_recibido = req.body.monto_recibido ?? req.body.monto;
    const origen = req.user ? `${req.user.nombre} ${req.user.apellido}` : 'Sistema';

    if (!monto_recibido || monto_recibido <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'monto_recibido debe ser mayor a 0' });
    }

    if (!isValidDateOnly(fecha_pago)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'fecha_pago debe ser una fecha valida en formato YYYY-MM-DD' });
    }

    const fechaPago = parseDateOnlyLocal(fecha_pago);
    const hoy = new Date();
    hoy.setHours(12, 0, 0, 0);
    const limite = new Date(hoy.getTime() + (7 * 24 * 60 * 60 * 1000));

    if (fechaPago > limite) {
      await transaction.rollback();
      return res.status(400).json({ error: 'fecha_pago no puede ser mayor a 7 dias en el futuro' });
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

    const idPago = Array.isArray(result) ? result[0] : result;
    const aplicacion = await applyPagoToCuotas({
      idPago,
      idPrestamo: id_prestamo,
      montoRecibido: monto_recibido,
      fechaPago: fecha_pago
    }, transaction);

    await transaction.commit();
    logger.transaction('PAGO CREADO -', {
      id_pago: idPago,
      id_prestamo,
      monto: monto_recibido,
      metodo: metodo_pago,
      usuario: origen,
      aplicado: aplicacion.monto_aplicado
    });
    res.status(201).json({ message: 'Pago creado', id: idPago, ...aplicacion });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Prestamo no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear pago' });
  }
};

/**
 * PATCH /pagos/:id
 * Reversa las aplicaciones existentes y vuelve a aplicar el pago actualizado.
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const origen = req.user ? `${req.user.nombre} ${req.user.apellido}` : 'Sistema';
  const monto_recibido = updates.monto_recibido ?? updates.monto ?? null;
  const transaction = await sequelize.transaction();

  try {
    if (monto_recibido && monto_recibido <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'monto_recibido debe ser mayor a 0' });
    }

    if (updates.fecha_pago) {
      if (!isValidDateOnly(updates.fecha_pago)) {
        await transaction.rollback();
        return res.status(400).json({ error: 'fecha_pago debe ser una fecha valida en formato YYYY-MM-DD' });
      }

      const fechaPago = parseDateOnlyLocal(updates.fecha_pago);
      const hoy = new Date();
      hoy.setHours(12, 0, 0, 0);
      const limite = new Date(hoy.getTime() + (7 * 24 * 60 * 60 * 1000));

      if (fechaPago > limite) {
        await transaction.rollback();
        return res.status(400).json({ error: 'fecha_pago no puede ser mayor a 7 dias en el futuro' });
      }
    }

    const pagos = await sequelize.query(sql.getPagoById, {
      replacements: { id },
      type: QueryTypes.SELECT,
      transaction
    });

    if (!pagos.length) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const pagoActual = pagos[0];
    await reversePagoApplications(id, updates.fecha_pago ?? pagoActual.fecha_pago, transaction);

    const replacements = {
      id,
      id_prestamo: updates.id_prestamo ?? null,
      fecha_pago: updates.fecha_pago ?? null,
      monto_recibido,
      metodo_pago: updates.metodo_pago ?? null,
      origen: origen ?? null,
      observaciones: updates.observaciones ?? null
    };

    await sequelize.query(sql.updatePago, {
      replacements,
      type: QueryTypes.UPDATE,
      transaction
    });

    const aplicacion = await applyPagoToCuotas({
      idPago: id,
      idPrestamo: updates.id_prestamo ?? pagoActual.id_prestamo,
      montoRecibido: monto_recibido ?? pagoActual.monto_recibido,
      fechaPago: updates.fecha_pago ?? pagoActual.fecha_pago
    }, transaction);

    await transaction.commit();
    logger.transaction('PAGO ACTUALIZADO -', { id_pago: id, usuario: origen });
    res.json({ message: 'Pago actualizado', ...aplicacion });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Prestamo no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
};

/**
 * DELETE /pagos/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    await reversePagoApplications(id, todayDateOnly(), transaction);
    await sequelize.query(sql.deletePago, {
      replacements: { id },
      type: QueryTypes.DELETE,
      transaction
    });

    await transaction.commit();
    logger.transaction('PAGO ELIMINADO -', { id_pago: id });
    res.json({ message: 'Pago eliminado' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
};

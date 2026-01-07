// controllers/pago_aplicaciones.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /pago-aplicaciones
 */
exports.getAll = async (req, res) => {
  try {
    const aplicaciones = await sequelize.query(sql.listPagoAplicaciones, { type: QueryTypes.SELECT });
    res.json(aplicaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener aplicaciones de pago' });
  }
};

/**
 * GET /pago-aplicaciones/pago/:id_pago
 */
exports.getByPago = async (req, res) => {
  const { id_pago } = req.params;
  try {
    const aplicaciones = await sequelize.query(sql.getAplicacionesByPago, {
      replacements: { id_pago },
      type: QueryTypes.SELECT
    });
    res.json(aplicaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener aplicaciones del pago' });
  }
};

/**
 * GET /pago-aplicaciones/cuota/:id_cuota
 */
exports.getByCuota = async (req, res) => {
  const { id_cuota } = req.params;
  try {
    const aplicaciones = await sequelize.query(sql.getAplicacionesByCuota, {
      replacements: { id_cuota },
      type: QueryTypes.SELECT
    });
    res.json(aplicaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener aplicaciones de la cuota' });
  }
};

/**
 * GET /pago-aplicaciones/concepto/:aplicado_a
 */
exports.getByConcepto = async (req, res) => {
  const { aplicado_a } = req.params;
  try {
    const aplicaciones = await sequelize.query(sql.getAplicacionesByConcepto, {
      replacements: { aplicado_a },
      type: QueryTypes.SELECT
    });
    res.json(aplicaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener aplicaciones por concepto' });
  }
};

/**
 * POST /pago-aplicaciones
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_pago, id_cuota, aplicado_a, monto_aplicado } = req.body;

    // Validar aplicado_a
    const conceptosValidos = ['CAPITAL', 'INTERES', 'MORA'];
    if (!conceptosValidos.includes(aplicado_a)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'aplicado_a debe ser CAPITAL, INTERES o MORA' });
    }

    // Validar monto positivo
    if (monto_aplicado <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'monto_aplicado debe ser mayor a 0' });
    }

    // Verificar que no exista ya esta combinación
    const existing = await sequelize.query(sql.getPagoAplicacionById, {
      replacements: { id_pago, id_cuota, aplicado_a },
      type: QueryTypes.SELECT,
      transaction
    });

    if (existing.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Esta combinación pago-cuota-concepto ya existe' });
    }

    await sequelize.query(sql.createPagoAplicacion, {
      replacements: {
        id_pago,
        id_cuota,
        aplicado_a,
        monto_aplicado
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Aplicación de pago creada' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Pago o cuota no encontrada' });
    }
    res.status(500).json({ error: 'Error al crear aplicación de pago' });
  }
};

/**
 * PATCH /pago-aplicaciones/pago/:id_pago/cuota/:id_cuota/concepto/:aplicado_a
 */
exports.update = async (req, res) => {
  const { id_pago, id_cuota, aplicado_a } = req.params;
  const { monto_aplicado } = req.body;
  try {
    // Validar monto si se actualiza
    if (monto_aplicado && monto_aplicado <= 0) {
      return res.status(400).json({ error: 'monto_aplicado debe ser mayor a 0' });
    }

    await sequelize.query(sql.updatePagoAplicacion, {
      replacements: { id_pago, id_cuota, aplicado_a, monto_aplicado },
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Aplicación de pago actualizada' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Pago o cuota no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar aplicación de pago' });
  }
};

/**
 * DELETE /pago-aplicaciones/pago/:id_pago/cuota/:id_cuota/concepto/:aplicado_a
 */
exports.remove = async (req, res) => {
  const { id_pago, id_cuota, aplicado_a } = req.params;
  try {
    await sequelize.query(sql.deletePagoAplicacion, {
      replacements: { id_pago, id_cuota, aplicado_a },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Aplicación de pago eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar aplicación de pago' });
  }
};
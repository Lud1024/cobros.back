// controllers/verificaciones_prestamo.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const { isValidDateOnly } = require('../utils/dateValidation');

/**
 * GET /verificaciones-prestamo
 */
exports.getAll = async (req, res) => {
  try {
    const verificaciones = await sequelize.query(sql.listVerificacionesPrestamo, { type: QueryTypes.SELECT });
    res.json(verificaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener verificaciones de préstamo' });
  }
};

/**
 * GET /verificaciones-prestamo/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const verificaciones = await sequelize.query(sql.getVerificacionPrestamoById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!verificaciones.length) return res.status(404).json({ error: 'Verificación de préstamo no encontrada' });
    res.json(verificaciones[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener verificación de préstamo' });
  }
};

/**
 * GET /verificaciones-prestamo/cliente/:id_cliente
 */
exports.getByCliente = async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const verificaciones = await sequelize.query(sql.getVerificacionesByCliente, {
      replacements: { id_cliente },
      type: QueryTypes.SELECT
    });
    res.json(verificaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener verificaciones del cliente' });
  }
};

/**
 * GET /verificaciones-prestamo/estado/:estado
 */
exports.getByEstado = async (req, res) => {
  const { estado } = req.params;
  try {
    const verificaciones = await sequelize.query(sql.getVerificacionesByEstado, {
      replacements: { estado },
      type: QueryTypes.SELECT
    });
    res.json(verificaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener verificaciones por estado' });
  }
};

/**
 * GET /verificaciones-prestamo/analista/:analista
 */
exports.getByAnalista = async (req, res) => {
  const { analista } = req.params;
  try {
    const verificaciones = await sequelize.query(sql.getVerificacionesByAnalista, {
      replacements: { analista },
      type: QueryTypes.SELECT
    });
    res.json(verificaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener verificaciones del analista' });
  }
};

/**
 * POST /verificaciones-prestamo
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_cliente, fecha_solicitud, monto_solicitado, estado, analista, comentarios } = req.body;

    if (!isValidDateOnly(fecha_solicitud)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'fecha_solicitud debe ser una fecha valida en formato YYYY-MM-DD' });
    }

    // Validar estado
    const estadosValidos = ['en_proceso', 'aprobado', 'rechazado'];
    if (!estadosValidos.includes(estado)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'estado debe ser en_proceso, aprobado o rechazado' });
    }

    // Validar monto positivo
    if (monto_solicitado <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'monto_solicitado debe ser mayor a 0' });
    }

    await sequelize.query(sql.createVerificacionPrestamo, {
      replacements: {
        id_cliente: id_cliente ?? null,
        fecha_solicitud: fecha_solicitud ?? null,
        monto_solicitado: monto_solicitado ?? null,
        estado: estado ?? null,
        analista: analista ?? null,
        comentarios: comentarios ?? null
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Verificación de préstamo creada' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o analista no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear verificación de préstamo' });
  }
};

/**
 * PATCH /verificaciones-prestamo/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar estado si se actualiza
    if (updates.fecha_solicitud !== undefined && !isValidDateOnly(updates.fecha_solicitud)) {
      return res.status(400).json({ error: 'fecha_solicitud debe ser una fecha valida en formato YYYY-MM-DD' });
    }

    // Validar estado si se actualiza
    if (updates.estado) {
      const estadosValidos = ['en_proceso', 'aprobado', 'rechazado'];
      if (!estadosValidos.includes(updates.estado)) {
        return res.status(400).json({ error: 'estado debe ser en_proceso, aprobado o rechazado' });
      }
    }

    // Validar monto si se actualiza
    if (updates.monto_solicitado && updates.monto_solicitado <= 0) {
      return res.status(400).json({ error: 'monto_solicitado debe ser mayor a 0' });
    }

    const replacements = {
      id,
      id_cliente: updates.id_cliente ?? null,
      fecha_solicitud: updates.fecha_solicitud ?? null,
      monto_solicitado: updates.monto_solicitado ?? null,
      estado: updates.estado ?? null,
      analista: updates.analista ?? null,
      comentarios: updates.comentarios ?? null
    };

    await sequelize.query(sql.updateVerificacionPrestamo, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Verificación de préstamo actualizada' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o analista no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar verificación de préstamo' });
  }
};

/**
 * DELETE /verificaciones-prestamo/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteVerificacionPrestamo, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Verificación de préstamo eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar verificación de préstamo' });
  }
};

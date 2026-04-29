// controllers/rechazos_historial.controller.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

const markVerificacionRejected = async (idVerificacion, transaction) => {
  await sequelize.query(sql.updateVerificacionPrestamo, {
    replacements: {
      id: idVerificacion,
      id_cliente: null,
      fecha_solicitud: null,
      monto_solicitado: null,
      estado: 'rechazado',
      analista: null,
      comentarios: null
    },
    type: QueryTypes.UPDATE,
    transaction
  });
};

/**
 * GET /rechazos-historial
 */
exports.getAll = async (req, res) => {
  try {
    const rechazos = await sequelize.query(sql.listRechazosHistorial, { type: QueryTypes.SELECT });
    res.json(rechazos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial de rechazos' });
  }
};

/**
 * GET /rechazos-historial/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const rechazos = await sequelize.query(sql.getRechazoHistorialById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!rechazos.length) return res.status(404).json({ error: 'Rechazo de historial no encontrado' });
    res.json(rechazos[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rechazo de historial' });
  }
};

/**
 * GET /rechazos-historial/verificacion/:id_verificacion
 */
exports.getByVerificacion = async (req, res) => {
  const { id_verificacion } = req.params;
  try {
    const rechazos = await sequelize.query(sql.getRechazosByVerificacion, {
      replacements: { id_verificacion },
      type: QueryTypes.SELECT
    });
    res.json(rechazos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rechazos de la verificacion' });
  }
};

/**
 * POST /rechazos-historial
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_verificacion, motivo } = req.body;
    const cleanMotivo = typeof motivo === 'string' ? motivo.trim() : '';

    if (!id_verificacion) {
      await transaction.rollback();
      return res.status(400).json({ error: 'id_verificacion es requerido' });
    }

    if (!cleanMotivo) {
      await transaction.rollback();
      return res.status(400).json({ error: 'motivo es requerido' });
    }

    await sequelize.query(sql.createRechazoHistorial, {
      replacements: {
        id_verificacion,
        motivo: cleanMotivo
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await markVerificacionRejected(id_verificacion, transaction);

    await transaction.commit();
    res.status(201).json({ message: 'Rechazo de historial creado' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Verificacion no encontrada' });
    }
    res.status(500).json({ error: 'Error al crear rechazo de historial' });
  }
};

/**
 * PATCH /rechazos-historial/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const transaction = await sequelize.transaction();

  try {
    if (updates.motivo !== undefined) {
      const cleanMotivo = typeof updates.motivo === 'string' ? updates.motivo.trim() : '';
      if (!cleanMotivo) {
        await transaction.rollback();
        return res.status(400).json({ error: 'motivo no puede estar vacio' });
      }
      updates.motivo = cleanMotivo;
    }

    const replacements = {
      id,
      id_verificacion: updates.id_verificacion ?? null,
      motivo: updates.motivo ?? null
    };

    await sequelize.query(sql.updateRechazoHistorial, {
      replacements,
      type: QueryTypes.UPDATE,
      transaction
    });

    if (updates.id_verificacion) {
      await markVerificacionRejected(updates.id_verificacion, transaction);
    }

    await transaction.commit();
    res.json({ message: 'Rechazo de historial actualizado' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Verificacion no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar rechazo de historial' });
  }
};

/**
 * DELETE /rechazos-historial/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteRechazoHistorial, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Rechazo de historial eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar rechazo de historial' });
  }
};

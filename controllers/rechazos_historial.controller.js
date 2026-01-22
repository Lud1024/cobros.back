// controllers/rechazos_historial.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

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
    res.status(500).json({ error: 'Error al obtener rechazos de la verificación' });
  }
};

/**
 * POST /rechazos-historial
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_verificacion, motivo } = req.body;

    // Validar motivo requerido
    if (!motivo || motivo.trim() === '') {
      await transaction.rollback();
      return res.status(400).json({ error: 'motivo es requerido' });
    }

    await sequelize.query(sql.createRechazoHistorial, {
      replacements: {
        id_verificacion,
        motivo: motivo.trim()
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Rechazo de historial creado' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Verificación no encontrada' });
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
  try {
    // Validar motivo si se actualiza
    if (updates.motivo) {
      if (updates.motivo.trim() === '') {
        return res.status(400).json({ error: 'motivo no puede estar vacío' });
      }
      updates.motivo = updates.motivo.trim();
    }

    const replacements = {
      id,
      id_verificacion: updates.id_verificacion ?? null,
      motivo: updates.motivo ?? null
    };

    await sequelize.query(sql.updateRechazoHistorial, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Rechazo de historial actualizado' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Verificación no encontrada' });
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
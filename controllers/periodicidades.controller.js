// controllers/periodicidades.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /periodicidades
 */
exports.getAll = async (req, res) => {
  try {
    const periodicidades = await sequelize.query(sql.listPeriodicidades, { type: QueryTypes.SELECT });
    res.json(periodicidades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener periodicidades' });
  }
};

/**
 * GET /periodicidades/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const periodicidades = await sequelize.query(sql.getPeriodicidadById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!periodicidades.length) return res.status(404).json({ error: 'Periodicidad no encontrada' });
    res.json(periodicidades[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener periodicidad' });
  }
};

/**
 * POST /periodicidades
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { codigo, dias } = req.body;

    // Validar dias positivo
    if (dias <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'dias debe ser mayor a 0' });
    }

    const [result] = await sequelize.query(sql.createPeriodicidad, {
      replacements: { codigo, dias },
      type: QueryTypes.INSERT,
      transaction
    });
    await transaction.commit();
    res.status(201).json({ message: 'Periodicidad creada', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El código ya existe' });
    }
    res.status(500).json({ error: 'Error al crear periodicidad' });
  }
};

/**
 * PATCH /periodicidades/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar dias si se actualiza
    if (updates.dias && updates.dias <= 0) {
      return res.status(400).json({ error: 'dias debe ser mayor a 0' });
    }

    // Verificar unicidad de codigo si se actualiza
    if (updates.codigo) {
      const existing = await sequelize.query(sql.getPeriodicidadByCodigo, {
        replacements: { codigo: updates.codigo },
        type: QueryTypes.SELECT
      });
      if (existing.length && existing[0].id_periodicidad != id) {
        return res.status(400).json({ error: 'El código ya existe' });
      }
    }

    const replacements = {
      id,
      codigo: updates.codigo ?? null,
      dias: updates.dias ?? null
    };

    await sequelize.query(sql.updatePeriodicidad, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Periodicidad actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar periodicidad' });
  }
};

/**
 * DELETE /periodicidades/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deletePeriodicidad, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Periodicidad eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar periodicidad' });
  }
};
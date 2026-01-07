// controllers/mora_eventos.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /mora-eventos
 */
exports.getAll = async (req, res) => {
  try {
    const moraEventos = await sequelize.query(sql.listMoraEventos, { type: QueryTypes.SELECT });
    res.json(moraEventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos de mora' });
  }
};

/**
 * GET /mora-eventos/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const moraEventos = await sequelize.query(sql.getMoraEventoById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!moraEventos.length) return res.status(404).json({ error: 'Evento de mora no encontrado' });
    res.json(moraEventos[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener evento de mora' });
  }
};

/**
 * GET /mora-eventos/cuota/:id_cuota
 */
exports.getByCuota = async (req, res) => {
  const { id_cuota } = req.params;
  try {
    const moraEventos = await sequelize.query(sql.getMoraEventosByCuota, {
      replacements: { id_cuota },
      type: QueryTypes.SELECT
    });
    res.json(moraEventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos de mora de la cuota' });
  }
};

/**
 * GET /mora-eventos/fecha/:fecha_calculo
 */
exports.getByFecha = async (req, res) => {
  const { fecha_calculo } = req.params;
  try {
    const moraEventos = await sequelize.query(sql.getMoraEventosByFecha, {
      replacements: { fecha_calculo },
      type: QueryTypes.SELECT
    });
    res.json(moraEventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos de mora por fecha' });
  }
};

/**
 * POST /mora-eventos
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_cuota, fecha_calculo, dias_atraso, interes_mora } = req.body;

    // Validar dias_atraso positivo
    if (dias_atraso < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'dias_atraso no puede ser negativo' });
    }

    // Validar interes_mora positivo
    if (interes_mora < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'interes_mora no puede ser negativo' });
    }

    await sequelize.query(sql.createMoraEvento, {
      replacements: {
        id_cuota,
        fecha_calculo,
        dias_atraso,
        interes_mora
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Evento de mora creado' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cuota no encontrada' });
    }
    res.status(500).json({ error: 'Error al crear evento de mora' });
  }
};

/**
 * PATCH /mora-eventos/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar dias_atraso si se actualiza
    if (updates.dias_atraso !== undefined && updates.dias_atraso < 0) {
      return res.status(400).json({ error: 'dias_atraso no puede ser negativo' });
    }

    // Validar interes_mora si se actualiza
    if (updates.interes_mora !== undefined && updates.interes_mora < 0) {
      return res.status(400).json({ error: 'interes_mora no puede ser negativo' });
    }

    const replacements = { id, ...updates };

    await sequelize.query(sql.updateMoraEvento, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Evento de mora actualizado' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cuota no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar evento de mora' });
  }
};

/**
 * DELETE /mora-eventos/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteMoraEvento, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Evento de mora eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar evento de mora' });
  }
};
// controllers/politicas_mora.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /politicas-mora
 */
exports.getAll = async (req, res) => {
  try {
    const politicas = await sequelize.query(sql.listPoliticasMora, { type: QueryTypes.SELECT });
    res.json(politicas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener políticas de mora' });
  }
};

/**
 * GET /politicas-mora/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const politicas = await sequelize.query(sql.getPoliticaMoraById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!politicas.length) return res.status(404).json({ error: 'Política de mora no encontrada' });
    res.json(politicas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener política de mora' });
  }
};

/**
 * GET /politicas-mora/cartera/:id_cartera
 */
exports.getByCartera = async (req, res) => {
  const { id_cartera } = req.params;
  try {
    const politicas = await sequelize.query(sql.getPoliticasByCartera, {
      replacements: { id_cartera },
      type: QueryTypes.SELECT
    });
    res.json(politicas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener políticas de la cartera' });
  }
};

/**
 * GET /politicas-mora/vigentes
 */
exports.getVigentes = async (req, res) => {
  try {
    const politicas = await sequelize.query(sql.getPoliticasVigentes, { type: QueryTypes.SELECT });
    res.json(politicas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener políticas vigentes' });
  }
};

/**
 * POST /politicas-mora
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_cartera, tasa_mora_diaria, tope_mora, vigente_desde, vigente_hasta } = req.body;

    // Validar tasa positiva
    if (tasa_mora_diaria <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'tasa_mora_diaria debe ser mayor a 0' });
    }

    // Validar tope si se proporciona
    if (tope_mora !== null && tope_mora !== undefined && tope_mora <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'tope_mora debe ser mayor a 0' });
    }

    // Validar fechas lógicas
    if (vigente_hasta && vigente_desde > vigente_hasta) {
      await transaction.rollback();
      return res.status(400).json({ error: 'vigente_desde no puede ser mayor a vigente_hasta' });
    }

    await sequelize.query(sql.createPoliticaMora, {
      replacements: {
        id_cartera: id_cartera ?? null,
        tasa_mora_diaria: tasa_mora_diaria ?? null,
        tope_mora: tope_mora ?? null,
        vigente_desde: vigente_desde ?? null,
        vigente_hasta: vigente_hasta ?? null
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Política de mora creada' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cartera no encontrada' });
    }
    res.status(500).json({ error: 'Error al crear política de mora' });
  }
};

/**
 * PATCH /politicas-mora/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar tasa si se actualiza
    if (updates.tasa_mora_diaria !== undefined && updates.tasa_mora_diaria <= 0) {
      return res.status(400).json({ error: 'tasa_mora_diaria debe ser mayor a 0' });
    }

    // Validar tope si se actualiza
    if (updates.tope_mora !== undefined && updates.tope_mora !== null && updates.tope_mora <= 0) {
      return res.status(400).json({ error: 'tope_mora debe ser mayor a 0' });
    }

    // Validar fechas si se actualizan
    if (updates.vigente_desde && updates.vigente_hasta && updates.vigente_desde > updates.vigente_hasta) {
      return res.status(400).json({ error: 'vigente_desde no puede ser mayor a vigente_hasta' });
    }

    const replacements = {
      id,
      id_cartera: updates.id_cartera ?? null,
      tasa_mora_diaria: updates.tasa_mora_diaria ?? null,
      tope_mora: updates.tope_mora ?? null,
      vigente_desde: updates.vigente_desde ?? null,
      vigente_hasta: updates.vigente_hasta ?? null
    };

    await sequelize.query(sql.updatePoliticaMora, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Política de mora actualizada' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cartera no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar política de mora' });
  }
};

/**
 * DELETE /politicas-mora/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deletePoliticaMora, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Política de mora eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar política de mora' });
  }
};
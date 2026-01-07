// controllers/carteras.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /carteras
 */
exports.getAll = async (req, res) => {
  try {
    const carteras = await sequelize.query(sql.listCarteras, { type: QueryTypes.SELECT });
    res.json(carteras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener carteras' });
  }
};

/**
 * GET /carteras/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const carteras = await sequelize.query(sql.getCarteraById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!carteras.length) return res.status(404).json({ error: 'Cartera no encontrada' });
    res.json(carteras[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cartera' });
  }
};

/**
 * POST /carteras
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { nombre, descripcion } = req.body;
    const [result] = await sequelize.query(sql.createCartera, {
      replacements: { nombre, descripcion },
      type: QueryTypes.INSERT,
      transaction
    });
    await transaction.commit();
    res.status(201).json({ message: 'Cartera creada', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al crear cartera' });
  }
};

/**
 * PATCH /carteras/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const replacements = { id, ...updates };
    await sequelize.query(sql.updateCartera, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Cartera actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cartera' });
  }
};

/**
 * DELETE /carteras/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteCartera, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Cartera eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cartera' });
  }
};
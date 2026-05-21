// controllers/carteras.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const { getScope } = require('../utils/accessControl');

/**
 * GET /carteras
 */
exports.getAll = async (req, res) => {
  try {
    const scope = await getScope(req.user);
    const carteras = scope.isAdmin
      ? await sequelize.query(sql.listCarteras, { type: QueryTypes.SELECT })
      : scope.carteraIds.length
        ? await sequelize.query(sql.listCarterasScoped, {
            replacements: { id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const carteras = scope.isAdmin
      ? await sequelize.query(sql.getCarteraById, {
          replacements: { id },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getCarteraByIdScoped, {
            replacements: { id, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
      replacements: { nombre: nombre ?? null, descripcion: descripcion ?? null },
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
    const replacements = {
      id,
      nombre: updates.nombre ?? null,
      descripcion: updates.descripcion ?? null
    };
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

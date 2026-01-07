// controllers/rol_cartera.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /rol-cartera
 */
exports.getAll = async (req, res) => {
  try {
    const rolCartera = await sequelize.query(sql.listRolCartera, { type: QueryTypes.SELECT });
    res.json(rolCartera);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asignaciones de roles a carteras' });
  }
};

/**
 * GET /rol-cartera/rol/:id_rol
 */
exports.getByRol = async (req, res) => {
  const { id_rol } = req.params;
  try {
    const carteras = await sequelize.query(sql.getCarterasByRol, {
      replacements: { id_rol },
      type: QueryTypes.SELECT
    });
    res.json(carteras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener carteras del rol' });
  }
};

/**
 * GET /rol-cartera/cartera/:id_cartera
 */
exports.getByCartera = async (req, res) => {
  const { id_cartera } = req.params;
  try {
    const roles = await sequelize.query(sql.getRolesByCartera, {
      replacements: { id_cartera },
      type: QueryTypes.SELECT
    });
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener roles de la cartera' });
  }
};

/**
 * POST /rol-cartera
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_rol, id_cartera } = req.body;

    // Verificar que no exista ya esta combinación
    const existing = await sequelize.query(sql.getRolCarteraById, {
      replacements: { id_rol, id_cartera },
      type: QueryTypes.SELECT,
      transaction
    });

    if (existing.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Esta combinación rol-cartera ya existe' });
    }

    await sequelize.query(sql.createRolCartera, {
      replacements: { id_rol, id_cartera },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Rol asignado a cartera' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Rol o cartera no encontrado' });
    }
    res.status(500).json({ error: 'Error al asignar rol a cartera' });
  }
};

/**
 * DELETE /rol-cartera/rol/:id_rol/cartera/:id_cartera
 */
exports.remove = async (req, res) => {
  const { id_rol, id_cartera } = req.params;
  try {
    await sequelize.query(sql.deleteRolCartera, {
      replacements: { id_rol, id_cartera },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Rol removido de cartera' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al remover rol de cartera' });
  }
};
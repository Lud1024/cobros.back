// controllers/roles.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

const normalizePermissions = (permisos) => {
  if (!permisos) return null;
  if (typeof permisos === 'string') {
    try {
      JSON.parse(permisos);
      return permisos;
    } catch {
      return JSON.stringify({});
    }
  }
  return JSON.stringify(permisos);
};

/**
 * GET /roles
 */
exports.getAll = async (req, res) => {
  try {
    const roles = await sequelize.query(sql.listRoles, { type: QueryTypes.SELECT });
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

/**
 * GET /roles/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const roles = await sequelize.query(sql.getRolById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!roles.length) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(roles[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rol' });
  }
};

/**
 * POST /roles
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { nombre_rol, permisos } = req.body;
    const [result] = await sequelize.query(sql.createRol, {
      replacements: {
        nombre_rol: nombre_rol ?? null,
        permisos: normalizePermissions(permisos)
      },
      type: QueryTypes.INSERT,
      transaction
    });
    await transaction.commit();
    res.status(201).json({ message: 'Rol creado', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El nombre del rol ya existe' });
    }
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

/**
 * PATCH /roles/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const replacements = {
      id,
      nombre_rol: updates.nombre_rol ?? null,
      permisos: normalizePermissions(updates.permisos)
    };
    await sequelize.query(sql.updateRol, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Rol actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

/**
 * DELETE /roles/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteRol, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Rol eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};

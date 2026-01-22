// controllers/usuario_roles.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /usuario-roles
 */
exports.getAll = async (req, res) => {
  try {
    const usuarioRoles = await sequelize.query(sql.listUsuarioRoles, { type: QueryTypes.SELECT });
    res.json(usuarioRoles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asignaciones de roles' });
  }
};

/**
 * GET /usuario-roles/usuario/:id_usuario
 */
exports.getByUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const roles = await sequelize.query(sql.getRolesByUsuario, {
      replacements: { id_usuario },
      type: QueryTypes.SELECT
    });
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener roles del usuario' });
  }
};

/**
 * GET /usuario-roles/rol/:id_rol
 */
exports.getByRol = async (req, res) => {
  const { id_rol } = req.params;
  try {
    const usuarios = await sequelize.query(sql.getUsuariosByRol, {
      replacements: { id_rol },
      type: QueryTypes.SELECT
    });
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios con este rol' });
  }
};

/**
 * GET /usuario-roles/cartera/:id_cartera
 */
exports.getByCartera = async (req, res) => {
  const { id_cartera } = req.params;
  try {
    const usuarios = await sequelize.query(sql.getUsuariosByCartera, {
      replacements: { id_cartera },
      type: QueryTypes.SELECT
    });
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios de la cartera' });
  }
};

/**
 * GET /usuario-roles/usuario/:id_usuario/cartera/:id_cartera
 */
exports.getByUsuarioCartera = async (req, res) => {
  const { id_usuario, id_cartera } = req.params;
  try {
    const roles = await sequelize.query(sql.getRolesByUsuarioCartera, {
      replacements: { id_usuario, id_cartera },
      type: QueryTypes.SELECT
    });
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener roles del usuario en la cartera' });
  }
};

/**
 * POST /usuario-roles
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_usuario, id_rol, id_cartera } = req.body;

    // Verificar que no exista ya esta combinación
    const existing = await sequelize.query(sql.getUsuarioRolById, {
      replacements: { id_usuario, id_rol, id_cartera },
      type: QueryTypes.SELECT,
      transaction
    });

    if (existing.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Esta combinación usuario-rol-cartera ya existe' });
    }

    await sequelize.query(sql.createUsuarioRol, {
      replacements: {
        id_usuario: id_usuario ?? null,
        id_rol: id_rol ?? null,
        id_cartera: id_cartera ?? null
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Rol asignado al usuario' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Usuario, rol o cartera no encontrado' });
    }
    res.status(500).json({ error: 'Error al asignar rol al usuario' });
  }
};

/**
 * DELETE /usuario-roles/usuario/:id_usuario/rol/:id_rol/cartera/:id_cartera
 */
exports.remove = async (req, res) => {
  const { id_usuario, id_rol, id_cartera } = req.params;
  try {
    await sequelize.query(sql.deleteUsuarioRol, {
      replacements: { id_usuario, id_rol, id_cartera },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Rol removido del usuario' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al remover rol del usuario' });
  }
};
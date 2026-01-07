// controllers/clientes.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const logger = require('../utils/logger');

/**
 * GET /clientes
 */
exports.getAll = async (req, res) => {
  try {
    const clientes = await sequelize.query(sql.listClientes, { type: QueryTypes.SELECT });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

/**
 * GET /clientes/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const clientes = await sequelize.query(sql.getClienteById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!clientes.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(clientes[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

/**
 * POST /clientes
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_cartera, nombre, apellido, dpi, nit, direccion, telefono, correo } = req.body;

    // Verificar unicidad de DPI si se proporciona
    if (dpi) {
      const existingDpi = await sequelize.query(sql.getClienteByDpi, {
        replacements: { dpi },
        type: QueryTypes.SELECT,
        transaction
      });
      if (existingDpi.length) {
        await transaction.rollback();
        return res.status(400).json({ error: 'El DPI ya está registrado' });
      }
    }

    // Verificar unicidad de NIT si se proporciona
    if (nit) {
      const existingNit = await sequelize.query(sql.getClienteByNit, {
        replacements: { nit },
        type: QueryTypes.SELECT,
        transaction
      });
      if (existingNit.length) {
        await transaction.rollback();
        return res.status(400).json({ error: 'El NIT ya está registrado' });
      }
    }

    const [result] = await sequelize.query(sql.createCliente, {
      replacements: { id_cartera, nombre, apellido, dpi, nit, direccion, telefono, correo },
      type: QueryTypes.INSERT,
      transaction
    });
    await transaction.commit();
    logger.transaction('✅ CLIENTE CREADO -', { id_cliente: result, nombre, apellido, dpi });
    res.status(201).json({ message: 'Cliente creado', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cartera no encontrada' });
    }
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

/**
 * PATCH /clientes/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Verificar unicidad de DPI si se actualiza
    if (updates.dpi) {
      const existingDpi = await sequelize.query(sql.getClienteByDpi, {
        replacements: { dpi: updates.dpi },
        type: QueryTypes.SELECT
      });
      if (existingDpi.length && existingDpi[0].id_cliente != id) {
        return res.status(400).json({ error: 'El DPI ya está registrado' });
      }
    }

    // Verificar unicidad de NIT si se actualiza
    if (updates.nit) {
      const existingNit = await sequelize.query(sql.getClienteByNit, {
        replacements: { nit: updates.nit },
        type: QueryTypes.SELECT
      });
      if (existingNit.length && existingNit[0].id_cliente != id) {
        return res.status(400).json({ error: 'El NIT ya está registrado' });
      }
    }

    // Preparar replacements con valores null para campos no enviados
    const replacements = {
      id,
      id_cartera: updates.id_cartera || null,
      nombre: updates.nombre || null,
      apellido: updates.apellido || null,
      dpi: updates.dpi || null,
      nit: updates.nit || null,
      direccion: updates.direccion || null,
      telefono: updates.telefono || null,
      correo: updates.correo || null,
      estado: updates.estado || null
    };

    await sequelize.query(sql.updateCliente, {
      replacements,
      type: QueryTypes.UPDATE
    });
    logger.transaction('✏️ CLIENTE ACTUALIZADO -', { id_cliente: id });
    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cartera no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

/**
 * DELETE /clientes/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteCliente, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    logger.transaction('🗑️ CLIENTE ELIMINADO -', { id_cliente: id });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};
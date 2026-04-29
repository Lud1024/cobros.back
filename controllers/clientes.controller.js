// controllers/clientes.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const logger = require('../utils/logger');

const trimOrNull = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed || null;
};

const normalizeClienteInput = (input) => ({
  id_cartera: input.id_cartera ?? null,
  nombre: trimOrNull(input.nombre),
  apellido: trimOrNull(input.apellido),
  dpi: trimOrNull(input.dpi),
  nit: trimOrNull(input.nit),
  direccion: trimOrNull(input.direccion),
  telefono: trimOrNull(input.telefono),
  correo: trimOrNull(input.correo),
  estado: trimOrNull(input.estado),
});

const validateClienteInput = (cliente) => {
  if (!cliente.id_cartera) return 'Cartera es requerida';
  if (!cliente.nombre) return 'Nombre es requerido';
  if (!cliente.apellido) return 'Apellido es requerido';
  if (!cliente.dpi) return 'DPI es requerido';
  if (!cliente.direccion) return 'Direccion es requerida';
  if (!/^\d{13}$/.test(cliente.dpi)) return 'El DPI debe tener 13 digitos';
  if (cliente.nit && !/^\d{1,12}-[\dkK]$/.test(cliente.nit)) return 'Formato de NIT invalido, ejemplo 1234567-8';
  if (cliente.telefono && !/^\d{8}$/.test(cliente.telefono)) return 'El telefono debe tener 8 digitos';
  if (cliente.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo)) return 'Correo invalido';
  return null;
};

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
    const cliente = normalizeClienteInput(req.body);
    const validationError = validateClienteInput(cliente);
    if (validationError) {
      await transaction.rollback();
      return res.status(400).json({ error: validationError });
    }

    const { id_cartera, nombre, apellido, dpi, nit, direccion, telefono, correo } = cliente;

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
      replacements: {
        id_cartera,
        nombre,
        apellido,
        dpi,
        nit,
        direccion,
        telefono,
        correo
      },
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
  const updates = normalizeClienteInput(req.body);
  try {
    const validationError = validateClienteInput(updates);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

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
      id_cartera: updates.id_cartera,
      nombre: updates.nombre,
      apellido: updates.apellido,
      dpi: updates.dpi,
      nit: updates.nit,
      direccion: updates.direccion,
      telefono: updates.telefono,
      correo: updates.correo,
      estado: updates.estado
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

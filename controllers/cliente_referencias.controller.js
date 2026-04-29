// controllers/cliente_referencias.controller.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

const trimOrNull = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed || null;
};

const normalizeReferenciaInput = (input) => ({
  id_cliente: input.id_cliente ?? null,
  nombre_completo: trimOrNull(input.nombre_completo),
  parentesco: trimOrNull(input.parentesco),
  telefono: trimOrNull(input.telefono),
  dpi: trimOrNull(input.dpi),
  direccion: trimOrNull(input.direccion),
  lugar_trabajo: trimOrNull(input.lugar_trabajo),
  telefono_trabajo: trimOrNull(input.telefono_trabajo),
  observaciones: trimOrNull(input.observaciones),
  estado: trimOrNull(input.estado) || 'A',
});

const isValidPhone = (value) => /^[0-9+\-\s]{8,20}$/.test(value);

const validateReferenciaInput = (referencia) => {
  if (!referencia.id_cliente) return 'Cliente es requerido';
  if (!referencia.nombre_completo) return 'Nombre de referencia es requerido';
  if (!referencia.parentesco) return 'Parentesco es requerido';
  if (!referencia.telefono) return 'Telefono es requerido';
  if (!isValidPhone(referencia.telefono)) return 'Telefono debe tener entre 8 y 20 caracteres numericos';
  if (referencia.telefono_trabajo && !isValidPhone(referencia.telefono_trabajo)) {
    return 'Telefono de trabajo debe tener entre 8 y 20 caracteres numericos';
  }
  if (referencia.dpi && !/^\d{13}$/.test(referencia.dpi)) return 'El DPI debe tener 13 digitos';
  if (!['A', 'I'].includes(referencia.estado)) return 'Estado debe ser A o I';
  return null;
};

/**
 * GET /cliente-referencias
 */
exports.getAll = async (req, res) => {
  try {
    const referencias = await sequelize.query(sql.listClienteReferencias, { type: QueryTypes.SELECT });
    res.json(referencias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener referencias' });
  }
};

/**
 * GET /cliente-referencias/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const referencias = await sequelize.query(sql.getClienteReferenciaById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!referencias.length) return res.status(404).json({ error: 'Referencia no encontrada' });
    res.json(referencias[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener referencia' });
  }
};

/**
 * GET /cliente-referencias/cliente/:id_cliente
 */
exports.getByCliente = async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const referencias = await sequelize.query(sql.getReferenciasByCliente, {
      replacements: { id_cliente },
      type: QueryTypes.SELECT
    });
    res.json(referencias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener referencias del cliente' });
  }
};

/**
 * POST /cliente-referencias
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const referencia = normalizeReferenciaInput(req.body);
    const validationError = validateReferenciaInput(referencia);
    if (validationError) {
      await transaction.rollback();
      return res.status(400).json({ error: validationError });
    }

    const [result] = await sequelize.query(sql.createClienteReferencia, {
      replacements: referencia,
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Referencia creada', id: Array.isArray(result) ? result[0] : result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear referencia' });
  }
};

/**
 * PATCH /cliente-referencias/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  try {
    const referencia = normalizeReferenciaInput(req.body);
    const validationError = validateReferenciaInput(referencia);
    if (validationError) return res.status(400).json({ error: validationError });

    await sequelize.query(sql.updateClienteReferencia, {
      replacements: { id, ...referencia },
      type: QueryTypes.UPDATE
    });

    res.json({ message: 'Referencia actualizada' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar referencia' });
  }
};

/**
 * DELETE /cliente-referencias/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteClienteReferencia, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Referencia eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar referencia' });
  }
};

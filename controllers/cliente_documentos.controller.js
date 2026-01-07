// controllers/cliente_documentos.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /cliente-documentos
 */
exports.getAll = async (req, res) => {
  try {
    const documentos = await sequelize.query(sql.listClienteDocumentos, { type: QueryTypes.SELECT });
    res.json(documentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener documentos de clientes' });
  }
};

/**
 * GET /cliente-documentos/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const documentos = await sequelize.query(sql.getClienteDocumentoById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!documentos.length) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(documentos[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener documento' });
  }
};

/**
 * GET /cliente-documentos/cliente/:id_cliente
 */
exports.getByCliente = async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const documentos = await sequelize.query(sql.getDocumentosByCliente, {
      replacements: { id_cliente },
      type: QueryTypes.SELECT
    });
    res.json(documentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener documentos del cliente' });
  }
};

/**
 * GET /cliente-documentos/tipo/:tipo_documento
 */
exports.getByTipo = async (req, res) => {
  const { tipo_documento } = req.params;
  try {
    const documentos = await sequelize.query(sql.getDocumentosByTipo, {
      replacements: { tipo_documento },
      type: QueryTypes.SELECT
    });
    res.json(documentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener documentos por tipo' });
  }
};

/**
 * POST /cliente-documentos
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_cliente, tipo_documento, nombre_archivo, ruta_storage } = req.body;

    // Validar tipo_documento
    const tiposValidos = ['PDF', 'EXCEL', 'OTRO'];
    if (!tiposValidos.includes(tipo_documento)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'tipo_documento debe ser PDF, EXCEL o OTRO' });
    }

    // Validar nombre_archivo
    if (!nombre_archivo || nombre_archivo.trim() === '') {
      await transaction.rollback();
      return res.status(400).json({ error: 'nombre_archivo es requerido' });
    }

    // Validar ruta_storage
    if (!ruta_storage || ruta_storage.trim() === '') {
      await transaction.rollback();
      return res.status(400).json({ error: 'ruta_storage es requerida' });
    }

    await sequelize.query(sql.createClienteDocumento, {
      replacements: {
        id_cliente,
        tipo_documento,
        nombre_archivo: nombre_archivo.trim(),
        ruta_storage: ruta_storage.trim()
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Documento de cliente creado' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear documento de cliente' });
  }
};

/**
 * PATCH /cliente-documentos/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar tipo_documento si se actualiza
    if (updates.tipo_documento) {
      const tiposValidos = ['PDF', 'EXCEL', 'OTRO'];
      if (!tiposValidos.includes(updates.tipo_documento)) {
        return res.status(400).json({ error: 'tipo_documento debe ser PDF, EXCEL o OTRO' });
      }
    }

    // Validar nombre_archivo si se actualiza
    if (updates.nombre_archivo) {
      if (updates.nombre_archivo.trim() === '') {
        return res.status(400).json({ error: 'nombre_archivo no puede estar vacío' });
      }
      updates.nombre_archivo = updates.nombre_archivo.trim();
    }

    // Validar ruta_storage si se actualiza
    if (updates.ruta_storage) {
      if (updates.ruta_storage.trim() === '') {
        return res.status(400).json({ error: 'ruta_storage no puede estar vacía' });
      }
      updates.ruta_storage = updates.ruta_storage.trim();
    }

    const replacements = { id, ...updates };

    await sequelize.query(sql.updateClienteDocumento, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Documento de cliente actualizado' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar documento de cliente' });
  }
};

/**
 * DELETE /cliente-documentos/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteClienteDocumento, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Documento de cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar documento de cliente' });
  }
};
// controllers/cliente_documentos.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const { getScope } = require('../utils/accessControl');

const tiposDocumentoValidos = [
  'DPI',
  'Contrato de Prestamo',
  'Recibo de Pago',
  'Comprobante de Ingresos',
  'Comprobante de Domicilio',
  'Garantia',
  'PDF',
  'EXCEL',
  'OTRO'
];

/**
 * GET /cliente-documentos
 */
exports.getAll = async (req, res) => {
  try {
    const scope = await getScope(req.user);
    const documentos = scope.isAdmin
      ? await sequelize.query(sql.listClienteDocumentos, { type: QueryTypes.SELECT })
      : scope.carteraIds.length
        ? await sequelize.query(sql.listClienteDocumentosScoped, {
            replacements: { id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const documentos = scope.isAdmin
      ? await sequelize.query(sql.getClienteDocumentoById, {
          replacements: { id },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getClienteDocumentoByIdScoped, {
            replacements: { id, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const documentos = scope.isAdmin
      ? await sequelize.query(sql.getDocumentosByCliente, {
          replacements: { id_cliente },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getDocumentosByClienteScoped, {
            replacements: { id_cliente, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const documentos = scope.isAdmin
      ? await sequelize.query(sql.getDocumentosByTipo, {
          replacements: { tipo_documento },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getDocumentosByTipoScoped, {
            replacements: { tipo_documento, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);

    if (!scope.isAdmin) {
      const allowedCliente = scope.carteraIds.length
        ? await sequelize.query(sql.getClienteByIdScoped, {
            replacements: { id: id_cliente, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT,
            transaction
          })
        : [];
      if (!allowedCliente.length) {
        await transaction.rollback();
        return res.status(403).json({ error: 'No tiene acceso al cliente seleccionado' });
      }
    }

    // Validar tipo_documento
    if (!tiposDocumentoValidos.includes(tipo_documento)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'tipo_documento no es valido' });
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
    const scope = await getScope(req.user);
    if (!scope.isAdmin) {
      const allowedDocumento = scope.carteraIds.length
        ? await sequelize.query(sql.getClienteDocumentoByIdScoped, {
            replacements: { id, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
      if (!allowedDocumento.length) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }
    }

    // Validar tipo_documento si se actualiza
    if (updates.tipo_documento) {
      if (!tiposDocumentoValidos.includes(updates.tipo_documento)) {
        return res.status(400).json({ error: 'tipo_documento no es valido' });
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

    const replacements = {
      id,
      id_cliente: updates.id_cliente ?? null,
      tipo_documento: updates.tipo_documento ?? null,
      nombre_archivo: updates.nombre_archivo ?? null,
      ruta_storage: updates.ruta_storage ?? null
    };

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
    const scope = await getScope(req.user);
    if (!scope.isAdmin) {
      const allowedDocumento = scope.carteraIds.length
        ? await sequelize.query(sql.getClienteDocumentoByIdScoped, {
            replacements: { id, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
      if (!allowedDocumento.length) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }
    }

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

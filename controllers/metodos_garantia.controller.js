// controllers/metodos_garantia.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /metodos-garantia
 */
exports.getAll = async (req, res) => {
  try {
    const metodosGarantia = await sequelize.query(sql.listMetodosGarantia, { type: QueryTypes.SELECT });
    res.json(metodosGarantia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener métodos de garantía' });
  }
};

/**
 * GET /metodos-garantia/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const metodosGarantia = await sequelize.query(sql.getMetodoGarantiaById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!metodosGarantia.length) return res.status(404).json({ error: 'Método de garantía no encontrado' });
    res.json(metodosGarantia[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener método de garantía' });
  }
};

/**
 * POST /metodos-garantia
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { nombre_metodo, descripcion } = req.body;

    // Validar nombre requerido
    if (!nombre_metodo || nombre_metodo.trim() === '') {
      await transaction.rollback();
      return res.status(400).json({ error: 'nombre_metodo es requerido' });
    }

    const [result] = await sequelize.query(sql.createMetodoGarantia, {
      replacements: {
        nombre_metodo: nombre_metodo ? nombre_metodo.trim() : null,
        descripcion: descripcion ?? null
      },
      type: QueryTypes.INSERT,
      transaction
    });
    await transaction.commit();
    res.status(201).json({ message: 'Método de garantía creado', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al crear método de garantía' });
  }
};

/**
 * PATCH /metodos-garantia/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar nombre si se actualiza
    if (updates.nombre_metodo && updates.nombre_metodo.trim() === '') {
      return res.status(400).json({ error: 'nombre_metodo no puede estar vacío' });
    }

    // Verificar unicidad si se actualiza nombre_metodo
    if (updates.nombre_metodo) {
      const existing = await sequelize.query(sql.getMetodoGarantiaByNombre, {
        replacements: { nombre_metodo: updates.nombre_metodo.trim() },
        type: QueryTypes.SELECT
      });
      if (existing.length && existing[0].id_metodo != id) {
        return res.status(400).json({ error: 'El nombre del método ya existe' });
      }
      updates.nombre_metodo = updates.nombre_metodo.trim();
    }

    const replacements = {
      id,
      nombre_metodo: updates.nombre_metodo ?? null,
      descripcion: updates.descripcion ?? null
    };

    await sequelize.query(sql.updateMetodoGarantia, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Método de garantía actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar método de garantía' });
  }
};

/**
 * DELETE /metodos-garantia/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteMetodoGarantia, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Método de garantía eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar método de garantía' });
  }
};
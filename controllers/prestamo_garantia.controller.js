// controllers/prestamo_garantia.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /prestamo-garantia
 */
exports.getAll = async (req, res) => {
  try {
    const prestamoGarantia = await sequelize.query(sql.listPrestamoGarantia, { type: QueryTypes.SELECT });
    res.json(prestamoGarantia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener relaciones préstamo-garantía' });
  }
};

/**
 * GET /prestamo-garantia/prestamo/:id_prestamo
 */
exports.getByPrestamo = async (req, res) => {
  const { id_prestamo } = req.params;
  try {
    const garantias = await sequelize.query(sql.getGarantiasByPrestamo, {
      replacements: { id_prestamo },
      type: QueryTypes.SELECT
    });
    res.json(garantias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener garantías del préstamo' });
  }
};

/**
 * GET /prestamo-garantia/metodo/:id_metodo
 */
exports.getByMetodo = async (req, res) => {
  const { id_metodo } = req.params;
  try {
    const prestamos = await sequelize.query(sql.getPrestamosByGarantia, {
      replacements: { id_metodo },
      type: QueryTypes.SELECT
    });
    res.json(prestamos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener préstamos con esta garantía' });
  }
};

/**
 * POST /prestamo-garantia
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_prestamo, id_metodo, valor_garantia } = req.body;

    // Validar valor positivo
    if (valor_garantia <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'valor_garantia debe ser mayor a 0' });
    }

    // Verificar que no exista ya esta combinación
    const existing = await sequelize.query(sql.getPrestamoGarantiaById, {
      replacements: { id_prestamo, id_metodo },
      type: QueryTypes.SELECT,
      transaction
    });

    if (existing.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Esta combinación préstamo-garantía ya existe' });
    }

    await sequelize.query(sql.createPrestamoGarantia, {
      replacements: {
        id_prestamo: id_prestamo ?? null,
        id_metodo: id_metodo ?? null,
        valor_garantia: valor_garantia ?? null
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Relación préstamo-garantía creada' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Préstamo o método de garantía no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear relación préstamo-garantía' });
  }
};

/**
 * PATCH /prestamo-garantia/prestamo/:id_prestamo/metodo/:id_metodo
 */
exports.update = async (req, res) => {
  const { id_prestamo, id_metodo } = req.params;
  const { valor_garantia } = req.body;
  try {
    // Validar valor si se actualiza
    if (valor_garantia && valor_garantia <= 0) {
      return res.status(400).json({ error: 'valor_garantia debe ser mayor a 0' });
    }

    await sequelize.query(sql.updatePrestamoGarantia, {
      replacements: {
        id_prestamo: id_prestamo ?? null,
        id_metodo: id_metodo ?? null,
        valor_garantia: valor_garantia ?? null
      },
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Relación préstamo-garantía actualizada' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Préstamo o método de garantía no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar relación préstamo-garantía' });
  }
};

/**
 * DELETE /prestamo-garantia/prestamo/:id_prestamo/metodo/:id_metodo
 */
exports.remove = async (req, res) => {
  const { id_prestamo, id_metodo } = req.params;
  try {
    await sequelize.query(sql.deletePrestamoGarantia, {
      replacements: { id_prestamo, id_metodo },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Relación préstamo-garantía eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar relación préstamo-garantía' });
  }
};
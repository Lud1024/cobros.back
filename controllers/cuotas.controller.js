// controllers/cuotas.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /cuotas
 */
exports.getAll = async (req, res) => {
  try {
    const cuotas = await sequelize.query(sql.listCuotas, { type: QueryTypes.SELECT });
    res.json(cuotas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cuotas' });
  }
};

/**
 * GET /cuotas/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const cuotas = await sequelize.query(sql.getCuotaById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!cuotas.length) return res.status(404).json({ error: 'Cuota no encontrada' });
    res.json(cuotas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cuota' });
  }
};

/**
 * GET /cuotas/prestamo/:id_prestamo
 */
exports.getByPrestamo = async (req, res) => {
  const { id_prestamo } = req.params;
  try {
    const cuotas = await sequelize.query(sql.getCuotasByPrestamo, {
      replacements: { id_prestamo },
      type: QueryTypes.SELECT
    });
    res.json(cuotas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cuotas del préstamo' });
  }
};

/**
 * POST /cuotas
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      id_prestamo,
      numero_cuota,
      fecha_vencimiento,
      capital_programado,
      interes_programado,
      capital_pagado = 0,
      interes_pagado = 0,
      mora_acumulada = 0,
      estado = 'activa'
    } = req.body;

    // Validaciones
    if (capital_programado <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'capital_programado debe ser mayor a 0' });
    }

    if (interes_programado < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'interes_programado no puede ser negativo' });
    }

    if (numero_cuota <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'numero_cuota debe ser mayor a 0' });
    }

    // Verificar que no exista ya esa combinación préstamo + número de cuota
    const existingCuota = await sequelize.query(sql.getCuotaByPrestamoNumero, {
      replacements: { id_prestamo, numero_cuota },
      type: QueryTypes.SELECT,
      transaction
    });

    if (existingCuota.length) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Ya existe una cuota con ese número para este préstamo' });
    }

    const [result] = await sequelize.query(sql.createCuota, {
      replacements: {
        id_prestamo,
        numero_cuota,
        fecha_vencimiento,
        capital_programado,
        interes_programado,
        capital_pagado,
        interes_pagado,
        mora_acumulada,
        estado
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Cuota creada', id: result });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Préstamo no encontrado' });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe una cuota con esa combinación préstamo-número' });
    }
    res.status(500).json({ error: 'Error al crear cuota' });
  }
};

/**
 * PATCH /cuotas/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar valores si se actualizan
    if (updates.capital_programado && updates.capital_programado <= 0) {
      return res.status(400).json({ error: 'capital_programado debe ser mayor a 0' });
    }

    if (updates.interes_programado && updates.interes_programado < 0) {
      return res.status(400).json({ error: 'interes_programado no puede ser negativo' });
    }

    if (updates.numero_cuota && updates.numero_cuota <= 0) {
      return res.status(400).json({ error: 'numero_cuota debe ser mayor a 0' });
    }

    // Si se actualiza numero_cuota, verificar unicidad
    if (updates.numero_cuota) {
      const cuotaActual = await sequelize.query(sql.getCuotaById, {
        replacements: { id },
        type: QueryTypes.SELECT
      });

      if (cuotaActual.length) {
        const existingCuota = await sequelize.query(sql.getCuotaByPrestamoNumero, {
          replacements: { id_prestamo: cuotaActual[0].id_prestamo, numero_cuota: updates.numero_cuota },
          type: QueryTypes.SELECT
        });

        if (existingCuota.length && existingCuota[0].id_cuota != id) {
          return res.status(400).json({ error: 'Ya existe una cuota con ese número para este préstamo' });
        }
      }
    }

    const replacements = {
      id,
      id_prestamo: updates.id_prestamo ?? null,
      numero_cuota: updates.numero_cuota ?? null,
      fecha_vencimiento: updates.fecha_vencimiento ?? null,
      capital_programado: updates.capital_programado ?? null,
      interes_programado: updates.interes_programado ?? null,
      capital_pagado: updates.capital_pagado ?? null,
      interes_pagado: updates.interes_pagado ?? null,
      mora_acumulada: updates.mora_acumulada ?? null,
      estado: updates.estado ?? null
    };

    await sequelize.query(sql.updateCuota, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Cuota actualizada' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Préstamo no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar cuota' });
  }
};

/**
 * DELETE /cuotas/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteCuota, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Cuota eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cuota' });
  }
};
// controllers/visitas_cobro.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();

/**
 * GET /visitas-cobro
 */
exports.getAll = async (req, res) => {
  try {
    const visitas = await sequelize.query(sql.listVisitasCobro, { type: QueryTypes.SELECT });
    res.json(visitas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visitas de cobro' });
  }
};

/**
 * GET /visitas-cobro/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const visitas = await sequelize.query(sql.getVisitaCobroById, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    if (!visitas.length) return res.status(404).json({ error: 'Visita de cobro no encontrada' });
    res.json(visitas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visita de cobro' });
  }
};

/**
 * GET /visitas-cobro/cliente/:id_cliente
 */
exports.getByCliente = async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const visitas = await sequelize.query(sql.getVisitasByCliente, {
      replacements: { id_cliente },
      type: QueryTypes.SELECT
    });
    res.json(visitas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visitas del cliente' });
  }
};

/**
 * GET /visitas-cobro/prestamo/:id_prestamo
 */
exports.getByPrestamo = async (req, res) => {
  const { id_prestamo } = req.params;
  try {
    const visitas = await sequelize.query(sql.getVisitasByPrestamo, {
      replacements: { id_prestamo },
      type: QueryTypes.SELECT
    });
    res.json(visitas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visitas del préstamo' });
  }
};

/**
 * GET /visitas-cobro/resultado/:resultado
 */
exports.getByResultado = async (req, res) => {
  const { resultado } = req.params;
  try {
    const visitas = await sequelize.query(sql.getVisitasByResultado, {
      replacements: { resultado },
      type: QueryTypes.SELECT
    });
    res.json(visitas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visitas por resultado' });
  }
};

/**
 * POST /visitas-cobro
 */
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id_cliente, id_prestamo, resultado, mensaje_dejado, total_cobros_info } = req.body;

    // Validar resultado
    const resultadosValidos = ['COBRO', 'NO_ENCONTRADO', 'PROMESA', 'NEGOCIACION', 'OTRO'];
    if (!resultadosValidos.includes(resultado)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'resultado debe ser COBRO, NO_ENCONTRADO, PROMESA, NEGOCIACION o OTRO' });
    }

    // Validar total_cobros_info no negativo
    if (total_cobros_info < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'total_cobros_info no puede ser negativo' });
    }

    await sequelize.query(sql.createVisitaCobro, {
      replacements: {
        id_cliente,
        id_prestamo,
        resultado,
        mensaje_dejado,
        total_cobros_info: total_cobros_info || 0
      },
      type: QueryTypes.INSERT,
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Visita de cobro creada' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o préstamo no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear visita de cobro' });
  }
};

/**
 * PATCH /visitas-cobro/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Validar resultado si se actualiza
    if (updates.resultado) {
      const resultadosValidos = ['COBRO', 'NO_ENCONTRADO', 'PROMESA', 'NEGOCIACION', 'OTRO'];
      if (!resultadosValidos.includes(updates.resultado)) {
        return res.status(400).json({ error: 'resultado debe ser COBRO, NO_ENCONTRADO, PROMESA, NEGOCIACION o OTRO' });
      }
    }

    // Validar total_cobros_info si se actualiza
    if (updates.total_cobros_info !== undefined && updates.total_cobros_info < 0) {
      return res.status(400).json({ error: 'total_cobros_info no puede ser negativo' });
    }

    const replacements = { id, ...updates };

    await sequelize.query(sql.updateVisitaCobro, {
      replacements,
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Visita de cobro actualizada' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o préstamo no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar visita de cobro' });
  }
};

/**
 * DELETE /visitas-cobro/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.query(sql.deleteVisitaCobro, {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Visita de cobro eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar visita de cobro' });
  }
};
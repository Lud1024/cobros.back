// controllers/visitas_cobro.controller.js
const { QueryTypes, Transaction } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const { getScope } = require('../utils/accessControl');
const { todayDateOnly, isValidDateOnly } = require('../utils/dateValidation');
const { actualizarMoraPrestamo } = require('../services/loanAccounting');

const MONEY_EPSILON = 0.004;

const normalizeVisitDate = (value) => {
  if (!value) return todayDateOnly();
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const dateOnly = String(value).slice(0, 10);
  if (!isValidDateOnly(dateOnly)) {
    const error = new Error('fecha_visita debe tener formato YYYY-MM-DD');
    error.statusCode = 400;
    throw error;
  }
  return dateOnly;
};

const getPrestamoCliente = async ({ idPrestamo, idCliente, scope, transaction }) => {
  if (!idPrestamo || !idCliente) return null;

  const carteraFilter = scope.isAdmin
    ? ''
    : scope.carteraIds.length ? 'AND c.id_cartera IN (:id_carteras)' : 'AND 1=0';

  const rows = await sequelize.query(
    `SELECT p.id_prestamo, p.id_cliente
     FROM prestamos p
     INNER JOIN clientes c ON c.id_cliente = p.id_cliente
     WHERE p.id_prestamo = :id_prestamo
       AND p.id_cliente = :id_cliente
       ${carteraFilter}
     LIMIT 1`,
    {
      replacements: {
        id_prestamo: idPrestamo,
        id_cliente: idCliente,
        id_carteras: scope.carteraIds
      },
      type: QueryTypes.SELECT,
      transaction
    }
  );

  return rows[0] || null;
};

const getMontoDebePagar = async (idPrestamo, transaction) => {
  const rows = await sequelize.query(
    `SELECT
       c.id_cuota,
       c.numero_cuota,
       ROUND(
         c.capital_programado + c.interes_programado + c.mora_acumulada -
         c.capital_pagado - c.interes_pagado - COALESCE(pa.mora_pagada, 0),
         2
       ) AS saldo_pendiente
     FROM cuotas c
     LEFT JOIN (
       SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
       FROM pago_aplicaciones
       GROUP BY id_cuota
     ) pa ON pa.id_cuota = c.id_cuota
     WHERE c.id_prestamo = :id_prestamo
       AND c.estado <> 'cancelada'
     HAVING saldo_pendiente > :money_epsilon
     ORDER BY c.numero_cuota DESC, c.fecha_vencimiento DESC, c.id_cuota DESC
     LIMIT 1`,
    {
      replacements: {
        id_prestamo: idPrestamo,
        money_epsilon: MONEY_EPSILON
      },
      type: QueryTypes.SELECT,
      transaction
    }
  );

  return Number(rows[0]?.saldo_pendiente || 0);
};

/**
 * GET /visitas-cobro
 */
exports.getAll = async (req, res) => {
  try {
    const scope = await getScope(req.user);
    const visitas = scope.isAdmin
      ? await sequelize.query(sql.listVisitasCobro, { type: QueryTypes.SELECT })
      : scope.carteraIds.length
        ? await sequelize.query(sql.listVisitasCobroScoped, {
            replacements: { id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const visitas = scope.isAdmin
      ? await sequelize.query(sql.getVisitaCobroById, {
          replacements: { id },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getVisitaCobroByIdScoped, {
            replacements: { id, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const visitas = scope.isAdmin
      ? await sequelize.query(sql.getVisitasByCliente, {
          replacements: { id_cliente },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getVisitasByClienteScoped, {
            replacements: { id_cliente, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const visitas = scope.isAdmin
      ? await sequelize.query(sql.getVisitasByPrestamo, {
          replacements: { id_prestamo },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getVisitasByPrestamoScoped, {
            replacements: { id_prestamo, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const scope = await getScope(req.user);
    const visitas = scope.isAdmin
      ? await sequelize.query(sql.getVisitasByResultado, {
          replacements: { resultado },
          type: QueryTypes.SELECT
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getVisitasByResultadoScoped, {
            replacements: { resultado, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
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
    const { id_cliente, id_prestamo, resultado, mensaje_dejado } = req.body;
    const fechaVisita = normalizeVisitDate(req.body.fecha_visita);
    const scope = await getScope(req.user);

    if (!id_cliente || !id_prestamo) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cliente y prestamo son requeridos' });
    }

    // Validar resultado
    const resultadosValidos = ['COBRO', 'NO_ENCONTRADO', 'PROMESA', 'NEGOCIACION', 'OTRO'];
    if (!resultadosValidos.includes(resultado)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'resultado debe ser COBRO, NO_ENCONTRADO, PROMESA, NEGOCIACION o OTRO' });
    }

    const prestamoCliente = await getPrestamoCliente({
      idPrestamo: id_prestamo,
      idCliente: id_cliente,
      scope,
      transaction
    });

    if (!prestamoCliente) {
      await transaction.rollback();
      return res.status(scope.isAdmin ? 400 : 403).json({ error: 'El prestamo seleccionado no pertenece al cliente o no tiene acceso' });
    }

    await actualizarMoraPrestamo(id_prestamo, fechaVisita, transaction);
    const totalCobros = await getMontoDebePagar(id_prestamo, transaction);

    const [result] = await sequelize.query(sql.createVisitaCobro, {
      replacements: {
        id_cliente: id_cliente ?? null,
        id_prestamo: id_prestamo ?? null,
        id_usuario_registro: req.user?.id ?? null,
        fecha_visita: fechaVisita,
        resultado: resultado ?? null,
        mensaje_dejado: mensaje_dejado ?? null,
        total_cobros_info: totalCobros
      },
      type: QueryTypes.INSERT,
      transaction
    });
    const idVisita = Array.isArray(result) ? result[0] : result;

    await transaction.commit();
    res.status(201).json({ message: 'Visita de cobro creada', id: idVisita });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o préstamo no encontrado' });
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Error al crear visita de cobro' });
  }
};

/**
 * PATCH /visitas-cobro/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const transaction = await sequelize.transaction();
  try {
    const scope = await getScope(req.user);
    const visitasActuales = scope.isAdmin
      ? await sequelize.query(sql.getVisitaCobroById, {
          replacements: { id },
          type: QueryTypes.SELECT,
          transaction
        })
      : scope.carteraIds.length
        ? await sequelize.query(sql.getVisitaCobroByIdScoped, {
            replacements: { id, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT,
            transaction
          })
        : [];

    if (!visitasActuales.length) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Visita de cobro no encontrada' });
    }

    // Validar resultado si se actualiza
    if (updates.resultado) {
      const resultadosValidos = ['COBRO', 'NO_ENCONTRADO', 'PROMESA', 'NEGOCIACION', 'OTRO'];
      if (!resultadosValidos.includes(updates.resultado)) {
        await transaction.rollback();
        return res.status(400).json({ error: 'resultado debe ser COBRO, NO_ENCONTRADO, PROMESA, NEGOCIACION o OTRO' });
      }
    }

    const visitaActual = visitasActuales[0];
    const idClienteFinal = updates.id_cliente ?? visitaActual.id_cliente;
    const idPrestamoFinal = updates.id_prestamo ?? visitaActual.id_prestamo;
    const fechaVisita = updates.fecha_visita === undefined
      ? normalizeVisitDate(visitaActual.fecha_visita)
      : normalizeVisitDate(updates.fecha_visita);

    const prestamoCliente = await getPrestamoCliente({
      idPrestamo: idPrestamoFinal,
      idCliente: idClienteFinal,
      scope,
      transaction
    });

    if (!prestamoCliente) {
      await transaction.rollback();
      return res.status(scope.isAdmin ? 400 : 403).json({ error: 'El prestamo seleccionado no pertenece al cliente o no tiene acceso' });
    }

    await actualizarMoraPrestamo(idPrestamoFinal, fechaVisita, transaction);
    const totalCobros = await getMontoDebePagar(idPrestamoFinal, transaction);

    const replacements = {
      id,
      id_cliente: idClienteFinal,
      id_prestamo: idPrestamoFinal,
      fecha_visita: fechaVisita,
      resultado: updates.resultado ?? null,
      mensaje_dejado: updates.mensaje_dejado ?? null,
      total_cobros_info: totalCobros
    };

    await sequelize.query(sql.updateVisitaCobro, {
      replacements,
      type: QueryTypes.UPDATE,
      transaction
    });
    await transaction.commit();
    res.json({ message: 'Visita de cobro actualizada' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Cliente o préstamo no encontrado' });
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Error al actualizar visita de cobro' });
  }
};

/**
 * DELETE /visitas-cobro/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const scope = await getScope(req.user);
    if (!scope.isAdmin) {
      const allowedVisita = scope.carteraIds.length
        ? await sequelize.query(sql.getVisitaCobroByIdScoped, {
            replacements: { id, id_carteras: scope.carteraIds },
            type: QueryTypes.SELECT
          })
        : [];
      if (!allowedVisita.length) {
        return res.status(404).json({ error: 'Visita de cobro no encontrada' });
      }
    }

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

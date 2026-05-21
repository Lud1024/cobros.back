const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const sql = require('../utils/sqlLoader')();
const { todayDateOnly } = require('../utils/dateValidation');

const MONEY_EPSILON = 0.004;
const DAYS_PER_FINANCIAL_MONTH = 30;
const INSTALLMENT_APPROXIMATION_STEP = 100;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
const roundInstallment = (value) => {
  const approximated = Math.round(toNumber(value) / INSTALLMENT_APPROXIMATION_STEP) * INSTALLMENT_APPROXIMATION_STEP;
  return roundMoney(approximated > 0 ? approximated : value);
};

const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const [datePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const daysBetween = (from, to) => {
  const fromDate = toDateOnly(from);
  const toDate = toDateOnly(to);
  if (!fromDate || !toDate) return 0;
  return Math.floor((toDate - fromDate) / 86400000);
};

const lastDayOfMonth = (year, monthIndex) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

const addMonthsWithPaymentDay = (date, months, diaPago) => {
  const base = toDateOnly(date);
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth() + months;
  const target = new Date(Date.UTC(year, month, 1));
  const safeDay = Math.min(Math.max(Number(diaPago) || base.getUTCDate(), 1), lastDayOfMonth(target.getUTCFullYear(), target.getUTCMonth()));
  target.setUTCDate(safeDay);
  return target;
};

const addDays = (date, days) => {
  const result = toDateOnly(date);
  result.setUTCDate(result.getUTCDate() + Number(days));
  return result;
};

const getPeriodicidad = async (idPeriodicidad, transaction) => {
  const rows = await sequelize.query(sql.getPeriodicidadById, {
    replacements: { id: idPeriodicidad },
    type: QueryTypes.SELECT,
    transaction
  });
  return rows[0] || null;
};

const getPaymentDate = (periodicidad, fechaInicio, numeroCuota, diaPago) => {
  const codigo = String(periodicidad.codigo || '').toUpperCase();
  const dias = Math.max(Number(periodicidad.dias) || 30, 1);

  if (codigo.includes('MENSUAL') || codigo.includes('BIMESTRAL') || codigo.includes('TRIMESTRAL')) {
    const monthsByCode = codigo.includes('TRIMESTRAL') ? 3 : codigo.includes('BIMESTRAL') ? 2 : 1;
    return addMonthsWithPaymentDay(fechaInicio, monthsByCode * numeroCuota, diaPago);
  }

  return addDays(fechaInicio, dias * numeroCuota);
};

const buildAmortizationSchedule = ({ monto, tasaInteresAnual, plazoCuotas, fechaInicio, diaPago, periodicidad }) => {
  const principal = roundMoney(monto);
  const cuotas = Number(plazoCuotas);
  const diasPeriodo = Math.max(Number(periodicidad.dias) || 30, 1);
  const tasaPeriodo = (toNumber(tasaInteresAnual) / 100) * (diasPeriodo / DAYS_PER_FINANCIAL_MONTH);

  if (!principal || !cuotas || cuotas <= 0) {
    throw new Error('Datos insuficientes para generar cuotas');
  }

  const cuotaExacta = tasaPeriodo > 0
    ? roundMoney(principal * (tasaPeriodo / (1 - Math.pow(1 + tasaPeriodo, -cuotas))))
    : roundMoney(principal / cuotas);
  const cuotaFija = roundInstallment(cuotaExacta);

  let saldo = principal;

  return Array.from({ length: cuotas }, (_, index) => {
    const numeroCuota = index + 1;
    const interes = tasaPeriodo > 0 ? roundMoney(saldo * tasaPeriodo) : 0;
    let capital = numeroCuota === cuotas ? saldo : roundMoney(cuotaFija - interes);
    if (numeroCuota !== cuotas && capital <= MONEY_EPSILON) {
      capital = roundMoney(cuotaExacta - interes);
    }
    if (capital <= MONEY_EPSILON) {
      const error = new Error('La tasa de interes mensual es demasiado alta para el plazo indicado');
      error.statusCode = 400;
      throw error;
    }
    capital = numeroCuota === cuotas ? saldo : Math.min(capital, saldo);
    saldo = roundMoney(saldo - capital);

    return {
      numero_cuota: numeroCuota,
      fecha_vencimiento: formatDate(getPaymentDate(periodicidad, fechaInicio, numeroCuota, diaPago)),
      capital_programado: roundMoney(capital),
      interes_programado: roundMoney(interes),
      capital_pagado: 0,
      interes_pagado: 0,
      mora_acumulada: 0,
      estado: 'activa'
    };
  });
};

const generateCuotasForPrestamo = async ({ idPrestamo, monto, tasaInteresAnual, idPeriodicidad, plazoCuotas, fechaInicio, diaPago }, transaction) => {
  const periodicidad = await getPeriodicidad(idPeriodicidad, transaction);
  if (!periodicidad) {
    const error = new Error('Periodicidad no encontrada');
    error.statusCode = 400;
    throw error;
  }

  const cuotas = buildAmortizationSchedule({
    monto,
    tasaInteresAnual,
    plazoCuotas,
    fechaInicio,
    diaPago,
    periodicidad
  });

  for (const cuota of cuotas) {
    await sequelize.query(sql.createCuota, {
      replacements: {
        id_prestamo: idPrestamo,
        ...cuota
      },
      type: QueryTypes.INSERT,
      transaction
    });
  }

  return cuotas;
};

const getPoliticaMoraForPrestamo = async (idPrestamo, fechaReferencia, transaction) => {
  const rows = await sequelize.query(
    `SELECT pm.*
     FROM prestamos p
     INNER JOIN clientes c ON c.id_cliente = p.id_cliente
     INNER JOIN politicas_mora pm ON pm.id_cartera = c.id_cartera
     WHERE p.id_prestamo = :id_prestamo
       AND pm.vigente_desde <= :fecha_referencia
       AND (pm.vigente_hasta IS NULL OR pm.vigente_hasta >= :fecha_referencia)
     ORDER BY pm.vigente_desde DESC, pm.id_politica DESC
     LIMIT 1`,
    {
      replacements: { id_prestamo: idPrestamo, fecha_referencia: fechaReferencia },
      type: QueryTypes.SELECT,
      transaction
    }
  );
  return rows[0] || null;
};

const getPrestamosConCuotasPendientes = async (transaction) => {
  return sequelize.query(
    `SELECT DISTINCT id_prestamo
     FROM cuotas
     WHERE estado <> 'cancelada'`,
    { type: QueryTypes.SELECT, transaction }
  );
};

const updateCuotaEstado = async (cuota, fechaReferencia, transaction) => {
  const capitalPendiente = Math.max(0, roundMoney(toNumber(cuota.capital_programado) - toNumber(cuota.capital_pagado)));
  const interesPendiente = Math.max(0, roundMoney(toNumber(cuota.interes_programado) - toNumber(cuota.interes_pagado)));
  const moraPendiente = Math.max(0, roundMoney(toNumber(cuota.mora_acumulada) - toNumber(cuota.mora_pagada)));
  const saldoPendiente = roundMoney(capitalPendiente + interesPendiente + moraPendiente);
  const estado = saldoPendiente <= MONEY_EPSILON
    ? 'cancelada'
    : daysBetween(cuota.fecha_vencimiento, fechaReferencia) > 0 ? 'vencida' : 'activa';

  if (estado !== cuota.estado) {
    await sequelize.query(sql.updateCuota, {
      replacements: {
        id: cuota.id_cuota,
        id_prestamo: null,
        numero_cuota: null,
        fecha_vencimiento: null,
        capital_programado: null,
        interes_programado: null,
        capital_pagado: null,
        interes_pagado: null,
        mora_acumulada: null,
        estado
      },
      type: QueryTypes.UPDATE,
      transaction
    });
  }

  return estado;
};

const actualizarMoraPrestamo = async (idPrestamo, fechaReferencia = todayDateOnly(), transaction) => {
  const ownsTransaction = !transaction;
  const trx = transaction || await sequelize.transaction();

  try {
    const politica = await getPoliticaMoraForPrestamo(idPrestamo, fechaReferencia, trx);
    const cuotas = await sequelize.query(
      `SELECT c.*,
              COALESCE(pa.mora_pagada, 0) AS mora_pagada
       FROM cuotas c
       LEFT JOIN (
         SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
         FROM pago_aplicaciones
         GROUP BY id_cuota
       ) pa ON pa.id_cuota = c.id_cuota
       WHERE c.id_prestamo = :id_prestamo
       ORDER BY c.fecha_vencimiento, c.numero_cuota`,
      {
        replacements: { id_prestamo: idPrestamo },
        type: QueryTypes.SELECT,
        transaction: trx
      }
    );

    for (const cuota of cuotas) {
      const diasAtraso = daysBetween(cuota.fecha_vencimiento, fechaReferencia);
      const saldoBase = Math.max(0, roundMoney(
        toNumber(cuota.capital_programado) + toNumber(cuota.interes_programado) -
        toNumber(cuota.capital_pagado) - toNumber(cuota.interes_pagado)
      ));

      let moraAcumulada = toNumber(cuota.mora_acumulada);

      if (politica && diasAtraso > 0 && saldoBase > MONEY_EPSILON) {
        const moraCalculada = roundMoney(saldoBase * toNumber(politica.tasa_mora_diaria) * diasAtraso);
        const moraConTope = politica.tope_mora == null
          ? moraCalculada
          : Math.min(moraCalculada, toNumber(politica.tope_mora));
        const nuevaMora = Math.max(moraAcumulada, roundMoney(moraConTope));

        if (nuevaMora > moraAcumulada + MONEY_EPSILON) {
          await sequelize.query(sql.updateCuota, {
            replacements: {
              id: cuota.id_cuota,
              id_prestamo: null,
              numero_cuota: null,
              fecha_vencimiento: null,
              capital_programado: null,
              interes_programado: null,
              capital_pagado: null,
              interes_pagado: null,
              mora_acumulada: nuevaMora,
              estado: null
            },
            type: QueryTypes.UPDATE,
            transaction: trx
          });

          await sequelize.query(sql.createMoraEvento, {
            replacements: {
              id_cuota: cuota.id_cuota,
              fecha_calculo: fechaReferencia,
              dias_atraso: diasAtraso,
              interes_mora: roundMoney(nuevaMora - moraAcumulada)
            },
            type: QueryTypes.INSERT,
            transaction: trx
          });

          cuota.mora_acumulada = nuevaMora;
          moraAcumulada = nuevaMora;
        }
      }

      await updateCuotaEstado({ ...cuota, mora_acumulada: moraAcumulada }, fechaReferencia, trx);
    }

    if (ownsTransaction) await trx.commit();
  } catch (error) {
    if (ownsTransaction) await trx.rollback();
    throw error;
  }
};

const actualizarMoraTodosLosPrestamos = async (fechaReferencia = todayDateOnly()) => {
  const transaction = await sequelize.transaction();
  try {
    const prestamos = await getPrestamosConCuotasPendientes(transaction);
    for (const prestamo of prestamos) {
      await actualizarMoraPrestamo(prestamo.id_prestamo, fechaReferencia, transaction);
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createPagoAplicacion = async ({ idPago, idCuota, aplicadoA, montoAplicado }, transaction) => {
  if (montoAplicado <= MONEY_EPSILON) return;

  await sequelize.query(sql.createPagoAplicacion, {
    replacements: {
      id_pago: idPago,
      id_cuota: idCuota,
      aplicado_a: aplicadoA,
      monto_aplicado: roundMoney(montoAplicado)
    },
    type: QueryTypes.INSERT,
    transaction
  });
};

const applyPagoToCuotas = async ({ idPago, idPrestamo, montoRecibido, fechaPago, idUsuario = null }, transaction) => {
  await actualizarMoraPrestamo(idPrestamo, fechaPago, transaction);

  let restante = roundMoney(montoRecibido);
  const aplicaciones = [];

  const cuotas = await sequelize.query(
    `SELECT c.*,
            COALESCE(pa.mora_pagada, 0) AS mora_pagada
     FROM cuotas c
     LEFT JOIN (
       SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
       FROM pago_aplicaciones
       GROUP BY id_cuota
     ) pa ON pa.id_cuota = c.id_cuota
     WHERE c.id_prestamo = :id_prestamo
     ORDER BY c.fecha_vencimiento, c.numero_cuota`,
    {
      replacements: { id_prestamo: idPrestamo },
      type: QueryTypes.SELECT,
      transaction
    }
  );

  for (const cuota of cuotas) {
    if (restante <= MONEY_EPSILON) break;

    let capitalPagado = toNumber(cuota.capital_pagado);
    let interesPagado = toNumber(cuota.interes_pagado);
    const conceptos = [
      {
        aplicadoA: 'MORA',
        pendiente: Math.max(0, roundMoney(toNumber(cuota.mora_acumulada) - toNumber(cuota.mora_pagada))),
        apply: () => {}
      },
      {
        aplicadoA: 'INTERES',
        pendiente: Math.max(0, roundMoney(toNumber(cuota.interes_programado) - interesPagado)),
        apply: (monto) => { interesPagado = roundMoney(interesPagado + monto); }
      },
      {
        aplicadoA: 'CAPITAL',
        pendiente: Math.max(0, roundMoney(toNumber(cuota.capital_programado) - capitalPagado)),
        apply: (monto) => { capitalPagado = roundMoney(capitalPagado + monto); }
      }
    ];

    for (const concepto of conceptos) {
      if (restante <= MONEY_EPSILON || concepto.pendiente <= MONEY_EPSILON) continue;
      const aplicado = roundMoney(Math.min(restante, concepto.pendiente));
      concepto.apply(aplicado);
      restante = roundMoney(restante - aplicado);

      await createPagoAplicacion({
        idPago,
        idCuota: cuota.id_cuota,
        aplicadoA: concepto.aplicadoA,
        montoAplicado: aplicado
      }, transaction);

      aplicaciones.push({
        id_cuota: cuota.id_cuota,
        numero_cuota: cuota.numero_cuota,
        aplicado_a: concepto.aplicadoA,
        monto_aplicado: aplicado
      });
    }

    const moraPagadaFinal = toNumber(cuota.mora_pagada) +
      aplicaciones
        .filter((item) => item.id_cuota === cuota.id_cuota && item.aplicado_a === 'MORA')
        .reduce((sum, item) => sum + item.monto_aplicado, 0);

    const estado = roundMoney(
      toNumber(cuota.capital_programado) + toNumber(cuota.interes_programado) + toNumber(cuota.mora_acumulada) -
      capitalPagado - interesPagado - moraPagadaFinal
    ) <= MONEY_EPSILON
      ? 'cancelada'
      : daysBetween(cuota.fecha_vencimiento, fechaPago) > 0 ? 'vencida' : 'activa';

    await sequelize.query(sql.updateCuota, {
      replacements: {
        id: cuota.id_cuota,
        id_prestamo: null,
        numero_cuota: null,
        fecha_vencimiento: null,
        capital_programado: null,
        interes_programado: null,
        capital_pagado: capitalPagado,
        interes_pagado: interesPagado,
        mora_acumulada: null,
        estado
      },
      type: QueryTypes.UPDATE,
      transaction
    });
  }

  const pendientes = await sequelize.query(
    `SELECT COUNT(*) AS pendientes
     FROM cuotas c
     WHERE c.id_prestamo = :id_prestamo
       AND c.estado <> 'cancelada'`,
    {
      replacements: { id_prestamo: idPrestamo },
      type: QueryTypes.SELECT,
      transaction
    }
  );

  if (Number(pendientes[0]?.pendientes || 0) === 0) {
    await sequelize.query(sql.closePrestamo, {
      replacements: {
        id: idPrestamo,
        id_usuario_cierra: idUsuario
      },
      type: QueryTypes.UPDATE,
      transaction
    });
  }

  return {
    aplicaciones,
    monto_aplicado: roundMoney(toNumber(montoRecibido) - restante),
    saldo_no_aplicado: roundMoney(restante)
  };
};

const reversePagoApplications = async (idPago, fechaReferencia = todayDateOnly(), transaction) => {
  const aplicaciones = await sequelize.query(
    `SELECT pa.*, c.id_prestamo, c.capital_pagado, c.interes_pagado, c.fecha_vencimiento, c.estado,
            c.capital_programado, c.interes_programado, c.mora_acumulada,
            COALESCE(mora_pagada.total_mora_pagada, 0) AS mora_pagada_total
     FROM pago_aplicaciones pa
     INNER JOIN cuotas c ON c.id_cuota = pa.id_cuota
     LEFT JOIN (
       SELECT id_cuota, SUM(monto_aplicado) AS total_mora_pagada
       FROM pago_aplicaciones
       WHERE aplicado_a = 'MORA'
       GROUP BY id_cuota
     ) mora_pagada ON mora_pagada.id_cuota = c.id_cuota
     WHERE pa.id_pago = :id_pago`,
    {
      replacements: { id_pago: idPago },
      type: QueryTypes.SELECT,
      transaction
    }
  );

  const cuotas = new Map();
  for (const aplicacion of aplicaciones) {
    const actual = cuotas.get(aplicacion.id_cuota) || {
      ...aplicacion,
      capital_pagado_nuevo: toNumber(aplicacion.capital_pagado),
      interes_pagado_nuevo: toNumber(aplicacion.interes_pagado),
      mora_reversada: 0
    };

    if (aplicacion.aplicado_a === 'CAPITAL') {
      actual.capital_pagado_nuevo = Math.max(0, roundMoney(actual.capital_pagado_nuevo - toNumber(aplicacion.monto_aplicado)));
    }

    if (aplicacion.aplicado_a === 'INTERES') {
      actual.interes_pagado_nuevo = Math.max(0, roundMoney(actual.interes_pagado_nuevo - toNumber(aplicacion.monto_aplicado)));
    }

    if (aplicacion.aplicado_a === 'MORA') {
      actual.mora_reversada = roundMoney(actual.mora_reversada + toNumber(aplicacion.monto_aplicado));
    }

    cuotas.set(aplicacion.id_cuota, actual);
  }

  await sequelize.query(
    `DELETE FROM pago_aplicaciones
     WHERE id_pago = :id_pago`,
    {
      replacements: { id_pago: idPago },
      type: QueryTypes.DELETE,
      transaction
    }
  );

  for (const cuota of cuotas.values()) {
    const moraPagadaDespues = Math.max(0, roundMoney(toNumber(cuota.mora_pagada_total) - toNumber(cuota.mora_reversada)));
    const estado = roundMoney(
      toNumber(cuota.capital_programado) + toNumber(cuota.interes_programado) + toNumber(cuota.mora_acumulada) -
      cuota.capital_pagado_nuevo - cuota.interes_pagado_nuevo - moraPagadaDespues
    ) <= MONEY_EPSILON
      ? 'cancelada'
      : daysBetween(cuota.fecha_vencimiento, fechaReferencia) > 0 ? 'vencida' : 'activa';

    await sequelize.query(sql.updateCuota, {
      replacements: {
        id: cuota.id_cuota,
        id_prestamo: null,
        numero_cuota: null,
        fecha_vencimiento: null,
        capital_programado: null,
        interes_programado: null,
        capital_pagado: cuota.capital_pagado_nuevo,
        interes_pagado: cuota.interes_pagado_nuevo,
        mora_acumulada: null,
        estado
      },
      type: QueryTypes.UPDATE,
      transaction
    });
  }

  return aplicaciones;
};

module.exports = {
  actualizarMoraPrestamo,
  actualizarMoraTodosLosPrestamos,
  applyPagoToCuotas,
  buildAmortizationSchedule,
  generateCuotasForPrestamo,
  reversePagoApplications,
  roundMoney
};

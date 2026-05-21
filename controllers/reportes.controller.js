const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const { todayDateOnly, isValidDateOnly } = require('../utils/dateValidation');
const { getScope } = require('../utils/accessControl');

const getDateRange = (query) => {
  const fechaDesde = query.fecha_desde || todayDateOnly();
  const fechaHasta = query.fecha_hasta || fechaDesde;

  if (!isValidDateOnly(fechaDesde) || !isValidDateOnly(fechaHasta)) {
    const error = new Error('Las fechas deben tener formato YYYY-MM-DD');
    error.statusCode = 400;
    throw error;
  }

  return { fechaDesde, fechaHasta };
};

const buildUserFilter = (scope, query, alias, column) => {
  if (!scope.isAdmin) {
    return {
      clause: `AND ${alias}.${column} = :scope_user_id`,
      replacements: { scope_user_id: scope.userId }
    };
  }

  if (query.id_usuario) {
    return {
      clause: `AND ${alias}.${column} = :filter_user_id`,
      replacements: { filter_user_id: Number(query.id_usuario) }
    };
  }

  return { clause: '', replacements: {} };
};

const buildCarteraFilter = (scope, alias = 'c') => {
  if (scope.isAdmin) return { clause: '', replacements: {} };
  if (!scope.carteraIds.length) return { clause: 'AND 1=0', replacements: {} };

  return {
    clause: `AND ${alias}.id_cartera IN (:scope_carteras)`,
    replacements: { scope_carteras: scope.carteraIds }
  };
};

const buildClienteFilter = (query, alias = 'c') => {
  if (!query.id_cliente) return { clause: '', replacements: {} };

  return {
    clause: `AND ${alias}.id_cliente = :id_cliente`,
    replacements: { id_cliente: Number(query.id_cliente) }
  };
};

exports.getDiario = async (req, res) => {
  try {
    const scope = await getScope(req.user);
    const { fechaDesde, fechaHasta } = getDateRange(req.query);
    const userFilter = buildUserFilter(scope, req.query, 'p', 'id_usuario_registro');
    const carteraFilter = buildCarteraFilter(scope, 'c');

    const pagos = await sequelize.query(
      `SELECT
         DATE(p.fecha_pago) AS fecha,
         p.id_usuario_registro AS id_usuario,
         CONCAT(COALESCE(u.nombre, 'Sin'), ' ', COALESCE(u.apellido, 'usuario')) AS usuario_nombre,
         COUNT(*) AS pagos,
         ROUND(SUM(p.monto_recibido), 2) AS total_recibido,
         ROUND(SUM(COALESCE(pa.capital_aplicado, 0)), 2) AS capital_aplicado,
         ROUND(SUM(COALESCE(pa.interes_aplicado, 0)), 2) AS interes_aplicado,
         ROUND(SUM(COALESCE(pa.mora_aplicada, 0)), 2) AS mora_aplicada
       FROM pagos p
       INNER JOIN prestamos pr ON pr.id_prestamo = p.id_prestamo
       INNER JOIN clientes c ON c.id_cliente = pr.id_cliente
       LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario_registro
       LEFT JOIN (
         SELECT
           id_pago,
           SUM(CASE WHEN aplicado_a = 'CAPITAL' THEN monto_aplicado ELSE 0 END) AS capital_aplicado,
           SUM(CASE WHEN aplicado_a = 'INTERES' THEN monto_aplicado ELSE 0 END) AS interes_aplicado,
           SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_aplicada
         FROM pago_aplicaciones
         GROUP BY id_pago
       ) pa ON pa.id_pago = p.id_pago
       WHERE DATE(p.fecha_pago) BETWEEN :fecha_desde AND :fecha_hasta
         ${userFilter.clause}
         ${carteraFilter.clause}
       GROUP BY DATE(p.fecha_pago), p.id_usuario_registro, usuario_nombre
       ORDER BY fecha DESC, usuario_nombre`,
      {
        replacements: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          ...userFilter.replacements,
          ...carteraFilter.replacements
        },
        type: QueryTypes.SELECT
      }
    );

    res.json(pagos);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Error al obtener reporte diario' });
  }
};

exports.getPagos = async (req, res) => {
  try {
    const scope = await getScope(req.user);
    const { fechaDesde, fechaHasta } = getDateRange(req.query);
    const userFilter = buildUserFilter(scope, req.query, 'p', 'id_usuario_registro');
    const carteraFilter = buildCarteraFilter(scope, 'c');

    const pagos = await sequelize.query(
      `SELECT
         p.id_pago,
         p.fecha_pago,
         p.id_prestamo,
         p.id_usuario_registro AS id_usuario,
         CONCAT(COALESCE(u.nombre, 'Sin'), ' ', COALESCE(u.apellido, 'usuario')) AS usuario_nombre,
         CONCAT(c.nombre, ' ', c.apellido) AS cliente_nombre,
         p.monto_recibido,
         p.metodo_pago,
         p.origen,
         ROUND(COALESCE(pa.capital_aplicado, 0), 2) AS capital_aplicado,
         ROUND(COALESCE(pa.interes_aplicado, 0), 2) AS interes_aplicado,
         ROUND(COALESCE(pa.mora_aplicada, 0), 2) AS mora_aplicada
       FROM pagos p
       INNER JOIN prestamos pr ON pr.id_prestamo = p.id_prestamo
       INNER JOIN clientes c ON c.id_cliente = pr.id_cliente
       LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario_registro
       LEFT JOIN (
         SELECT
           id_pago,
           SUM(CASE WHEN aplicado_a = 'CAPITAL' THEN monto_aplicado ELSE 0 END) AS capital_aplicado,
           SUM(CASE WHEN aplicado_a = 'INTERES' THEN monto_aplicado ELSE 0 END) AS interes_aplicado,
           SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_aplicada
         FROM pago_aplicaciones
         GROUP BY id_pago
       ) pa ON pa.id_pago = p.id_pago
       WHERE DATE(p.fecha_pago) BETWEEN :fecha_desde AND :fecha_hasta
         ${userFilter.clause}
         ${carteraFilter.clause}
       ORDER BY p.fecha_pago DESC, p.id_pago DESC`,
      {
        replacements: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          ...userFilter.replacements,
          ...carteraFilter.replacements
        },
        type: QueryTypes.SELECT
      }
    );

    res.json(pagos);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Error al obtener reporte de pagos' });
  }
};

exports.getPrestamosCerrados = async (req, res) => {
  try {
    const scope = await getScope(req.user);
    const { fechaDesde, fechaHasta } = getDateRange(req.query);
    const userFilter = buildUserFilter(scope, req.query, 'pr', 'id_usuario_cierra');
    const carteraFilter = buildCarteraFilter(scope, 'c');

    const prestamos = await sequelize.query(
      `SELECT
         pr.id_prestamo,
         pr.id_cliente,
         CONCAT(c.nombre, ' ', c.apellido) AS cliente_nombre,
         pr.monto,
         pr.fecha_inicio,
         pr.fecha_cierre,
         pr.id_usuario_cierra AS id_usuario,
         CONCAT(COALESCE(u.nombre, 'Sin'), ' ', COALESCE(u.apellido, 'usuario')) AS usuario_nombre,
         COUNT(p.id_pago) AS pagos,
         ROUND(COALESCE(SUM(p.monto_recibido), 0), 2) AS total_pagado
       FROM prestamos pr
       INNER JOIN clientes c ON c.id_cliente = pr.id_cliente
       LEFT JOIN usuarios u ON u.id_usuario = pr.id_usuario_cierra
       LEFT JOIN pagos p ON p.id_prestamo = pr.id_prestamo
       WHERE pr.estado = 'cancelado'
         AND DATE(pr.fecha_cierre) BETWEEN :fecha_desde AND :fecha_hasta
         ${userFilter.clause}
         ${carteraFilter.clause}
       GROUP BY pr.id_prestamo, pr.id_cliente, cliente_nombre, pr.monto, pr.fecha_inicio,
                pr.fecha_cierre, pr.id_usuario_cierra, usuario_nombre
       ORDER BY pr.fecha_cierre DESC, pr.id_prestamo DESC`,
      {
        replacements: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          ...userFilter.replacements,
          ...carteraFilter.replacements
        },
        type: QueryTypes.SELECT
      }
    );

    res.json(prestamos);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Error al obtener reporte de prestamos cerrados' });
  }
};

exports.getHistorialCliente = async (req, res) => {
  try {
    const scope = await getScope(req.user);
    const { fechaDesde, fechaHasta } = getDateRange(req.query);
    const userFilter = buildUserFilter(scope, req.query, 'p', 'id_usuario_registro');
    const carteraFilter = buildCarteraFilter(scope, 'c');
    const clienteFilter = buildClienteFilter(req.query, 'c');

    const pagos = await sequelize.query(
      `SELECT
         p.id_pago,
         p.fecha_pago,
         p.id_prestamo,
         pr.id_cliente,
         CONCAT(c.nombre, ' ', c.apellido) AS cliente_nombre,
         p.id_usuario_registro AS id_usuario,
         CONCAT(COALESCE(u.nombre, 'Sin'), ' ', COALESCE(u.apellido, 'usuario')) AS usuario_nombre,
         p.monto_recibido,
         p.metodo_pago,
         p.origen,
         p.observaciones,
         ROUND(COALESCE(pa.capital_aplicado, 0), 2) AS capital_aplicado,
         ROUND(COALESCE(pa.interes_aplicado, 0), 2) AS interes_aplicado,
         ROUND(COALESCE(pa.mora_aplicada, 0), 2) AS mora_aplicada,
         ROUND(COALESCE(pa.total_aplicado, 0), 2) AS total_aplicado,
         ROUND(p.monto_recibido - COALESCE(pa.total_aplicado, 0), 2) AS saldo_no_aplicado,
         COALESCE(pa.cuotas, '') AS cuotas
       FROM pagos p
       INNER JOIN prestamos pr ON pr.id_prestamo = p.id_prestamo
       INNER JOIN clientes c ON c.id_cliente = pr.id_cliente
       LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario_registro
       LEFT JOIN (
         SELECT
           apa.id_pago,
           SUM(CASE WHEN apa.aplicado_a = 'CAPITAL' THEN apa.monto_aplicado ELSE 0 END) AS capital_aplicado,
           SUM(CASE WHEN apa.aplicado_a = 'INTERES' THEN apa.monto_aplicado ELSE 0 END) AS interes_aplicado,
           SUM(CASE WHEN apa.aplicado_a = 'MORA' THEN apa.monto_aplicado ELSE 0 END) AS mora_aplicada,
           SUM(apa.monto_aplicado) AS total_aplicado,
           GROUP_CONCAT(DISTINCT cu.numero_cuota ORDER BY cu.numero_cuota SEPARATOR ', ') AS cuotas
         FROM pago_aplicaciones apa
         LEFT JOIN cuotas cu ON cu.id_cuota = apa.id_cuota
         GROUP BY apa.id_pago
       ) pa ON pa.id_pago = p.id_pago
       WHERE DATE(p.fecha_pago) BETWEEN :fecha_desde AND :fecha_hasta
         ${clienteFilter.clause}
         ${userFilter.clause}
         ${carteraFilter.clause}
       ORDER BY cliente_nombre, p.fecha_pago DESC, p.id_pago DESC`,
      {
        replacements: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          ...clienteFilter.replacements,
          ...userFilter.replacements,
          ...carteraFilter.replacements
        },
        type: QueryTypes.SELECT
      }
    );

    res.json(pagos);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Error al obtener historial de pagos por cliente' });
  }
};

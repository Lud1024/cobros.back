-- sql/pagos.sql

-- name: listPagos
SELECT *
FROM pagos;

-- name: listPagosScoped
SELECT *
FROM pagos
WHERE id_usuario_registro = :id_usuario_registro;

-- name: getPagoById
SELECT *
FROM pagos
WHERE id_pago = :id;

-- name: getPagoByIdScoped
SELECT *
FROM pagos
WHERE id_pago = :id
  AND id_usuario_registro = :id_usuario_registro;

-- name: getPagosByPrestamo
SELECT *
FROM pagos
WHERE id_prestamo = :id_prestamo;

-- name: getPagosByPrestamoScoped
SELECT *
FROM pagos
WHERE id_prestamo = :id_prestamo
  AND id_usuario_registro = :id_usuario_registro;

-- name: getPagosByCliente
SELECT
  p.*,
  pr.id_cliente,
  pr.monto AS monto_prestamo,
  pr.estado AS estado_prestamo,
  CONCAT(c.nombre, ' ', c.apellido) AS cliente_nombre,
  ROUND(COALESCE(pa.capital_aplicado, 0), 2) AS capital_aplicado,
  ROUND(COALESCE(pa.interes_aplicado, 0), 2) AS interes_aplicado,
  ROUND(COALESCE(pa.mora_aplicada, 0), 2) AS mora_aplicada,
  ROUND(COALESCE(pa.total_aplicado, 0), 2) AS total_aplicado,
  ROUND(p.monto_recibido - COALESCE(pa.total_aplicado, 0), 2) AS saldo_no_aplicado
FROM pagos p
INNER JOIN prestamos pr ON pr.id_prestamo = p.id_prestamo
INNER JOIN clientes c ON c.id_cliente = pr.id_cliente
LEFT JOIN (
  SELECT
    id_pago,
    SUM(CASE WHEN aplicado_a = 'CAPITAL' THEN monto_aplicado ELSE 0 END) AS capital_aplicado,
    SUM(CASE WHEN aplicado_a = 'INTERES' THEN monto_aplicado ELSE 0 END) AS interes_aplicado,
    SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_aplicada,
    SUM(monto_aplicado) AS total_aplicado
  FROM pago_aplicaciones
  GROUP BY id_pago
) pa ON pa.id_pago = p.id_pago
WHERE pr.id_cliente = :id_cliente
ORDER BY p.fecha_pago DESC, p.id_pago DESC;

-- name: getPagosByClienteScoped
SELECT
  p.*,
  pr.id_cliente,
  pr.monto AS monto_prestamo,
  pr.estado AS estado_prestamo,
  CONCAT(c.nombre, ' ', c.apellido) AS cliente_nombre,
  ROUND(COALESCE(pa.capital_aplicado, 0), 2) AS capital_aplicado,
  ROUND(COALESCE(pa.interes_aplicado, 0), 2) AS interes_aplicado,
  ROUND(COALESCE(pa.mora_aplicada, 0), 2) AS mora_aplicada,
  ROUND(COALESCE(pa.total_aplicado, 0), 2) AS total_aplicado,
  ROUND(p.monto_recibido - COALESCE(pa.total_aplicado, 0), 2) AS saldo_no_aplicado
FROM pagos p
INNER JOIN prestamos pr ON pr.id_prestamo = p.id_prestamo
INNER JOIN clientes c ON c.id_cliente = pr.id_cliente
LEFT JOIN (
  SELECT
    id_pago,
    SUM(CASE WHEN aplicado_a = 'CAPITAL' THEN monto_aplicado ELSE 0 END) AS capital_aplicado,
    SUM(CASE WHEN aplicado_a = 'INTERES' THEN monto_aplicado ELSE 0 END) AS interes_aplicado,
    SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_aplicada,
    SUM(monto_aplicado) AS total_aplicado
  FROM pago_aplicaciones
  GROUP BY id_pago
) pa ON pa.id_pago = p.id_pago
WHERE pr.id_cliente = :id_cliente
  AND c.id_cartera IN (:id_carteras)
  AND p.id_usuario_registro = :id_usuario_registro
ORDER BY p.fecha_pago DESC, p.id_pago DESC;

-- name: createPago
INSERT INTO pagos (
  id_prestamo,
  id_usuario_registro,
  fecha_pago,
  monto_recibido,
  metodo_pago,
  origen,
  observaciones
)
VALUES (
  :id_prestamo,
  :id_usuario_registro,
  :fecha_pago,
  :monto_recibido,
  :metodo_pago,
  :origen,
  :observaciones
);

-- name: updatePago
UPDATE pagos
SET
  id_prestamo    = COALESCE(:id_prestamo, id_prestamo),
  fecha_pago     = COALESCE(:fecha_pago, fecha_pago),
  monto_recibido = COALESCE(:monto_recibido, monto_recibido),
  metodo_pago    = COALESCE(:metodo_pago, metodo_pago),
  origen         = COALESCE(:origen, origen),
  observaciones  = COALESCE(:observaciones, observaciones)
WHERE id_pago = :id;

-- name: deletePago
DELETE
FROM pagos
WHERE id_pago = :id;

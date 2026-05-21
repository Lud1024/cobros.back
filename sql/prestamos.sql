-- sql/prestamos.sql

-- name: listPrestamos
SELECT 
  id_prestamo,
  id_cliente,
  id_usuario_crea,
  monto,
  monto AS monto_prestamo,
  tasa_interes_anual,
  tasa_interes_anual AS tasa_interes,
  id_periodicidad,
  plazo_cuotas,
  plazo_cuotas AS plazo_meses,
  fecha_inicio,
  fecha_inicio AS fecha_desembolso,
  dia_pago,
  estado,
  id_usuario_cierra,
  fecha_cierre,
  fecha_crea
FROM prestamos;

-- name: listPrestamosScoped
SELECT 
  p.id_prestamo,
  p.id_cliente,
  p.id_usuario_crea,
  p.monto,
  p.monto AS monto_prestamo,
  p.tasa_interes_anual,
  p.tasa_interes_anual AS tasa_interes,
  p.id_periodicidad,
  p.plazo_cuotas,
  p.plazo_cuotas AS plazo_meses,
  p.fecha_inicio,
  p.fecha_inicio AS fecha_desembolso,
  p.dia_pago,
  p.estado,
  p.id_usuario_cierra,
  p.fecha_cierre,
  p.fecha_crea
FROM prestamos p
INNER JOIN clientes c ON c.id_cliente = p.id_cliente
WHERE c.id_cartera IN (:id_carteras);

-- name: getPrestamoById
SELECT 
  id_prestamo,
  id_cliente,
  id_usuario_crea,
  monto,
  monto AS monto_prestamo,
  tasa_interes_anual,
  tasa_interes_anual AS tasa_interes,
  id_periodicidad,
  plazo_cuotas,
  plazo_cuotas AS plazo_meses,
  fecha_inicio,
  fecha_inicio AS fecha_desembolso,
  dia_pago,
  estado,
  id_usuario_cierra,
  fecha_cierre,
  fecha_crea
FROM prestamos
WHERE id_prestamo = :id;

-- name: getPrestamoByIdScoped
SELECT 
  p.id_prestamo,
  p.id_cliente,
  p.id_usuario_crea,
  p.monto,
  p.monto AS monto_prestamo,
  p.tasa_interes_anual,
  p.tasa_interes_anual AS tasa_interes,
  p.id_periodicidad,
  p.plazo_cuotas,
  p.plazo_cuotas AS plazo_meses,
  p.fecha_inicio,
  p.fecha_inicio AS fecha_desembolso,
  p.dia_pago,
  p.estado,
  p.id_usuario_cierra,
  p.fecha_cierre,
  p.fecha_crea
FROM prestamos p
INNER JOIN clientes c ON c.id_cliente = p.id_cliente
WHERE p.id_prestamo = :id
  AND c.id_cartera IN (:id_carteras);

-- name: getPrestamosByCliente
SELECT 
  id_prestamo,
  id_cliente,
  id_usuario_crea,
  monto,
  monto AS monto_prestamo,
  tasa_interes_anual,
  tasa_interes_anual AS tasa_interes,
  id_periodicidad,
  plazo_cuotas,
  plazo_cuotas AS plazo_meses,
  fecha_inicio,
  fecha_inicio AS fecha_desembolso,
  dia_pago,
  estado,
  id_usuario_cierra,
  fecha_cierre,
  fecha_crea
FROM prestamos
WHERE id_cliente = :id_cliente;

-- name: getPrestamosByClienteScoped
SELECT 
  p.id_prestamo,
  p.id_cliente,
  p.id_usuario_crea,
  p.monto,
  p.monto AS monto_prestamo,
  p.tasa_interes_anual,
  p.tasa_interes_anual AS tasa_interes,
  p.id_periodicidad,
  p.plazo_cuotas,
  p.plazo_cuotas AS plazo_meses,
  p.fecha_inicio,
  p.fecha_inicio AS fecha_desembolso,
  p.dia_pago,
  p.estado,
  p.id_usuario_cierra,
  p.fecha_cierre,
  p.fecha_crea
FROM prestamos p
INNER JOIN clientes c ON c.id_cliente = p.id_cliente
WHERE p.id_cliente = :id_cliente
  AND c.id_cartera IN (:id_carteras);

-- name: createPrestamo
INSERT INTO prestamos (
  id_cliente,
  id_usuario_crea,
  monto,
  tasa_interes_anual,
  id_periodicidad,
  plazo_cuotas,
  fecha_inicio,
  dia_pago,
  estado
)
VALUES (
  :id_cliente,
  :id_usuario_crea,
  :monto,
  :tasa_interes_anual,
  :id_periodicidad,
  :plazo_cuotas,
  :fecha_inicio,
  :dia_pago,
  'activo'
);

-- name: updatePrestamo
UPDATE prestamos
SET
  id_cliente         = COALESCE(:id_cliente, id_cliente),
  monto              = COALESCE(:monto, monto),
  tasa_interes_anual = COALESCE(:tasa_interes_anual, tasa_interes_anual),
  id_periodicidad    = COALESCE(:id_periodicidad, id_periodicidad),
  plazo_cuotas       = COALESCE(:plazo_cuotas, plazo_cuotas),
  fecha_inicio       = COALESCE(:fecha_inicio, fecha_inicio),
  dia_pago           = COALESCE(:dia_pago, dia_pago),
  estado             = COALESCE(:estado, estado)
WHERE id_prestamo = :id;

-- name: deletePrestamo
DELETE
FROM prestamos
WHERE id_prestamo = :id;

-- name: closePrestamo
UPDATE prestamos
SET
  estado = 'cancelado',
  id_usuario_cierra = COALESCE(:id_usuario_cierra, id_usuario_cierra),
  fecha_cierre = COALESCE(fecha_cierre, NOW())
WHERE id_prestamo = :id;

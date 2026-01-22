-- sql/prestamos.sql

-- name: listPrestamos
SELECT 
  id_prestamo,
  id_cliente,
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
  fecha_crea
FROM prestamos;

-- name: getPrestamoById
SELECT 
  id_prestamo,
  id_cliente,
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
  fecha_crea
FROM prestamos
WHERE id_prestamo = :id;

-- name: getPrestamosByCliente
SELECT 
  id_prestamo,
  id_cliente,
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
  fecha_crea
FROM prestamos
WHERE id_cliente = :id_cliente;

-- name: createPrestamo
INSERT INTO prestamos (
  id_cliente,
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
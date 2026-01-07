-- sql/prestamos.sql

-- name: listPrestamos
SELECT *
FROM prestamos;

-- name: getPrestamoById
SELECT *
FROM prestamos
WHERE id_prestamo = :id;

-- name: getPrestamosByCliente
SELECT *
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
  id_cliente         = :id_cliente,
  monto              = :monto,
  tasa_interes_anual = :tasa_interes_anual,
  id_periodicidad    = :id_periodicidad,
  plazo_cuotas       = :plazo_cuotas,
  fecha_inicio       = :fecha_inicio,
  dia_pago           = :dia_pago,
  estado             = :estado
WHERE id_prestamo = :id;

-- name: deletePrestamo
DELETE
FROM prestamos
WHERE id_prestamo = :id;
-- sql/pagos.sql

-- name: listPagos
SELECT *
FROM pagos;

-- name: getPagoById
SELECT *
FROM pagos
WHERE id_pago = :id;

-- name: getPagosByPrestamo
SELECT *
FROM pagos
WHERE id_prestamo = :id_prestamo;

-- name: createPago
INSERT INTO pagos (
  id_prestamo,
  fecha_pago,
  monto_recibido,
  metodo_pago,
  origen,
  observaciones
)
VALUES (
  :id_prestamo,
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
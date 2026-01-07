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
  id_prestamo    = :id_prestamo,
  fecha_pago     = :fecha_pago,
  monto_recibido = :monto_recibido,
  metodo_pago    = :metodo_pago,
  origen         = :origen,
  observaciones  = :observaciones
WHERE id_pago = :id;

-- name: updateNumeroRecibo
UPDATE pagos
SET numero_recibo = :numero_recibo
WHERE id_pago = :id;

-- name: deletePago
DELETE
FROM pagos
WHERE id_pago = :id;
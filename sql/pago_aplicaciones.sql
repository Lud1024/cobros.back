-- sql/pago_aplicaciones.sql

-- name: listPagoAplicaciones
SELECT *
FROM pago_aplicaciones;

-- name: getPagoAplicacionById
SELECT *
FROM pago_aplicaciones
WHERE id_pago = :id_pago AND id_cuota = :id_cuota AND aplicado_a = :aplicado_a;

-- name: getAplicacionesByPago
SELECT *
FROM pago_aplicaciones
WHERE id_pago = :id_pago;

-- name: getAplicacionesByCuota
SELECT *
FROM pago_aplicaciones
WHERE id_cuota = :id_cuota;

-- name: getAplicacionesByConcepto
SELECT *
FROM pago_aplicaciones
WHERE aplicado_a = :aplicado_a;

-- name: createPagoAplicacion
INSERT INTO pago_aplicaciones (
  id_pago,
  id_cuota,
  aplicado_a,
  monto_aplicado
)
VALUES (
  :id_pago,
  :id_cuota,
  :aplicado_a,
  :monto_aplicado
);

-- name: updatePagoAplicacion
UPDATE pago_aplicaciones
SET
  monto_aplicado = :monto_aplicado
WHERE id_pago = :id_pago AND id_cuota = :id_cuota AND aplicado_a = :aplicado_a;

-- name: deletePagoAplicacion
DELETE
FROM pago_aplicaciones
WHERE id_pago = :id_pago AND id_cuota = :id_cuota AND aplicado_a = :aplicado_a;
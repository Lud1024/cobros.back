-- sql/verificaciones_prestamo.sql

-- name: listVerificacionesPrestamo
SELECT *
FROM verificaciones_prestamo;

-- name: getVerificacionPrestamoById
SELECT *
FROM verificaciones_prestamo
WHERE id_verificacion = :id;

-- name: getVerificacionesByCliente
SELECT *
FROM verificaciones_prestamo
WHERE id_cliente = :id_cliente;

-- name: getVerificacionesByEstado
SELECT *
FROM verificaciones_prestamo
WHERE estado = :estado;

-- name: getVerificacionesByAnalista
SELECT *
FROM verificaciones_prestamo
WHERE analista = :analista;

-- name: createVerificacionPrestamo
INSERT INTO verificaciones_prestamo (
  id_cliente,
  fecha_solicitud,
  monto_solicitado,
  estado,
  analista,
  comentarios
)
VALUES (
  :id_cliente,
  :fecha_solicitud,
  :monto_solicitado,
  :estado,
  :analista,
  :comentarios
);

-- name: updateVerificacionPrestamo
UPDATE verificaciones_prestamo
SET
  id_cliente       = :id_cliente,
  fecha_solicitud  = :fecha_solicitud,
  monto_solicitado = :monto_solicitado,
  estado           = :estado,
  analista         = :analista,
  comentarios      = :comentarios
WHERE id_verificacion = :id;

-- name: deleteVerificacionPrestamo
DELETE
FROM verificaciones_prestamo
WHERE id_verificacion = :id;
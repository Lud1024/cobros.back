-- sql/prestamo_garantia.sql

-- name: listPrestamoGarantia
SELECT *
FROM prestamo_garantia;

-- name: getPrestamoGarantiaById
SELECT *
FROM prestamo_garantia
WHERE id_prestamo = :id_prestamo AND id_metodo = :id_metodo;

-- name: getGarantiasByPrestamo
SELECT *
FROM prestamo_garantia
WHERE id_prestamo = :id_prestamo;

-- name: getPrestamosByGarantia
SELECT *
FROM prestamo_garantia
WHERE id_metodo = :id_metodo;

-- name: createPrestamoGarantia
INSERT INTO prestamo_garantia (
  id_prestamo,
  id_metodo,
  valor_garantia
)
VALUES (
  :id_prestamo,
  :id_metodo,
  :valor_garantia
);

-- name: updatePrestamoGarantia
UPDATE prestamo_garantia
SET
  valor_garantia = :valor_garantia
WHERE id_prestamo = :id_prestamo AND id_metodo = :id_metodo;

-- name: deletePrestamoGarantia
DELETE
FROM prestamo_garantia
WHERE id_prestamo = :id_prestamo AND id_metodo = :id_metodo;
-- sql/periodicidades.sql

-- name: listPeriodicidades
SELECT *
FROM periodicidades;

-- name: getPeriodicidadById
SELECT *
FROM periodicidades
WHERE id_periodicidad = :id;

-- name: getPeriodicidadByCodigo
SELECT *
FROM periodicidades
WHERE codigo = :codigo;

-- name: createPeriodicidad
INSERT INTO periodicidades (
  codigo,
  dias
)
VALUES (
  :codigo,
  :dias
);

-- name: updatePeriodicidad
UPDATE periodicidades
SET
  codigo = :codigo,
  dias   = :dias
WHERE id_periodicidad = :id;

-- name: deletePeriodicidad
DELETE
FROM periodicidades
WHERE id_periodicidad = :id;
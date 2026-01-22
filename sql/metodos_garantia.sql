-- sql/metodos_garantia.sql

-- name: listMetodosGarantia
SELECT *
FROM metodos_garantia;

-- name: getMetodoGarantiaById
SELECT *
FROM metodos_garantia
WHERE id_metodo = :id;

-- name: getMetodoGarantiaByNombre
SELECT *
FROM metodos_garantia
WHERE nombre_metodo = :nombre_metodo;

-- name: createMetodoGarantia
INSERT INTO metodos_garantia (
  nombre_metodo,
  descripcion
)
VALUES (
  :nombre_metodo,
  :descripcion
);

-- name: updateMetodoGarantia
UPDATE metodos_garantia
SET
  nombre_metodo = COALESCE(:nombre_metodo, nombre_metodo),
  descripcion   = COALESCE(:descripcion, descripcion)
WHERE id_metodo = :id;

-- name: deleteMetodoGarantia
DELETE
FROM metodos_garantia
WHERE id_metodo = :id;
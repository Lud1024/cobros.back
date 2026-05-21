-- sql/carteras.sql

-- name: listCarteras
SELECT *
FROM carteras;

-- name: listCarterasScoped
SELECT *
FROM carteras
WHERE id_cartera IN (:id_carteras);

-- name: getCarteraById
SELECT *
FROM carteras
WHERE id_cartera = :id;

-- name: getCarteraByIdScoped
SELECT *
FROM carteras
WHERE id_cartera = :id
  AND id_cartera IN (:id_carteras);

-- name: getCarteraByNombre
SELECT *
FROM carteras
WHERE nombre = :nombre;

-- name: createCartera
INSERT INTO carteras (
  nombre,
  descripcion
)
VALUES (
  :nombre,
  :descripcion
);

-- name: updateCartera
UPDATE carteras
SET
  nombre      = COALESCE(:nombre, nombre),
  descripcion = COALESCE(:descripcion, descripcion)
WHERE id_cartera = :id;

-- name: deleteCartera
DELETE
FROM carteras
WHERE id_cartera = :id;

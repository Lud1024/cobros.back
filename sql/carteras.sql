-- sql/carteras.sql

-- name: listCarteras
SELECT *
FROM carteras;

-- name: getCarteraById
SELECT *
FROM carteras
WHERE id_cartera = :id;

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
  nombre      = :nombre,
  descripcion = :descripcion
WHERE id_cartera = :id;

-- name: deleteCartera
DELETE
FROM carteras
WHERE id_cartera = :id;
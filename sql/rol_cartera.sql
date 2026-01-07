-- sql/rol_cartera.sql

-- name: listRolCartera
SELECT *
FROM rol_cartera;

-- name: getRolCarteraById
SELECT *
FROM rol_cartera
WHERE id_rol = :id_rol AND id_cartera = :id_cartera;

-- name: getCarterasByRol
SELECT *
FROM rol_cartera
WHERE id_rol = :id_rol;

-- name: getRolesByCartera
SELECT *
FROM rol_cartera
WHERE id_cartera = :id_cartera;

-- name: createRolCartera
INSERT INTO rol_cartera (
  id_rol,
  id_cartera
)
VALUES (
  :id_rol,
  :id_cartera
);

-- name: deleteRolCartera
DELETE
FROM rol_cartera
WHERE id_rol = :id_rol AND id_cartera = :id_cartera;
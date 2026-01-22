-- sql/roles.sql

-- name: listRoles
SELECT *
FROM roles;

-- name: getRolById
SELECT *
FROM roles
WHERE id_rol = :id;

-- name: getRolByNombre
SELECT *
FROM roles
WHERE nombre_rol = :nombre_rol;

-- name: createRol
INSERT INTO roles (
  nombre_rol,
  permisos
)
VALUES (
  :nombre_rol,
  :permisos
);

-- name: updateRol
UPDATE roles
SET
  nombre_rol = COALESCE(:nombre_rol, nombre_rol),
  permisos   = COALESCE(:permisos, permisos)
WHERE id_rol = :id;

-- name: deleteRol
DELETE
FROM roles
WHERE id_rol = :id;
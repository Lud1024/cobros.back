-- sql/usuario_roles.sql

-- name: listUsuarioRoles
SELECT *
FROM usuario_roles;

-- name: getUsuarioRolById
SELECT *
FROM usuario_roles
WHERE id_usuario = :id_usuario AND id_rol = :id_rol AND id_cartera = :id_cartera;

-- name: getRolesByUsuario
SELECT *
FROM usuario_roles
WHERE id_usuario = :id_usuario;

-- name: getUsuariosByRol
SELECT *
FROM usuario_roles
WHERE id_rol = :id_rol;

-- name: getUsuariosByCartera
SELECT *
FROM usuario_roles
WHERE id_cartera = :id_cartera;

-- name: getRolesByUsuarioCartera
SELECT *
FROM usuario_roles
WHERE id_usuario = :id_usuario AND id_cartera = :id_cartera;

-- name: createUsuarioRol
INSERT INTO usuario_roles (
  id_usuario,
  id_rol,
  id_cartera
)
VALUES (
  :id_usuario,
  :id_rol,
  :id_cartera
);

-- name: deleteUsuarioRol
DELETE
FROM usuario_roles
WHERE id_usuario = :id_usuario AND id_rol = :id_rol AND id_cartera = :id_cartera;
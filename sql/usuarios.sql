-- sql/usuarios.sql

-- name: listUsuarios
SELECT *
FROM usuarios;

-- name: getUsuarioById
SELECT *
FROM usuarios
WHERE id_usuario = :id;

-- name: getUsuarioByUsuario
SELECT *
FROM usuarios
WHERE usuario = :usuario;

-- name: createUsuario
INSERT INTO usuarios (
  usuario,
  password_hash,
  nombre,
  apellido,
  correo,
  telefono,
  estado
)
VALUES (
  :usuario,
  :password_hash,
  :nombre,
  :apellido,
  :correo,
  :telefono,
  'A'
);

-- name: updateUsuario
UPDATE usuarios
SET
  usuario       = COALESCE(:usuario, usuario),
  password_hash = COALESCE(:password_hash, password_hash),
  nombre        = COALESCE(:nombre, nombre),
  apellido      = COALESCE(:apellido, apellido),
  correo        = COALESCE(:correo, correo),
  telefono      = COALESCE(:telefono, telefono),
  estado        = COALESCE(:estado, estado)
WHERE id_usuario = :id;

-- name: deleteUsuario
DELETE
FROM usuarios
WHERE id_usuario = :id;

-- name: confirmUsuario
UPDATE usuarios
SET estado = 'A'
WHERE id_usuario = :id;
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
  usuario       = :usuario,
  password_hash = :password_hash,
  nombre        = :nombre,
  apellido      = :apellido,
  correo        = :correo,
  telefono      = :telefono,
  estado        = :estado
WHERE id_usuario = :id;

-- name: deleteUsuario
DELETE
FROM usuarios
WHERE id_usuario = :id;

-- name: confirmUsuario
UPDATE usuarios
SET estado = 'A'
WHERE id_usuario = :id;
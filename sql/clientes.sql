-- sql/clientes.sql

-- name: listClientes
SELECT *
FROM clientes;

-- name: listClientesScoped
SELECT *
FROM clientes
WHERE id_cartera IN (:id_carteras);

-- name: getClienteById
SELECT *
FROM clientes
WHERE id_cliente = :id;

-- name: getClienteByIdScoped
SELECT *
FROM clientes
WHERE id_cliente = :id
  AND id_cartera IN (:id_carteras);

-- name: getClienteByDpi
SELECT *
FROM clientes
WHERE dpi = :dpi;

-- name: getClienteByNit
SELECT *
FROM clientes
WHERE nit = :nit;

-- name: createCliente
INSERT INTO clientes (
  id_cartera,
  id_usuario_crea,
  nombre,
  apellido,
  dpi,
  nit,
  direccion,
  telefono,
  correo,
  estado
)
VALUES (
  :id_cartera,
  :id_usuario_crea,
  :nombre,
  :apellido,
  :dpi,
  :nit,
  :direccion,
  :telefono,
  :correo,
  'A'
);

-- name: updateCliente
UPDATE clientes
SET
  id_cartera = COALESCE(:id_cartera, id_cartera),
  nombre     = COALESCE(:nombre, nombre),
  apellido   = COALESCE(:apellido, apellido),
  dpi        = COALESCE(:dpi, dpi),
  nit        = COALESCE(:nit, nit),
  direccion  = COALESCE(:direccion, direccion),
  telefono   = COALESCE(:telefono, telefono),
  correo     = COALESCE(:correo, correo),
  estado     = COALESCE(:estado, estado)
WHERE id_cliente = :id;

-- name: deleteCliente
DELETE
FROM clientes
WHERE id_cliente = :id;

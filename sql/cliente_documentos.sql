-- sql/cliente_documentos.sql

-- name: listClienteDocumentos
SELECT *
FROM cliente_documentos;

-- name: getClienteDocumentoById
SELECT *
FROM cliente_documentos
WHERE id_documento = :id;

-- name: getDocumentosByCliente
SELECT *
FROM cliente_documentos
WHERE id_cliente = :id_cliente;

-- name: getDocumentosByTipo
SELECT *
FROM cliente_documentos
WHERE tipo_documento = :tipo_documento;

-- name: createClienteDocumento
INSERT INTO cliente_documentos (
  id_cliente,
  tipo_documento,
  nombre_archivo,
  ruta_storage
)
VALUES (
  :id_cliente,
  :tipo_documento,
  :nombre_archivo,
  :ruta_storage
);

-- name: updateClienteDocumento
UPDATE cliente_documentos
SET
  id_cliente      = :id_cliente,
  tipo_documento  = :tipo_documento,
  nombre_archivo  = :nombre_archivo,
  ruta_storage    = :ruta_storage
WHERE id_documento = :id;

-- name: deleteClienteDocumento
DELETE
FROM cliente_documentos
WHERE id_documento = :id;
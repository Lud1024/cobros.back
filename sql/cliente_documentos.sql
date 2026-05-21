-- sql/cliente_documentos.sql

-- name: listClienteDocumentos
SELECT *
FROM cliente_documentos;

-- name: listClienteDocumentosScoped
SELECT d.*
FROM cliente_documentos d
INNER JOIN clientes c ON c.id_cliente = d.id_cliente
WHERE c.id_cartera IN (:id_carteras);

-- name: getClienteDocumentoById
SELECT *
FROM cliente_documentos
WHERE id_documento = :id;

-- name: getClienteDocumentoByIdScoped
SELECT d.*
FROM cliente_documentos d
INNER JOIN clientes c ON c.id_cliente = d.id_cliente
WHERE d.id_documento = :id
  AND c.id_cartera IN (:id_carteras);

-- name: getDocumentosByCliente
SELECT *
FROM cliente_documentos
WHERE id_cliente = :id_cliente;

-- name: getDocumentosByClienteScoped
SELECT d.*
FROM cliente_documentos d
INNER JOIN clientes c ON c.id_cliente = d.id_cliente
WHERE d.id_cliente = :id_cliente
  AND c.id_cartera IN (:id_carteras);

-- name: getDocumentosByTipo
SELECT *
FROM cliente_documentos
WHERE tipo_documento = :tipo_documento;

-- name: getDocumentosByTipoScoped
SELECT d.*
FROM cliente_documentos d
INNER JOIN clientes c ON c.id_cliente = d.id_cliente
WHERE d.tipo_documento = :tipo_documento
  AND c.id_cartera IN (:id_carteras);

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
  id_cliente      = COALESCE(:id_cliente, id_cliente),
  tipo_documento  = COALESCE(:tipo_documento, tipo_documento),
  nombre_archivo  = COALESCE(:nombre_archivo, nombre_archivo),
  ruta_storage    = COALESCE(:ruta_storage, ruta_storage)
WHERE id_documento = :id;

-- name: deleteClienteDocumento
DELETE
FROM cliente_documentos
WHERE id_documento = :id;

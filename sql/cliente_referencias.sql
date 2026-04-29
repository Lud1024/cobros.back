-- sql/cliente_referencias.sql

CREATE TABLE IF NOT EXISTS cliente_referencias (
  id_referencia INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  parentesco VARCHAR(60) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  dpi VARCHAR(13) NULL,
  direccion VARCHAR(255) NULL,
  lugar_trabajo VARCHAR(150) NULL,
  telefono_trabajo VARCHAR(20) NULL,
  observaciones TEXT NULL,
  estado ENUM('A', 'I') NOT NULL DEFAULT 'A',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cliente_referencias_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_cliente_referencias_cliente (id_cliente),
  INDEX idx_cliente_referencias_telefono (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- name: listClienteReferencias
SELECT
  cr.*,
  c.nombre AS cliente_nombre,
  c.apellido AS cliente_apellido,
  c.dpi AS cliente_dpi
FROM cliente_referencias cr
INNER JOIN clientes c ON c.id_cliente = cr.id_cliente
ORDER BY cr.id_referencia DESC;

-- name: getClienteReferenciaById
SELECT
  cr.*,
  c.nombre AS cliente_nombre,
  c.apellido AS cliente_apellido,
  c.dpi AS cliente_dpi
FROM cliente_referencias cr
INNER JOIN clientes c ON c.id_cliente = cr.id_cliente
WHERE cr.id_referencia = :id;

-- name: getReferenciasByCliente
SELECT
  cr.*,
  c.nombre AS cliente_nombre,
  c.apellido AS cliente_apellido,
  c.dpi AS cliente_dpi
FROM cliente_referencias cr
INNER JOIN clientes c ON c.id_cliente = cr.id_cliente
WHERE cr.id_cliente = :id_cliente
ORDER BY cr.id_referencia DESC;

-- name: createClienteReferencia
INSERT INTO cliente_referencias (
  id_cliente,
  nombre_completo,
  parentesco,
  telefono,
  dpi,
  direccion,
  lugar_trabajo,
  telefono_trabajo,
  observaciones,
  estado
)
VALUES (
  :id_cliente,
  :nombre_completo,
  :parentesco,
  :telefono,
  :dpi,
  :direccion,
  :lugar_trabajo,
  :telefono_trabajo,
  :observaciones,
  COALESCE(:estado, 'A')
);

-- name: updateClienteReferencia
UPDATE cliente_referencias
SET
  id_cliente        = COALESCE(:id_cliente, id_cliente),
  nombre_completo   = COALESCE(:nombre_completo, nombre_completo),
  parentesco        = COALESCE(:parentesco, parentesco),
  telefono          = COALESCE(:telefono, telefono),
  dpi               = :dpi,
  direccion         = :direccion,
  lugar_trabajo     = :lugar_trabajo,
  telefono_trabajo  = :telefono_trabajo,
  observaciones     = :observaciones,
  estado            = COALESCE(:estado, estado)
WHERE id_referencia = :id;

-- name: deleteClienteReferencia
DELETE
FROM cliente_referencias
WHERE id_referencia = :id;

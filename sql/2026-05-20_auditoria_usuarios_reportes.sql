-- Auditoria para segmentacion por usuario y reportes.
-- Ejecutar una vez en la base de datos antes de desplegar el backend.

ALTER TABLE clientes
  ADD COLUMN id_usuario_crea INT NULL AFTER id_cartera,
  ADD INDEX idx_clientes_usuario_crea (id_usuario_crea),
  ADD CONSTRAINT fk_clientes_usuario_crea
    FOREIGN KEY (id_usuario_crea) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE prestamos
  ADD COLUMN id_usuario_crea INT NULL AFTER id_cliente,
  ADD COLUMN id_usuario_cierra INT NULL AFTER estado,
  ADD COLUMN fecha_cierre DATETIME NULL AFTER id_usuario_cierra,
  ADD INDEX idx_prestamos_usuario_crea (id_usuario_crea),
  ADD INDEX idx_prestamos_usuario_cierra (id_usuario_cierra),
  ADD CONSTRAINT fk_prestamos_usuario_crea
    FOREIGN KEY (id_usuario_crea) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_prestamos_usuario_cierra
    FOREIGN KEY (id_usuario_cierra) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE pagos
  ADD COLUMN id_usuario_registro INT NULL AFTER id_prestamo,
  ADD INDEX idx_pagos_usuario_registro (id_usuario_registro),
  ADD CONSTRAINT fk_pagos_usuario_registro
    FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE visitas_cobro
  ADD COLUMN id_usuario_registro INT NULL AFTER id_prestamo,
  ADD INDEX idx_visitas_usuario_registro (id_usuario_registro),
  ADD CONSTRAINT fk_visitas_usuario_registro
    FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

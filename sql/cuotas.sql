-- sql/cuotas.sql

-- name: listCuotas
SELECT *
FROM cuotas;

-- name: getCuotaById
SELECT *
FROM cuotas
WHERE id_cuota = :id;

-- name: getCuotasByPrestamo
SELECT *
FROM cuotas
WHERE id_prestamo = :id_prestamo;

-- name: getCuotaByPrestamoNumero
SELECT *
FROM cuotas
WHERE id_prestamo = :id_prestamo AND numero_cuota = :numero_cuota;

-- name: createCuota
INSERT INTO cuotas (
  id_prestamo,
  numero_cuota,
  fecha_vencimiento,
  capital_programado,
  interes_programado,
  capital_pagado,
  interes_pagado,
  mora_acumulada,
  estado
)
VALUES (
  :id_prestamo,
  :numero_cuota,
  :fecha_vencimiento,
  :capital_programado,
  :interes_programado,
  :capital_pagado,
  :interes_pagado,
  :mora_acumulada,
  :estado
);

-- name: updateCuota
UPDATE cuotas
SET
  id_prestamo         = :id_prestamo,
  numero_cuota        = :numero_cuota,
  fecha_vencimiento   = :fecha_vencimiento,
  capital_programado  = :capital_programado,
  interes_programado  = :interes_programado,
  capital_pagado      = :capital_pagado,
  interes_pagado      = :interes_pagado,
  mora_acumulada      = :mora_acumulada,
  estado              = :estado
WHERE id_cuota = :id;

-- name: deleteCuota
DELETE
FROM cuotas
WHERE id_cuota = :id;
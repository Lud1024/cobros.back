-- sql/cuotas.sql

-- name: listCuotas
SELECT
  c.*,
  ROUND(c.capital_programado + c.interes_programado + c.mora_acumulada, 2) AS monto_cuota,
  ROUND(c.capital_pagado + c.interes_pagado + COALESCE(pa.mora_pagada, 0), 2) AS monto_pagado,
  ROUND(COALESCE(pa.mora_pagada, 0), 2) AS mora_pagada,
  ROUND(
    c.capital_programado + c.interes_programado + c.mora_acumulada -
    c.capital_pagado - c.interes_pagado - COALESCE(pa.mora_pagada, 0),
    2
  ) AS saldo_pendiente
FROM cuotas c
LEFT JOIN (
  SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
  FROM pago_aplicaciones
  GROUP BY id_cuota
) pa ON pa.id_cuota = c.id_cuota
WHERE c.estado <> 'cancelada';

-- name: listCuotasScoped
SELECT
  c.*,
  ROUND(c.capital_programado + c.interes_programado + c.mora_acumulada, 2) AS monto_cuota,
  ROUND(c.capital_pagado + c.interes_pagado + COALESCE(pa.mora_pagada, 0), 2) AS monto_pagado,
  ROUND(COALESCE(pa.mora_pagada, 0), 2) AS mora_pagada,
  ROUND(
    c.capital_programado + c.interes_programado + c.mora_acumulada -
    c.capital_pagado - c.interes_pagado - COALESCE(pa.mora_pagada, 0),
    2
  ) AS saldo_pendiente
FROM cuotas c
INNER JOIN prestamos p ON p.id_prestamo = c.id_prestamo
INNER JOIN clientes cl ON cl.id_cliente = p.id_cliente
LEFT JOIN (
  SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
  FROM pago_aplicaciones
  GROUP BY id_cuota
) pa ON pa.id_cuota = c.id_cuota
WHERE c.estado <> 'cancelada'
  AND cl.id_cartera IN (:id_carteras);

-- name: getCuotaById
SELECT
  c.*,
  ROUND(c.capital_programado + c.interes_programado + c.mora_acumulada, 2) AS monto_cuota,
  ROUND(c.capital_pagado + c.interes_pagado + COALESCE(pa.mora_pagada, 0), 2) AS monto_pagado,
  ROUND(COALESCE(pa.mora_pagada, 0), 2) AS mora_pagada,
  ROUND(
    c.capital_programado + c.interes_programado + c.mora_acumulada -
    c.capital_pagado - c.interes_pagado - COALESCE(pa.mora_pagada, 0),
    2
  ) AS saldo_pendiente
FROM cuotas c
LEFT JOIN (
  SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
  FROM pago_aplicaciones
  GROUP BY id_cuota
) pa ON pa.id_cuota = c.id_cuota
WHERE c.id_cuota = :id
;

-- name: getCuotaByIdScoped
SELECT
  c.*,
  ROUND(c.capital_programado + c.interes_programado + c.mora_acumulada, 2) AS monto_cuota,
  ROUND(c.capital_pagado + c.interes_pagado + COALESCE(pa.mora_pagada, 0), 2) AS monto_pagado,
  ROUND(COALESCE(pa.mora_pagada, 0), 2) AS mora_pagada,
  ROUND(
    c.capital_programado + c.interes_programado + c.mora_acumulada -
    c.capital_pagado - c.interes_pagado - COALESCE(pa.mora_pagada, 0),
    2
  ) AS saldo_pendiente
FROM cuotas c
INNER JOIN prestamos p ON p.id_prestamo = c.id_prestamo
INNER JOIN clientes cl ON cl.id_cliente = p.id_cliente
LEFT JOIN (
  SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
  FROM pago_aplicaciones
  GROUP BY id_cuota
) pa ON pa.id_cuota = c.id_cuota
WHERE c.id_cuota = :id
  AND cl.id_cartera IN (:id_carteras);

-- name: getCuotasByPrestamo
SELECT
  c.*,
  ROUND(c.capital_programado + c.interes_programado + c.mora_acumulada, 2) AS monto_cuota,
  ROUND(c.capital_pagado + c.interes_pagado + COALESCE(pa.mora_pagada, 0), 2) AS monto_pagado,
  ROUND(COALESCE(pa.mora_pagada, 0), 2) AS mora_pagada,
  ROUND(
    c.capital_programado + c.interes_programado + c.mora_acumulada -
    c.capital_pagado - c.interes_pagado - COALESCE(pa.mora_pagada, 0),
    2
  ) AS saldo_pendiente
FROM cuotas c
LEFT JOIN (
  SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
  FROM pago_aplicaciones
  GROUP BY id_cuota
) pa ON pa.id_cuota = c.id_cuota
WHERE c.id_prestamo = :id_prestamo
  AND c.estado <> 'cancelada'
ORDER BY c.numero_cuota;

-- name: getCuotasByPrestamoScoped
SELECT
  c.*,
  ROUND(c.capital_programado + c.interes_programado + c.mora_acumulada, 2) AS monto_cuota,
  ROUND(c.capital_pagado + c.interes_pagado + COALESCE(pa.mora_pagada, 0), 2) AS monto_pagado,
  ROUND(COALESCE(pa.mora_pagada, 0), 2) AS mora_pagada,
  ROUND(
    c.capital_programado + c.interes_programado + c.mora_acumulada -
    c.capital_pagado - c.interes_pagado - COALESCE(pa.mora_pagada, 0),
    2
  ) AS saldo_pendiente
FROM cuotas c
INNER JOIN prestamos p ON p.id_prestamo = c.id_prestamo
INNER JOIN clientes cl ON cl.id_cliente = p.id_cliente
LEFT JOIN (
  SELECT id_cuota, SUM(CASE WHEN aplicado_a = 'MORA' THEN monto_aplicado ELSE 0 END) AS mora_pagada
  FROM pago_aplicaciones
  GROUP BY id_cuota
) pa ON pa.id_cuota = c.id_cuota
WHERE c.id_prestamo = :id_prestamo
  AND c.estado <> 'cancelada'
  AND cl.id_cartera IN (:id_carteras)
ORDER BY c.numero_cuota;

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
  id_prestamo         = COALESCE(:id_prestamo, id_prestamo),
  numero_cuota        = COALESCE(:numero_cuota, numero_cuota),
  fecha_vencimiento   = COALESCE(:fecha_vencimiento, fecha_vencimiento),
  capital_programado  = COALESCE(:capital_programado, capital_programado),
  interes_programado  = COALESCE(:interes_programado, interes_programado),
  capital_pagado      = COALESCE(:capital_pagado, capital_pagado),
  interes_pagado      = COALESCE(:interes_pagado, interes_pagado),
  mora_acumulada      = COALESCE(:mora_acumulada, mora_acumulada),
  estado              = COALESCE(:estado, estado)
WHERE id_cuota = :id;

-- name: deleteCuota
DELETE
FROM cuotas
WHERE id_cuota = :id;

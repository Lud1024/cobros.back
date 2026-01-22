-- sql/mora_eventos.sql

-- name: listMoraEventos
SELECT *
FROM mora_eventos;

-- name: getMoraEventoById
SELECT *
FROM mora_eventos
WHERE id_mora = :id;

-- name: getMoraEventosByCuota
SELECT *
FROM mora_eventos
WHERE id_cuota = :id_cuota;

-- name: getMoraEventosByFecha
SELECT *
FROM mora_eventos
WHERE fecha_calculo = :fecha_calculo;

-- name: createMoraEvento
INSERT INTO mora_eventos (
  id_cuota,
  fecha_calculo,
  dias_atraso,
  interes_mora
)
VALUES (
  :id_cuota,
  :fecha_calculo,
  :dias_atraso,
  :interes_mora
);

-- name: updateMoraEvento
UPDATE mora_eventos
SET
  id_cuota      = COALESCE(:id_cuota, id_cuota),
  fecha_calculo = COALESCE(:fecha_calculo, fecha_calculo),
  dias_atraso   = COALESCE(:dias_atraso, dias_atraso),
  interes_mora  = COALESCE(:interes_mora, interes_mora)
WHERE id_mora = :id;

-- name: deleteMoraEvento
DELETE
FROM mora_eventos
WHERE id_mora = :id;
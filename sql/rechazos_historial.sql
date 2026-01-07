-- sql/rechazos_historial.sql

-- name: listRechazosHistorial
SELECT *
FROM rechazos_historial;

-- name: getRechazoHistorialById
SELECT *
FROM rechazos_historial
WHERE id_rechazo = :id;

-- name: getRechazosByVerificacion
SELECT *
FROM rechazos_historial
WHERE id_verificacion = :id_verificacion;

-- name: createRechazoHistorial
INSERT INTO rechazos_historial (
  id_verificacion,
  motivo
)
VALUES (
  :id_verificacion,
  :motivo
);

-- name: updateRechazoHistorial
UPDATE rechazos_historial
SET
  id_verificacion = :id_verificacion,
  motivo          = :motivo
WHERE id_rechazo = :id;

-- name: deleteRechazoHistorial
DELETE
FROM rechazos_historial
WHERE id_rechazo = :id;
-- sql/visitas_cobro.sql

-- name: listVisitasCobro
SELECT *
FROM visitas_cobro;

-- name: getVisitaCobroById
SELECT *
FROM visitas_cobro
WHERE id_visita = :id;

-- name: getVisitasByCliente
SELECT *
FROM visitas_cobro
WHERE id_cliente = :id_cliente;

-- name: getVisitasByPrestamo
SELECT *
FROM visitas_cobro
WHERE id_prestamo = :id_prestamo;

-- name: getVisitasByResultado
SELECT *
FROM visitas_cobro
WHERE resultado = :resultado;

-- name: createVisitaCobro
INSERT INTO visitas_cobro (
  id_cliente,
  id_prestamo,
  resultado,
  mensaje_dejado,
  total_cobros_info
)
VALUES (
  :id_cliente,
  :id_prestamo,
  :resultado,
  :mensaje_dejado,
  :total_cobros_info
);

-- name: updateVisitaCobro
UPDATE visitas_cobro
SET
  id_cliente        = :id_cliente,
  id_prestamo       = :id_prestamo,
  resultado         = :resultado,
  mensaje_dejado    = :mensaje_dejado,
  total_cobros_info = :total_cobros_info
WHERE id_visita = :id;

-- name: deleteVisitaCobro
DELETE
FROM visitas_cobro
WHERE id_visita = :id;
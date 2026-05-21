-- sql/visitas_cobro.sql

-- name: listVisitasCobro
SELECT *
FROM visitas_cobro
ORDER BY fecha_visita DESC, id_visita DESC;

-- name: listVisitasCobroScoped
SELECT v.*
FROM visitas_cobro v
INNER JOIN clientes c ON c.id_cliente = v.id_cliente
WHERE c.id_cartera IN (:id_carteras)
ORDER BY v.fecha_visita DESC, v.id_visita DESC;

-- name: getVisitaCobroById
SELECT *
FROM visitas_cobro
WHERE id_visita = :id;

-- name: getVisitaCobroByIdScoped
SELECT v.*
FROM visitas_cobro v
INNER JOIN clientes c ON c.id_cliente = v.id_cliente
WHERE v.id_visita = :id
  AND c.id_cartera IN (:id_carteras);

-- name: getVisitasByCliente
SELECT *
FROM visitas_cobro
WHERE id_cliente = :id_cliente
ORDER BY fecha_visita DESC, id_visita DESC;

-- name: getVisitasByClienteScoped
SELECT v.*
FROM visitas_cobro v
INNER JOIN clientes c ON c.id_cliente = v.id_cliente
WHERE v.id_cliente = :id_cliente
  AND c.id_cartera IN (:id_carteras)
ORDER BY v.fecha_visita DESC, v.id_visita DESC;

-- name: getVisitasByPrestamo
SELECT *
FROM visitas_cobro
WHERE id_prestamo = :id_prestamo;

-- name: getVisitasByPrestamoScoped
SELECT v.*
FROM visitas_cobro v
INNER JOIN clientes c ON c.id_cliente = v.id_cliente
WHERE v.id_prestamo = :id_prestamo
  AND c.id_cartera IN (:id_carteras);

-- name: getVisitasByResultado
SELECT *
FROM visitas_cobro
WHERE resultado = :resultado;

-- name: getVisitasByResultadoScoped
SELECT v.*
FROM visitas_cobro v
INNER JOIN clientes c ON c.id_cliente = v.id_cliente
WHERE v.resultado = :resultado
  AND c.id_cartera IN (:id_carteras);

-- name: createVisitaCobro
INSERT INTO visitas_cobro (
  id_cliente,
  id_prestamo,
  id_usuario_registro,
  fecha_visita,
  resultado,
  mensaje_dejado,
  total_cobros_info
)
VALUES (
  :id_cliente,
  :id_prestamo,
  :id_usuario_registro,
  :fecha_visita,
  :resultado,
  :mensaje_dejado,
  :total_cobros_info
);

-- name: updateVisitaCobro
UPDATE visitas_cobro
SET
  id_cliente        = COALESCE(:id_cliente, id_cliente),
  id_prestamo       = COALESCE(:id_prestamo, id_prestamo),
  fecha_visita      = COALESCE(:fecha_visita, fecha_visita),
  resultado         = COALESCE(:resultado, resultado),
  mensaje_dejado    = COALESCE(:mensaje_dejado, mensaje_dejado),
  total_cobros_info = COALESCE(:total_cobros_info, total_cobros_info)
WHERE id_visita = :id;

-- name: deleteVisitaCobro
DELETE
FROM visitas_cobro
WHERE id_visita = :id;

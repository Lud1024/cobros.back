-- sql/politicas_mora.sql

-- name: listPoliticasMora
SELECT *
FROM politicas_mora;

-- name: getPoliticaMoraById
SELECT *
FROM politicas_mora
WHERE id_politica = :id;

-- name: getPoliticasByCartera
SELECT *
FROM politicas_mora
WHERE id_cartera = :id_cartera;

-- name: getPoliticasVigentes
SELECT *
FROM politicas_mora
WHERE vigente_desde <= CURRENT_DATE
  AND (vigente_hasta IS NULL OR vigente_hasta >= CURRENT_DATE);

-- name: createPoliticaMora
INSERT INTO politicas_mora (
  id_cartera,
  tasa_mora_diaria,
  tope_mora,
  vigente_desde,
  vigente_hasta
)
VALUES (
  :id_cartera,
  :tasa_mora_diaria,
  :tope_mora,
  :vigente_desde,
  :vigente_hasta
);

-- name: updatePoliticaMora
UPDATE politicas_mora
SET
  id_cartera       = COALESCE(:id_cartera, id_cartera),
  tasa_mora_diaria = COALESCE(:tasa_mora_diaria, tasa_mora_diaria),
  tope_mora        = COALESCE(:tope_mora, tope_mora),
  vigente_desde    = COALESCE(:vigente_desde, vigente_desde),
  vigente_hasta    = COALESCE(:vigente_hasta, vigente_hasta)
WHERE id_politica = :id;

-- name: deletePoliticaMora
DELETE
FROM politicas_mora
WHERE id_politica = :id;
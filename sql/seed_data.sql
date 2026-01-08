-- =============================================================================
-- SCRIPT DE DATOS SEMILLA PARA lnirvgtg_cobros_union
-- Generado: 2026-01-08
-- NOTA: Excluye usuarios (ya existen id 1 y 2) y rol_cartera
-- =============================================================================

USE `lnirvgtg_cobros_union`;

-- Desactivar verificación de claves foráneas y modo seguro temporalmente
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- =============================================================================
-- LIMPIAR TABLAS EXISTENTES (en orden inverso de dependencias)
-- =============================================================================
DELETE FROM `visitas_cobro`;
DELETE FROM `rechazos_historial`;
DELETE FROM `verificaciones_prestamo`;
DELETE FROM `mora_eventos`;
DELETE FROM `pago_aplicaciones`;
DELETE FROM `pagos`;
DELETE FROM `prestamo_garantia`;
DELETE FROM `cuotas`;
DELETE FROM `prestamos`;
DELETE FROM `cliente_documentos`;
DELETE FROM `clientes`;
DELETE FROM `politicas_mora`;
DELETE FROM `usuario_roles`;
DELETE FROM `roles`;
DELETE FROM `metodos_garantia`;
DELETE FROM `periodicidades`;
DELETE FROM `carteras`;

-- Resetear AUTO_INCREMENT
ALTER TABLE `visitas_cobro` AUTO_INCREMENT = 1;
ALTER TABLE `rechazos_historial` AUTO_INCREMENT = 1;
ALTER TABLE `verificaciones_prestamo` AUTO_INCREMENT = 1;
ALTER TABLE `mora_eventos` AUTO_INCREMENT = 1;
ALTER TABLE `pagos` AUTO_INCREMENT = 1;
ALTER TABLE `cuotas` AUTO_INCREMENT = 1;
ALTER TABLE `prestamos` AUTO_INCREMENT = 1;
ALTER TABLE `cliente_documentos` AUTO_INCREMENT = 1;
ALTER TABLE `clientes` AUTO_INCREMENT = 1;
ALTER TABLE `politicas_mora` AUTO_INCREMENT = 1;
ALTER TABLE `roles` AUTO_INCREMENT = 1;
ALTER TABLE `metodos_garantia` AUTO_INCREMENT = 1;
ALTER TABLE `periodicidades` AUTO_INCREMENT = 1;
ALTER TABLE `carteras` AUTO_INCREMENT = 1;

-- =============================================================================
-- 1. CARTERAS (10 registros)
-- =============================================================================
INSERT INTO `carteras` (`nombre`, `descripcion`) VALUES
('Cartera Principal', 'Cartera de préstamos principales de la empresa'),
('Cartera Microcréditos', 'Préstamos pequeños para emprendedores'),
('Cartera Comercial', 'Préstamos para negocios establecidos'),
('Cartera Agrícola', 'Financiamiento para actividades agrícolas'),
('Cartera Vivienda', 'Préstamos para mejoras de vivienda'),
('Cartera Educación', 'Créditos educativos para estudiantes'),
('Cartera Vehículos', 'Financiamiento automotriz'),
('Cartera Consumo', 'Préstamos personales de consumo'),
('Cartera Empresarial', 'Créditos para empresas medianas'),
('Cartera Especial', 'Casos especiales y refinanciamientos');

-- =============================================================================
-- 2. PERIODICIDADES (6 registros - las más comunes)
-- =============================================================================
INSERT INTO `periodicidades` (`codigo`, `dias`) VALUES
('DIARIO', 1),
('SEMANAL', 7),
('QUINCENAL', 15),
('MENSUAL', 30),
('BIMESTRAL', 60),
('TRIMESTRAL', 90);

-- =============================================================================
-- 3. METODOS_GARANTIA (10 registros)
-- =============================================================================
INSERT INTO `metodos_garantia` (`nombre_metodo`, `descripcion`) VALUES
('Fiador Personal', 'Persona que responde por el préstamo'),
('Prenda Vehicular', 'Vehículo como garantía del préstamo'),
('Hipoteca', 'Bien inmueble como garantía'),
('Electrodomésticos', 'Electrodomésticos del hogar'),
('Maquinaria', 'Maquinaria industrial o agrícola'),
('Inventario', 'Inventario del negocio'),
('Cheque Diferido', 'Cheques posfechados como garantía'),
('Pagaré', 'Documento legal de pago'),
('Joyas', 'Joyas y metales preciosos'),
('Título de Propiedad', 'Documento de propiedad de bienes');

-- =============================================================================
-- 4. ROLES (5 roles principales con permisos por MÓDULO)
-- =============================================================================
INSERT INTO `roles` (`nombre_rol`, `permisos`) VALUES
('Administrador', JSON_OBJECT(
  'clientes', true,
  'prestamos', true,
  'pagos', true,
  'mora', true,
  'configuracion', true,
  'usuarios', true,
  'reportes', true
)),
('Supervisor', JSON_OBJECT(
  'clientes', true,
  'prestamos', true,
  'pagos', true,
  'mora', true,
  'configuracion', false,
  'usuarios', false,
  'reportes', true
)),
('Analista', JSON_OBJECT(
  'clientes', true,
  'prestamos', true,
  'pagos', false,
  'mora', true,
  'configuracion', false,
  'usuarios', false,
  'reportes', true
)),
('Cobrador', JSON_OBJECT(
  'clientes', true,
  'prestamos', true,
  'pagos', true,
  'mora', true,
  'configuracion', false,
  'usuarios', false,
  'reportes', false
)),
('Consulta', JSON_OBJECT(
  'clientes', true,
  'prestamos', true,
  'pagos', true,
  'mora', true,
  'configuracion', false,
  'usuarios', false,
  'reportes', true
));

-- =============================================================================
-- 5. CLIENTES (15 registros - distribuidos en diferentes carteras)
-- =============================================================================
INSERT INTO `clientes` (`id_cartera`, `nombre`, `apellido`, `dpi`, `nit`, `direccion`, `telefono`, `correo`, `estado`) VALUES
(1, 'Juan Carlos', 'López Martínez', '1234567890101', '12345678', '5a Avenida 12-34 Zona 1, Guatemala', '55551234', 'juan.lopez@email.com', 'A'),
(1, 'María Elena', 'García Rodríguez', '2345678901202', '23456789', '6a Calle 8-90 Zona 10, Guatemala', '55552345', 'maria.garcia@email.com', 'A'),
(2, 'Pedro Antonio', 'Hernández Pérez', '3456789012303', '34567890', '7a Avenida 15-22 Zona 9, Guatemala', '55553456', 'pedro.hernandez@email.com', 'A'),
(2, 'Ana Lucía', 'Morales Castillo', '4567890123404', '45678901', 'Diagonal 6 14-50 Zona 10, Guatemala', '55554567', 'ana.morales@email.com', 'A'),
(3, 'Carlos Roberto', 'Jiménez Torres', '5678901234505', '56789012', '12 Calle 4-56 Zona 1, Quetzaltenango', '55555678', 'carlos.jimenez@email.com', 'A'),
(3, 'Rosa María', 'Ramírez Flores', '6789012345606', '67890123', '3a Avenida 7-89 Zona 3, Quetzaltenango', '55556789', 'rosa.ramirez@email.com', 'A'),
(4, 'José Manuel', 'Díaz Santizo', '7890123456707', '78901234', 'Aldea El Progreso, Escuintla', '55557890', 'jose.diaz@email.com', 'A'),
(4, 'Marta Alicia', 'Vásquez Solís', '8901234567808', '89012345', 'Finca Las Palmas, Escuintla', '55558901', 'marta.vasquez@email.com', 'A'),
(5, 'Luis Fernando', 'Estrada Mejía', '9012345678909', '90123456', '2a Calle 5-67 Zona 2, Cobán', '55559012', 'luis.estrada@email.com', 'A'),
(5, 'Carmen Isabel', 'Portillo Lemus', '0123456789010', '01234567', '4a Avenida 3-21 Zona 1, Cobán', '55550123', 'carmen.portillo@email.com', 'A'),
(1, 'Roberto', 'Méndez Cano', '1122334455667', '11223344', '8a Calle 9-10 Zona 11, Guatemala', '55551122', 'roberto.mendez@email.com', 'A'),
(2, 'Sofía Andrea', 'Castro Pineda', '2233445566778', '22334455', '9a Avenida 6-78 Zona 12, Guatemala', '55552233', 'sofia.castro@email.com', 'A'),
(3, 'Diego Alejandro', 'Reyes Barrios', '3344556677889', '33445566', '10a Calle 2-34 Zona 13, Guatemala', '55553344', 'diego.reyes@email.com', 'A'),
(1, 'Lucía Fernanda', 'Ortiz Godoy', '4455667788990', '44556677', '11a Avenida 1-23 Zona 14, Guatemala', '55554455', 'lucia.ortiz@email.com', 'A'),
(2, 'Miguel Ángel', 'Ruiz Aguilar', '5566778899001', '55667788', '1a Calle 12-45 Zona 15, Guatemala', '55555566', 'miguel.ruiz@email.com', 'A');

-- =============================================================================
-- 6. CLIENTE_DOCUMENTOS (12 registros)
-- =============================================================================
INSERT INTO `cliente_documentos` (`id_cliente`, `tipo_documento`, `nombre_archivo`, `ruta_storage`) VALUES
(1, 'PDF', 'dpi_juan_lopez.pdf', '/storage/clientes/1/dpi_juan_lopez.pdf'),
(1, 'PDF', 'recibo_luz_juan.pdf', '/storage/clientes/1/recibo_luz_juan.pdf'),
(2, 'PDF', 'dpi_maria_garcia.pdf', '/storage/clientes/2/dpi_maria_garcia.pdf'),
(3, 'PDF', 'dpi_pedro_hernandez.pdf', '/storage/clientes/3/dpi_pedro_hernandez.pdf'),
(3, 'EXCEL', 'ingresos_pedro.xlsx', '/storage/clientes/3/ingresos_pedro.xlsx'),
(4, 'PDF', 'dpi_ana_morales.pdf', '/storage/clientes/4/dpi_ana_morales.pdf'),
(5, 'PDF', 'dpi_carlos_jimenez.pdf', '/storage/clientes/5/dpi_carlos_jimenez.pdf'),
(5, 'PDF', 'patente_comercio.pdf', '/storage/clientes/5/patente_comercio.pdf'),
(6, 'PDF', 'dpi_rosa_ramirez.pdf', '/storage/clientes/6/dpi_rosa_ramirez.pdf'),
(7, 'PDF', 'dpi_jose_diaz.pdf', '/storage/clientes/7/dpi_jose_diaz.pdf'),
(8, 'PDF', 'dpi_marta_vasquez.pdf', '/storage/clientes/8/dpi_marta_vasquez.pdf'),
(9, 'PDF', 'dpi_luis_estrada.pdf', '/storage/clientes/9/dpi_luis_estrada.pdf');

-- =============================================================================
-- 7. POLITICAS_MORA (10 registros - una por cartera)
-- =============================================================================
INSERT INTO `politicas_mora` (`id_cartera`, `tasa_mora_diaria`, `tope_mora`, `vigente_desde`, `vigente_hasta`) VALUES
(1, 0.0500, 500.00, '2025-01-01', NULL),
(2, 0.0300, 200.00, '2025-01-01', NULL),
(3, 0.0400, 400.00, '2025-01-01', NULL),
(4, 0.0250, 150.00, '2025-01-01', NULL),
(5, 0.0350, 300.00, '2025-01-01', NULL),
(6, 0.0200, 100.00, '2025-01-01', NULL),
(7, 0.0450, 450.00, '2025-01-01', NULL),
(8, 0.0550, 550.00, '2025-01-01', NULL),
(9, 0.0600, 600.00, '2025-01-01', NULL),
(10, 0.0400, 350.00, '2025-01-01', NULL);

-- =============================================================================
-- 8. PRESTAMOS (15 registros)
-- =============================================================================
INSERT INTO `prestamos` (`id_cliente`, `monto`, `tasa_interes_anual`, `id_periodicidad`, `plazo_cuotas`, `fecha_inicio`, `dia_pago`, `estado`) VALUES
(1, 10000.00, 18.0000, 4, 12, '2025-06-01', 1, 'activo'),
(2, 5000.00, 24.0000, 3, 10, '2025-07-15', 15, 'activo'),
(3, 3000.00, 20.0000, 2, 20, '2025-08-01', 5, 'activo'),
(4, 15000.00, 16.0000, 4, 24, '2025-05-01', 10, 'activo'),
(5, 25000.00, 15.0000, 4, 36, '2025-04-01', 1, 'activo'),
(6, 8000.00, 22.0000, 3, 16, '2025-09-01', 1, 'activo'),
(7, 12000.00, 18.0000, 4, 12, '2025-03-01', 15, 'activo'),
(8, 6000.00, 20.0000, 2, 24, '2025-10-01', 5, 'activo'),
(9, 20000.00, 14.0000, 4, 24, '2025-02-01', 1, 'activo'),
(10, 4000.00, 24.0000, 3, 8, '2025-11-01', 10, 'activo'),
(11, 7500.00, 19.0000, 4, 12, '2025-01-15', 15, 'activo'),
(12, 9000.00, 21.0000, 3, 12, '2025-08-15', 1, 'activo'),
(13, 18000.00, 17.0000, 4, 18, '2025-06-15', 15, 'activo'),
(14, 2500.00, 26.0000, 2, 12, '2025-12-01', 5, 'activo'),
(15, 11000.00, 18.5000, 4, 12, '2025-07-01', 1, 'activo');

-- =============================================================================
-- 9. CUOTAS (generadas para los préstamos - múltiples por préstamo)
-- =============================================================================
-- Préstamo 1: Q10,000, 12 cuotas mensuales
INSERT INTO `cuotas` (`id_prestamo`, `numero_cuota`, `fecha_vencimiento`, `capital_programado`, `interes_programado`, `capital_pagado`, `interes_pagado`, `mora_acumulada`, `estado`) VALUES
(1, 1, '2025-07-01', 833.33, 150.00, 833.33, 150.00, 0.00, 'cancelada'),
(1, 2, '2025-08-01', 833.33, 137.50, 833.33, 137.50, 0.00, 'cancelada'),
(1, 3, '2025-09-01', 833.33, 125.00, 833.33, 125.00, 0.00, 'cancelada'),
(1, 4, '2025-10-01', 833.33, 112.50, 833.33, 112.50, 0.00, 'cancelada'),
(1, 5, '2025-11-01', 833.33, 100.00, 833.33, 100.00, 0.00, 'cancelada'),
(1, 6, '2025-12-01', 833.33, 87.50, 833.33, 87.50, 0.00, 'cancelada'),
(1, 7, '2026-01-01', 833.33, 75.00, 0.00, 0.00, 35.00, 'vencida'),
(1, 8, '2026-02-01', 833.34, 62.50, 0.00, 0.00, 0.00, 'activa'),
(1, 9, '2026-03-01', 833.34, 50.00, 0.00, 0.00, 0.00, 'activa'),
(1, 10, '2026-04-01', 833.34, 37.50, 0.00, 0.00, 0.00, 'activa'),
(1, 11, '2026-05-01', 833.34, 25.00, 0.00, 0.00, 0.00, 'activa'),
(1, 12, '2026-06-01', 833.34, 12.50, 0.00, 0.00, 0.00, 'activa');

-- Préstamo 2: Q5,000, 10 cuotas quincenales
INSERT INTO `cuotas` (`id_prestamo`, `numero_cuota`, `fecha_vencimiento`, `capital_programado`, `interes_programado`, `capital_pagado`, `interes_pagado`, `mora_acumulada`, `estado`) VALUES
(2, 1, '2025-08-01', 500.00, 100.00, 500.00, 100.00, 0.00, 'cancelada'),
(2, 2, '2025-08-15', 500.00, 90.00, 500.00, 90.00, 0.00, 'cancelada'),
(2, 3, '2025-09-01', 500.00, 80.00, 500.00, 80.00, 0.00, 'cancelada'),
(2, 4, '2025-09-15', 500.00, 70.00, 500.00, 70.00, 0.00, 'cancelada'),
(2, 5, '2025-10-01', 500.00, 60.00, 500.00, 60.00, 0.00, 'cancelada'),
(2, 6, '2025-10-15', 500.00, 50.00, 500.00, 50.00, 0.00, 'cancelada'),
(2, 7, '2025-11-01', 500.00, 40.00, 500.00, 40.00, 0.00, 'cancelada'),
(2, 8, '2025-11-15', 500.00, 30.00, 500.00, 30.00, 0.00, 'cancelada'),
(2, 9, '2025-12-01', 500.00, 20.00, 500.00, 20.00, 0.00, 'cancelada'),
(2, 10, '2025-12-15', 500.00, 10.00, 500.00, 10.00, 0.00, 'cancelada');

-- Préstamo 3: Q3,000, 20 cuotas semanales (mostrando algunas)
INSERT INTO `cuotas` (`id_prestamo`, `numero_cuota`, `fecha_vencimiento`, `capital_programado`, `interes_programado`, `capital_pagado`, `interes_pagado`, `mora_acumulada`, `estado`) VALUES
(3, 1, '2025-08-08', 150.00, 11.54, 150.00, 11.54, 0.00, 'cancelada'),
(3, 2, '2025-08-15', 150.00, 10.96, 150.00, 10.96, 0.00, 'cancelada'),
(3, 3, '2025-08-22', 150.00, 10.38, 150.00, 10.38, 0.00, 'cancelada'),
(3, 4, '2025-08-29', 150.00, 9.81, 150.00, 9.81, 0.00, 'cancelada'),
(3, 5, '2025-09-05', 150.00, 9.23, 150.00, 9.23, 0.00, 'cancelada'),
(3, 6, '2025-09-12', 150.00, 8.65, 150.00, 8.65, 0.00, 'cancelada'),
(3, 7, '2025-09-19', 150.00, 8.08, 150.00, 8.08, 0.00, 'cancelada'),
(3, 8, '2025-09-26', 150.00, 7.50, 150.00, 7.50, 0.00, 'cancelada'),
(3, 9, '2025-10-03', 150.00, 6.92, 150.00, 6.92, 0.00, 'cancelada'),
(3, 10, '2025-10-10', 150.00, 6.35, 150.00, 6.35, 0.00, 'cancelada'),
(3, 11, '2025-10-17', 150.00, 5.77, 150.00, 5.77, 0.00, 'cancelada'),
(3, 12, '2025-10-24', 150.00, 5.19, 150.00, 5.19, 0.00, 'cancelada'),
(3, 13, '2025-10-31', 150.00, 4.62, 150.00, 4.62, 0.00, 'cancelada'),
(3, 14, '2025-11-07', 150.00, 4.04, 150.00, 4.04, 0.00, 'cancelada'),
(3, 15, '2025-11-14', 150.00, 3.46, 150.00, 3.46, 0.00, 'cancelada'),
(3, 16, '2025-11-21', 150.00, 2.88, 150.00, 2.88, 0.00, 'cancelada'),
(3, 17, '2025-11-28', 150.00, 2.31, 150.00, 2.31, 0.00, 'cancelada'),
(3, 18, '2025-12-05', 150.00, 1.73, 150.00, 1.73, 0.00, 'cancelada'),
(3, 19, '2025-12-12', 150.00, 1.15, 150.00, 1.15, 0.00, 'cancelada'),
(3, 20, '2025-12-19', 150.00, 0.58, 150.00, 0.58, 0.00, 'cancelada');

-- Préstamo 4: Q15,000, 24 cuotas mensuales
INSERT INTO `cuotas` (`id_prestamo`, `numero_cuota`, `fecha_vencimiento`, `capital_programado`, `interes_programado`, `capital_pagado`, `interes_pagado`, `mora_acumulada`, `estado`) VALUES
(4, 1, '2025-06-10', 625.00, 200.00, 625.00, 200.00, 0.00, 'cancelada'),
(4, 2, '2025-07-10', 625.00, 191.67, 625.00, 191.67, 0.00, 'cancelada'),
(4, 3, '2025-08-10', 625.00, 183.33, 625.00, 183.33, 0.00, 'cancelada'),
(4, 4, '2025-09-10', 625.00, 175.00, 625.00, 175.00, 0.00, 'cancelada'),
(4, 5, '2025-10-10', 625.00, 166.67, 625.00, 166.67, 0.00, 'cancelada'),
(4, 6, '2025-11-10', 625.00, 158.33, 625.00, 158.33, 0.00, 'cancelada'),
(4, 7, '2025-12-10', 625.00, 150.00, 625.00, 150.00, 0.00, 'cancelada'),
(4, 8, '2026-01-10', 625.00, 141.67, 0.00, 0.00, 0.00, 'activa'),
(4, 9, '2026-02-10', 625.00, 133.33, 0.00, 0.00, 0.00, 'activa'),
(4, 10, '2026-03-10', 625.00, 125.00, 0.00, 0.00, 0.00, 'activa');

-- Préstamo 5: Q25,000, 36 cuotas mensuales
INSERT INTO `cuotas` (`id_prestamo`, `numero_cuota`, `fecha_vencimiento`, `capital_programado`, `interes_programado`, `capital_pagado`, `interes_pagado`, `mora_acumulada`, `estado`) VALUES
(5, 1, '2025-05-01', 694.44, 312.50, 694.44, 312.50, 0.00, 'cancelada'),
(5, 2, '2025-06-01', 694.44, 303.82, 694.44, 303.82, 0.00, 'cancelada'),
(5, 3, '2025-07-01', 694.44, 295.14, 694.44, 295.14, 0.00, 'cancelada'),
(5, 4, '2025-08-01', 694.44, 286.46, 694.44, 286.46, 0.00, 'cancelada'),
(5, 5, '2025-09-01', 694.44, 277.78, 694.44, 277.78, 0.00, 'cancelada'),
(5, 6, '2025-10-01', 694.44, 269.10, 694.44, 269.10, 0.00, 'cancelada'),
(5, 7, '2025-11-01', 694.44, 260.42, 694.44, 260.42, 0.00, 'cancelada'),
(5, 8, '2025-12-01', 694.44, 251.74, 694.44, 251.74, 0.00, 'cancelada'),
(5, 9, '2026-01-01', 694.44, 243.06, 0.00, 0.00, 35.00, 'vencida'),
(5, 10, '2026-02-01', 694.44, 234.38, 0.00, 0.00, 0.00, 'activa');

-- Préstamo 6: Q8,000, 16 cuotas quincenales
INSERT INTO `cuotas` (`id_prestamo`, `numero_cuota`, `fecha_vencimiento`, `capital_programado`, `interes_programado`, `capital_pagado`, `interes_pagado`, `mora_acumulada`, `estado`) VALUES
(6, 1, '2025-09-15', 500.00, 146.67, 500.00, 146.67, 0.00, 'cancelada'),
(6, 2, '2025-10-01', 500.00, 137.50, 500.00, 137.50, 0.00, 'cancelada'),
(6, 3, '2025-10-15', 500.00, 128.33, 500.00, 128.33, 0.00, 'cancelada'),
(6, 4, '2025-11-01', 500.00, 119.17, 500.00, 119.17, 0.00, 'cancelada'),
(6, 5, '2025-11-15', 500.00, 110.00, 500.00, 110.00, 0.00, 'cancelada'),
(6, 6, '2025-12-01', 500.00, 100.83, 500.00, 100.83, 0.00, 'cancelada'),
(6, 7, '2025-12-15', 500.00, 91.67, 500.00, 91.67, 0.00, 'cancelada'),
(6, 8, '2026-01-01', 500.00, 82.50, 0.00, 0.00, 35.00, 'vencida'),
(6, 9, '2026-01-15', 500.00, 73.33, 0.00, 0.00, 0.00, 'activa'),
(6, 10, '2026-02-01', 500.00, 64.17, 0.00, 0.00, 0.00, 'activa');

-- =============================================================================
-- 10. PRESTAMO_GARANTIA (12 registros)
-- =============================================================================
INSERT INTO `prestamo_garantia` (`id_prestamo`, `id_metodo`, `valor_garantia`) VALUES
(1, 1, 10000.00),  -- Juan López - Fiador
(1, 8, 10000.00),  -- Juan López - Pagaré
(2, 8, 5000.00),   -- María García - Pagaré
(3, 1, 3000.00),   -- Pedro Hernández - Fiador
(4, 2, 20000.00),  -- Ana Morales - Prenda Vehicular
(4, 8, 15000.00),  -- Ana Morales - Pagaré
(5, 3, 50000.00),  -- Carlos Jiménez - Hipoteca
(6, 4, 12000.00),  -- Rosa Ramírez - Electrodomésticos
(7, 5, 18000.00),  -- José Díaz - Maquinaria
(8, 6, 10000.00),  -- Marta Vásquez - Inventario
(9, 10, 30000.00), -- Luis Estrada - Título de Propiedad
(10, 7, 4000.00);  -- Carmen Portillo - Cheque Diferido

-- =============================================================================
-- 11. PAGOS (20 registros)
-- =============================================================================
INSERT INTO `pagos` (`id_prestamo`, `fecha_pago`, `monto_recibido`, `metodo_pago`, `origen`, `observaciones`) VALUES
-- Pagos préstamo 1
(1, '2025-07-01', 983.33, 'EFECTIVO', 'Oficina Central', 'Pago cuota 1'),
(1, '2025-08-01', 970.83, 'EFECTIVO', 'Oficina Central', 'Pago cuota 2'),
(1, '2025-09-01', 958.33, 'EFECTIVO', 'Cobrador', 'Pago cuota 3'),
(1, '2025-10-01', 945.83, 'EFECTIVO', 'Oficina Central', 'Pago cuota 4'),
(1, '2025-11-01', 933.33, 'EFECTIVO', 'Cobrador', 'Pago cuota 5'),
(1, '2025-12-01', 920.83, 'EFECTIVO', 'Oficina Central', 'Pago cuota 6'),
-- Pagos préstamo 2 (completamente pagado)
(2, '2025-08-01', 600.00, 'EFECTIVO', 'Oficina Central', 'Pago cuota 1'),
(2, '2025-08-15', 590.00, 'EFECTIVO', 'Cobrador', 'Pago cuota 2'),
(2, '2025-09-01', 580.00, 'EFECTIVO', 'Oficina Central', 'Pago cuota 3'),
(2, '2025-09-15', 570.00, 'EFECTIVO', 'Cobrador', 'Pago cuota 4'),
(2, '2025-10-01', 560.00, 'EFECTIVO', 'Oficina Central', 'Pago cuota 5'),
(2, '2025-10-15', 550.00, 'EFECTIVO', 'Cobrador', 'Pago cuota 6'),
(2, '2025-11-01', 540.00, 'EFECTIVO', 'Oficina Central', 'Pago cuota 7'),
(2, '2025-11-15', 530.00, 'EFECTIVO', 'Cobrador', 'Pago cuota 8'),
(2, '2025-12-01', 520.00, 'EFECTIVO', 'Oficina Central', 'Pago cuota 9'),
(2, '2025-12-15', 510.00, 'EFECTIVO', 'Cobrador', 'Pago cuota 10 - Préstamo cancelado'),
-- Pagos préstamo 4
(4, '2025-06-10', 825.00, 'EFECTIVO', 'Oficina Central', 'Pago cuota 1'),
(4, '2025-07-10', 816.67, 'EFECTIVO', 'Cobrador', 'Pago cuota 2'),
(4, '2025-08-10', 808.33, 'EFECTIVO', 'Oficina Central', 'Pago cuota 3'),
(4, '2025-09-10', 800.00, 'EFECTIVO', 'Cobrador', 'Pago cuota 4');

-- =============================================================================
-- 12. PAGO_APLICACIONES (aplicación detallada de los pagos)
-- =============================================================================
INSERT INTO `pago_aplicaciones` (`id_pago`, `id_cuota`, `aplicado_a`, `monto_aplicado`) VALUES
-- Aplicaciones préstamo 1
(1, 1, 'CAPITAL', 833.33),
(1, 1, 'INTERES', 150.00),
(2, 2, 'CAPITAL', 833.33),
(2, 2, 'INTERES', 137.50),
(3, 3, 'CAPITAL', 833.33),
(3, 3, 'INTERES', 125.00),
(4, 4, 'CAPITAL', 833.33),
(4, 4, 'INTERES', 112.50),
(5, 5, 'CAPITAL', 833.33),
(5, 5, 'INTERES', 100.00),
(6, 6, 'CAPITAL', 833.33),
(6, 6, 'INTERES', 87.50),
-- Aplicaciones préstamo 2
(7, 13, 'CAPITAL', 500.00),
(7, 13, 'INTERES', 100.00),
(8, 14, 'CAPITAL', 500.00),
(8, 14, 'INTERES', 90.00),
(9, 15, 'CAPITAL', 500.00),
(9, 15, 'INTERES', 80.00),
(10, 16, 'CAPITAL', 500.00),
(10, 16, 'INTERES', 70.00);

-- =============================================================================
-- 13. MORA_EVENTOS (10 registros - para cuotas vencidas)
-- =============================================================================
INSERT INTO `mora_eventos` (`id_cuota`, `fecha_calculo`, `dias_atraso`, `interes_mora`) VALUES
(7, '2026-01-02', 1, 5.00),
(7, '2026-01-03', 2, 5.00),
(7, '2026-01-04', 3, 5.00),
(7, '2026-01-05', 4, 5.00),
(7, '2026-01-06', 5, 5.00),
(7, '2026-01-07', 6, 5.00),
(7, '2026-01-08', 7, 5.00),
(53, '2026-01-02', 1, 5.00),
(53, '2026-01-03', 2, 5.00),
(53, '2026-01-08', 7, 35.00);

-- =============================================================================
-- 14. VERIFICACIONES_PRESTAMO (12 registros)
-- =============================================================================
INSERT INTO `verificaciones_prestamo` (`id_cliente`, `fecha_solicitud`, `monto_solicitado`, `estado`, `analista`, `comentarios`) VALUES
(1, '2025-05-20', 10000.00, 'aprobado', 1, 'Cliente con buen historial crediticio. Documentación completa.'),
(2, '2025-07-01', 5000.00, 'aprobado', 1, 'Verificación de domicilio exitosa. Ingresos comprobados.'),
(3, '2025-07-20', 3000.00, 'aprobado', 2, 'Microcrédito para capital de trabajo. Negocio verificado.'),
(4, '2025-04-15', 15000.00, 'aprobado', 1, 'Garantía vehicular verificada. Buen perfil.'),
(5, '2025-03-15', 25000.00, 'aprobado', 1, 'Hipoteca registrada. Cliente AAA.'),
(6, '2025-08-20', 8000.00, 'aprobado', 2, 'Negocio estable. Referencias verificadas.'),
(11, '2025-12-15', 12000.00, 'en_proceso', 1, 'Pendiente verificación de domicilio.'),
(12, '2025-12-20', 8000.00, 'en_proceso', 2, 'Esperando documentos adicionales.'),
(13, '2025-12-28', 5000.00, 'rechazado', 1, 'No cumple con requisitos mínimos de ingresos.'),
(14, '2026-01-02', 15000.00, 'en_proceso', 1, 'Verificación en proceso.'),
(15, '2026-01-05', 6000.00, 'en_proceso', 2, 'Análisis de capacidad de pago pendiente.'),
(1, '2026-01-07', 5000.00, 'en_proceso', 1, 'Solicitud de ampliación de crédito.');

-- =============================================================================
-- 15. RECHAZOS_HISTORIAL (5 registros)
-- =============================================================================
INSERT INTO `rechazos_historial` (`id_verificacion`, `motivo`) VALUES
(9, 'Ingresos mensuales menores al 40% del monto de cuota proyectada. Se sugiere solicitar un monto menor.'),
(9, 'Segunda revisión: Cliente no presentó codeudor ni garantía adicional.'),
(9, 'Verificación final: No es posible aprobar el crédito en las condiciones actuales.'),
(9, 'Nota adicional: Se recomienda al cliente mejorar su historial crediticio y volver a aplicar en 6 meses.'),
(9, 'Cierre del caso: Solicitud rechazada definitivamente.');

-- =============================================================================
-- 16. USUARIO_ROLES (asignaciones para los 2 usuarios existentes)
-- =============================================================================
INSERT INTO `usuario_roles` (`id_usuario`, `id_rol`, `id_cartera`) VALUES
-- Usuario 1: Administrador en todas las carteras principales
(1, 1, 1),
(1, 1, 2),
(1, 1, 3),
(1, 1, 4),
(1, 1, 5),
-- Usuario 2: Cobrador en algunas carteras
(2, 4, 1),
(2, 4, 2),
(2, 4, 3),
-- Usuario 2: También es Analista en cartera 1
(2, 3, 1);

-- =============================================================================
-- 17. VISITAS_COBRO (15 registros)
-- =============================================================================
INSERT INTO `visitas_cobro` (`id_cliente`, `id_prestamo`, `fecha_visita`, `resultado`, `mensaje_dejado`, `total_cobros_info`) VALUES
(1, 1, '2025-12-28 09:30:00', 'COBRO', 'Cliente realizó pago de cuota 6.', 920.83),
(1, 1, '2026-01-05 10:00:00', 'PROMESA', 'Cliente promete pagar cuota 7 el día 10 de enero.', 0.00),
(2, 2, '2025-12-15 11:00:00', 'COBRO', 'Último pago del préstamo. Cancelación total.', 510.00),
(4, 4, '2025-12-20 09:00:00', 'COBRO', 'Pago parcial recibido.', 500.00),
(4, 4, '2026-01-03 14:30:00', 'NEGOCIACION', 'Cliente solicita reestructuración. Pendiente aprobación.', 0.00),
(5, 5, '2025-12-28 08:00:00', 'COBRO', 'Pago cuota 8 recibido.', 946.18),
(5, 5, '2026-01-05 09:30:00', 'NO_ENCONTRADO', 'No se encontró al cliente en domicilio. Se dejó aviso.', 0.00),
(6, 6, '2025-12-30 10:00:00', 'COBRO', 'Pago cuota 7 en efectivo.', 591.67),
(6, 6, '2026-01-06 11:30:00', 'PROMESA', 'Cliente promete ponerse al día la próxima semana.', 0.00),
(7, 7, '2025-12-15 15:00:00', 'COBRO', 'Pago mensual recibido.', 1066.67),
(8, 8, '2025-12-20 16:00:00', 'OTRO', 'Cliente reporta cambio de dirección. Actualizar datos.', 0.00),
(9, 9, '2025-12-28 10:30:00', 'COBRO', 'Pago doble recibido (2 cuotas).', 1800.00),
(10, 10, '2025-12-22 09:00:00', 'PROMESA', 'Cliente con dificultades. Promete pago para fin de mes.', 0.00),
(11, 11, '2026-01-02 14:00:00', 'COBRO', 'Pago de cuota recibido en oficina.', 833.33),
(12, 12, '2026-01-06 11:00:00', 'NO_ENCONTRADO', 'Domicilio cerrado. Dejar segunda notificación.', 0.00);

-- =============================================================================
-- Reactivar verificación de claves foráneas y modo seguro
-- =============================================================================
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- =============================================================================
-- RESUMEN DE DATOS INSERTADOS:
-- =============================================================================
-- carteras:              10 registros
-- periodicidades:         6 registros
-- metodos_garantia:      10 registros
-- roles:                  5 registros (con permisos JSON completos)
-- clientes:              15 registros
-- cliente_documentos:    12 registros
-- politicas_mora:        10 registros
-- prestamos:             15 registros
-- cuotas:                ~62 registros
-- prestamo_garantia:     12 registros
-- pagos:                 20 registros
-- pago_aplicaciones:     20 registros
-- mora_eventos:          10 registros
-- verificaciones:        12 registros
-- rechazos_historial:     5 registros
-- usuario_roles:          9 registros (para usuarios 1 y 2)
-- visitas_cobro:         15 registros
-- =============================================================================
-- TABLAS EXCLUIDAS: usuarios (ya existen), rol_cartera
-- =============================================================================

SELECT 'Script de datos semilla ejecutado exitosamente!' AS mensaje;

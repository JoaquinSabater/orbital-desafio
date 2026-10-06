-- Orbital 2.0 - esquema de base de datos
-- Requiere MySQL 8.0.16 o superior: las restricciones CHECK recién se aplican
-- desde 8.0.16, y los DEFAULT con expresión y los índices descendentes desde 8.0.13 / 8.0.
--
-- Ejecutar con:  mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS orbital
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE orbital;

CREATE TABLE IF NOT EXISTS atenciones_orbital (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  calificacion_cliente TINYINT UNSIGNED NOT NULL,
  es_urgente BOOLEAN NOT NULL DEFAULT FALSE,

  -- Lista cerrada: la misma que valida el backend. Un valor fuera del ENUM
  -- se rechaza en modo estricto (el modo por defecto de MySQL 8).
  tipo_cliente ENUM('VIP', 'CORPORATIVO', 'ESTANDAR') NOT NULL,

  -- Factor realmente usado en el cálculo. Se guarda para auditar: la regla de
  -- CORPORATIVO con calificación < 3 cambia respecto de Orbital 1.0, y el factor
  -- no se puede deducir solo mirando tipo_cliente.
  factor_aplicado DECIMAL(3, 2) NOT NULL,

  -- DECIMAL y no FLOAT/DOUBLE: la prioridad se compara y se ordena, y los tipos
  -- de punto flotante guardarían 3.5999999999999996 en lugar de 3.60.
  prioridad DECIMAL(4, 2) NOT NULL,

  -- DATETIME y no TIMESTAMP:
  --   * TIMESTAMP solo llega hasta el 19-01-2038 03:14:07 UTC.
  --   * TIMESTAMP convierte el valor según la zona horaria de CADA sesión al
  --     escribir y al leer; el mismo registro se ve distinto según quién consulte.
  --   * DATETIME guarda el valor tal cual, sin conversiones implícitas.
  -- Convención: esta columna está SIEMPRE en UTC. Por eso el default es
  -- UTC_TIMESTAMP() (CURRENT_TIMESTAMP usaría la zona horaria de la sesión) y el
  -- pool de mysql2 se configura con timezone 'Z' para leerla también como UTC.
  fecha_registro DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),

  PRIMARY KEY (id),

  CONSTRAINT chk_atenciones_calificacion CHECK (calificacion_cliente BETWEEN 1 AND 5),
  CONSTRAINT chk_atenciones_prioridad CHECK (prioridad BETWEEN 0 AND 10),

  -- Reportes y filtros por rango de fechas.
  INDEX idx_atenciones_fecha (fecha_registro),

  -- Cola de atención: ORDER BY prioridad DESC, fecha_registro ASC. El índice
  -- sigue ese mismo orden para resolver el listado sin filesort.
  INDEX idx_atenciones_cola (prioridad DESC, fecha_registro ASC)

  -- Sin índices propios para tipo_cliente ni es_urgente: con 3 y 2 valores
  -- posibles la cardinalidad es tan baja que el optimizador no los usaría.
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

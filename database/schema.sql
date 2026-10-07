-- Orbital 2.0 - esquema de base de datos
-- Requiere MySQL 8.0.16 o superior (CHECK y DEFAULT con expresión).
--
-- Ejecutar con:  mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS orbital
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE orbital;

CREATE TABLE IF NOT EXISTS atenciones_orbital (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,

  calificacion_cliente TINYINT UNSIGNED NOT NULL,
  es_urgente BOOLEAN NOT NULL DEFAULT FALSE,
  tipo_cliente ENUM('VIP', 'CORPORATIVO', 'ESTANDAR') NOT NULL,

  -- Factor realmente usado en el cálculo, para poder auditarlo.
  factor_aplicado DECIMAL(3, 2) NOT NULL,

  -- DECIMAL y no FLOAT: la prioridad tiene que ser exacta.
  prioridad DECIMAL(4, 2) NOT NULL,

  -- DATETIME en UTC y no TIMESTAMP (que termina en 2038 y convierte según la
  -- zona horaria de cada sesión).
  fecha_registro DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),

  PRIMARY KEY (id),

  CONSTRAINT chk_atenciones_calificacion CHECK (calificacion_cliente BETWEEN 1 AND 5),
  CONSTRAINT chk_atenciones_urgente CHECK (es_urgente IN (0, 1)),
  CONSTRAINT chk_atenciones_factor CHECK (factor_aplicado IN (1.00, 1.20, 1.50)),
  CONSTRAINT chk_atenciones_prioridad CHECK (prioridad BETWEEN 0 AND 10)

  -- Sin índices secundarios: hoy ninguna consulta los usa. Para una cola de
  -- atención, el índice natural sería (prioridad, fecha_registro).
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
import mysql from 'mysql2/promise';

import { config } from '../config/env.js';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: config.db.connectionLimit,
  waitForConnections: true,

  // fecha_registro se guarda en UTC (ver database/schema.sql). Con 'Z' mysql2
  // interpreta los DATETIME como UTC en vez de usar la zona horaria del servidor
  // de Node, así el valor leído no depende de dónde corra la API.
  timezone: 'Z',

  // Por defecto mysql2 devuelve los DECIMAL como string. Acá es seguro pasarlos a
  // number: prioridad y factor tienen 2 decimales y un rango muy acotado.
  decimalNumbers: true,
});

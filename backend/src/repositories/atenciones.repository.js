import { pool } from '../db/pool.js';

// Todas las consultas usan pool.execute() con placeholders "?": los valores viajan
// separados del texto SQL (sentencia preparada), nunca concatenados ni interpolados.

const SQL_INSERTAR = `
  INSERT INTO atenciones_orbital
    (calificacion_cliente, es_urgente, tipo_cliente, factor_aplicado, prioridad)
  VALUES (?, ?, ?, ?, ?)`;

const SQL_BUSCAR_POR_ID = `
  SELECT
    id,
    calificacion_cliente AS calificacionCliente,
    es_urgente AS esUrgente,
    tipo_cliente AS tipoCliente,
    factor_aplicado AS factorAplicado,
    prioridad,
    fecha_registro AS fechaRegistro
  FROM atenciones_orbital
  WHERE id = ?`;

export async function buscarPorId(id) {
  const [filas] = await pool.execute(SQL_BUSCAR_POR_ID, [id]);
  if (filas.length === 0) return null;
  // MySQL devuelve BOOLEAN como TINYINT (0/1).
  return { ...filas[0], esUrgente: Boolean(filas[0].esUrgente) };
}

export async function crear({ calificacionCliente, esUrgente, tipoCliente, factorAplicado, prioridad }) {
  const [resultado] = await pool.execute(SQL_INSERTAR, [
    calificacionCliente,
    esUrgente ? 1 : 0,
    tipoCliente,
    factorAplicado,
    prioridad,
  ]);
  // Se relee la fila para devolver la fecha que asignó la base (UTC_TIMESTAMP()).
  return buscarPorId(resultado.insertId);
}

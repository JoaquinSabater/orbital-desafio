import { pool } from '../db/pool.js';

// pool.execute() con placeholders "?": los valores viajan separados del texto SQL
// (sentencia preparada), nunca concatenados ni interpolados.
const SQL_INSERTAR = `
  INSERT INTO atenciones_orbital
    (calificacion_cliente, es_urgente, tipo_cliente, factor_aplicado, prioridad)
  VALUES (?, ?, ?, ?, ?)`;

export async function crear({ calificacionCliente, esUrgente, tipoCliente, factorAplicado, prioridad }) {
  const [resultado] = await pool.execute(SQL_INSERTAR, [
    calificacionCliente,
    esUrgente ? 1 : 0,
    tipoCliente,
    factorAplicado,
    prioridad,
  ]);
  return {
    id: resultado.insertId,
    calificacionCliente,
    esUrgente,
    tipoCliente,
    factorAplicado,
    prioridad,
  };
}

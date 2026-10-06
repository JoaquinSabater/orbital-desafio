import { ValidationError } from '../errors/ValidationError.js';

export const TIPOS_CLIENTE = Object.freeze(['VIP', 'CORPORATIVO', 'ESTANDAR']);

const FACTORES = Object.freeze({ VIP: 1.5, CORPORATIVO: 1.2, ESTANDAR: 1.0 });

const CALIFICACION_MIN = 1;
const CALIFICACION_MAX = 5;
// Por debajo de este valor la atención se considera mala.
const UMBRAL_ATENCION_MALA = 3;
const BONUS_URGENTE = 2;
const PRIORIDAD_MAX = 10;

function validarCalificacion(valor) {
  // En JS "abc" < 1 y "abc" > 5 son ambos false: el chequeo de rango del Java
  // traducido literal dejaría pasar un NaN. Por eso se valida el tipo primero.
  if (typeof valor !== 'number' || !Number.isInteger(valor)) {
    throw new ValidationError(
      'calificacionCliente debe ser un número entero',
      'calificacionCliente',
    );
  }
  if (valor < CALIFICACION_MIN || valor > CALIFICACION_MAX) {
    throw new ValidationError(
      `Calificación fuera de rango (${CALIFICACION_MIN}-${CALIFICACION_MAX})`,
      'calificacionCliente',
    );
  }
}

function validarUrgente(valor) {
  // El string "false" es truthy: sin este chequeo sumaría el bonus de urgencia.
  if (typeof valor !== 'boolean') {
    throw new ValidationError('esUrgente debe ser un booleano (true o false)', 'esUrgente');
  }
}

function normalizarTipoCliente(valor) {
  const tipo = typeof valor === 'string' ? valor.trim().toUpperCase() : '';
  if (!TIPOS_CLIENTE.includes(tipo)) {
    throw new ValidationError(
      `tipoCliente debe ser uno de: ${TIPOS_CLIENTE.join(', ')}`,
      'tipoCliente',
    );
  }
  return tipo;
}

// 3 * 1.2 da 3.5999999999999996 en punto flotante.
function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

export function calcularPrioridad(datos) {
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ValidationError(
      'Se esperaba un objeto con calificacionCliente, esUrgente y tipoCliente',
    );
  }
  const { calificacionCliente, esUrgente, tipoCliente } = datos;

  validarCalificacion(calificacionCliente);
  validarUrgente(esUrgente);
  const tipoClienteNormalizado = normalizarTipoCliente(tipoCliente);

  // Regla faltante en Orbital 1.0: el comentario de AtencionService.java dice que
  // la calificación de un CORPORATIVO "no puede multiplicar si la atención fue
  // mala (< 3)", pero el código nunca la implementó. Aplica solo a CORPORATIVO.
  const corporativoMalAtendido =
    tipoClienteNormalizado === 'CORPORATIVO' && calificacionCliente < UMBRAL_ATENCION_MALA;
  const factorAplicado = corporativoMalAtendido ? 1.0 : FACTORES[tipoClienteNormalizado];

  let prioridad = calificacionCliente * factorAplicado;
  if (esUrgente) {
    prioridad += BONUS_URGENTE;
  }

  return {
    prioridad: redondear(Math.min(prioridad, PRIORIDAD_MAX)),
    factorAplicado,
    tipoClienteNormalizado,
  };
}

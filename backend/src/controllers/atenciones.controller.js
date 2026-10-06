import { calcularPrioridad } from '../services/prioridad.js';
import * as atencionesRepository from '../repositories/atenciones.repository.js';

// Express 5 envía al middleware de errores las promesas rechazadas de los
// handlers async, por eso no hace falta try/catch acá.
export async function crearAtencion(req, res) {
  // La prioridad la calcula siempre el backend: de req.body solo se leen los tres
  // datos de entrada, así que una "prioridad" enviada por el cliente se ignora.
  const { prioridad, factorAplicado, tipoClienteNormalizado } = calcularPrioridad(req.body);

  const atencion = await atencionesRepository.crear({
    calificacionCliente: req.body.calificacionCliente,
    esUrgente: req.body.esUrgente,
    tipoCliente: tipoClienteNormalizado,
    factorAplicado,
    prioridad,
  });

  res.status(201).json(atencion);
}

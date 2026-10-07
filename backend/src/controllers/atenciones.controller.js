import { calcularPrioridad } from '../services/prioridad.js';
import * as atencionesRepository from '../repositories/atenciones.repository.js';


export async function crearAtencion(req, res) {

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

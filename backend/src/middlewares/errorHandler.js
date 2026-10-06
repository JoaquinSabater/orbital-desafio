import { ValidationError } from '../errors/ValidationError.js';

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// Express reconoce el middleware de errores por sus 4 parámetros: next no se
// usa pero tiene que estar en la firma.
export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message, campo: err.campo });
  }

  // Errores de express.json(): cuerpo que no es JSON válido o demasiado grande.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });
  }

  // Cualquier otro error (incluidos los de MySQL): el detalle queda en el log
  // del servidor y al cliente solo le llega un mensaje genérico.
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

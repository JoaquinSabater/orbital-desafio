// Error de datos de entrada. Es el equivalente a la IllegalArgumentException
// del servicio Java y el middleware de errores lo mapea a HTTP 400.
export class ValidationError extends Error {
  constructor(message, campo) {
    super(message);
    this.name = 'ValidationError';
    this.campo = campo;
  }
}

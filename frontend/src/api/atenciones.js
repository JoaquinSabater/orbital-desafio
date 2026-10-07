const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// La prioridad no se envía: la calcula siempre el backend.
export async function crearAtencion({ calificacionCliente, esUrgente, tipoCliente }) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}/api/atenciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calificacionCliente, esUrgente, tipoCliente }),
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Verificá que el backend esté corriendo.')
  }

  // Si la respuesta no es JSON (por ejemplo, un error de un proxy) queda en null.
  const cuerpo = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new Error(cuerpo?.error ?? `Error inesperado (HTTP ${respuesta.status})`)
  }
  if (typeof cuerpo?.prioridad !== 'number' || typeof cuerpo?.factorAplicado !== 'number') {
    throw new Error('Respuesta inesperada del servidor')
  }
  return cuerpo
}

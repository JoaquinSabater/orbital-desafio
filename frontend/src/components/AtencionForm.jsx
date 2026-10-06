import { useState } from 'react'
import { crearAtencion } from '../api/atenciones'

const CALIFICACIONES = [1, 2, 3, 4, 5]
const TIPOS_CLIENTE = [
  { valor: 'VIP', etiqueta: 'VIP' },
  { valor: 'CORPORATIVO', etiqueta: 'Corporativo' },
  { valor: 'ESTANDAR', etiqueta: 'Estándar' },
]

function AtencionForm() {
  const [calificacion, setCalificacion] = useState('')
  const [esUrgente, setEsUrgente] = useState(false)
  const [tipoCliente, setTipoCliente] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(evento) {
    evento.preventDefault()
    setEnviando(true)
    setResultado(null)
    setError(null)

    try {
      const atencion = await crearAtencion({
        // El value de un <select> siempre es string: se convierte a número
        // para que el backend reciba los tipos correctos.
        calificacionCliente: Number(calificacion),
        esUrgente,
        tipoCliente,
      })
      setResultado(atencion)
      setCalificacion('')
      setEsUrgente(false)
      setTipoCliente('')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Registrar atención</h2>

      <label className="campo">
        <span>Calificación del cliente</span>
        <select
          value={calificacion}
          onChange={(e) => setCalificacion(e.target.value)}
          disabled={enviando}
          required
        >
          <option value="" disabled>
            Seleccionar…
          </option>
          {CALIFICACIONES.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </label>

      <label className="campo">
        <span>Tipo de cliente</span>
        <select
          value={tipoCliente}
          onChange={(e) => setTipoCliente(e.target.value)}
          disabled={enviando}
          required
        >
          <option value="" disabled>
            Seleccionar…
          </option>
          {TIPOS_CLIENTE.map(({ valor, etiqueta }) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={esUrgente}
          onChange={(e) => setEsUrgente(e.target.checked)}
          disabled={enviando}
        />
        <span> Es urgente</span>
      </label>

      <button type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Calcular y registrar'}
      </button>

      {error && (
        <p className="mensaje mensaje-error" role="alert">
          {error}
        </p>
      )}

      {resultado && (
        <div className="mensaje mensaje-ok" role="status">
          <p>Atención #{resultado.id} registrada.</p>
          <dl className="resultado">
            <div>
              <dt>Prioridad</dt>
              <dd>{resultado.prioridad.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Factor aplicado</dt>
              <dd>× {resultado.factorAplicado.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      )}
    </form>
  )
}

export default AtencionForm

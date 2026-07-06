export function saludoPorHora() {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 12) return 'Buen día'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function formatFecha(fechaISO) {
  if (!fechaISO) return ''
  const d = new Date(fechaISO)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatFechaRelativa(fechaISO) {
  if (!fechaISO) return ''
  const d = new Date(fechaISO)
  const diffMs = Date.now() - d.getTime()
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  return formatFecha(fechaISO)
}

export function volumenSesion(ejercicios = []) {
  return ejercicios.reduce((total, ej) => {
    const setsVol = (ej.series || []).reduce((s, set) => s + (Number(set.peso) || 0) * (Number(set.reps) || 0), 0)
    return total + setsVol
  }, 0)
}

export function formatKg(n) {
  const num = Number(n) || 0
  return num % 1 === 0 ? `${num}` : num.toFixed(2).replace(/\.?0+$/, '')
}

export function formatDuracion(min) {
  const m = Math.round(min)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return `${h}h ${rest}min`
}

export function formatTimer(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Busca, dentro de un historial de sesiones, el último registro de un ejercicio por nombre
export function ultimoRegistroEjercicio(sesiones = [], nombreEjercicio) {
  const candidatas = sesiones
    .filter(s => (s.ejercicios || []).some(e => e.nombre === nombreEjercicio))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  if (candidatas.length === 0) return null

  const sesion = candidatas[0]
  const ejercicio = sesion.ejercicios.find(e => e.nombre === nombreEjercicio)
  const series = ejercicio?.series || []
  if (series.length === 0) return null

  const mejorSet = series.reduce((max, s) => (Number(s.peso) > Number(max.peso) ? s : max), series[0])
  return { fecha: sesion.fecha, series, mejorSet }
}

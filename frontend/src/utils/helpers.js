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
  const t = Math.max(0, totalSeconds)
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = Math.floor(t % 60).toString().padStart(2, '0')
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

// Récord personal histórico (peso más alto levantado alguna vez) para un ejercicio dado
export function prPersonalEjercicio(sesiones = [], nombreEjercicio) {
  let mejor = null
  for (const s of sesiones) {
    const ejercicio = (s.ejercicios || []).find(e => e.nombre === nombreEjercicio)
    if (!ejercicio) continue
    for (const set of ejercicio.series || []) {
      const peso = Number(set.peso) || 0
      if (!mejor || peso > mejor.peso) {
        mejor = { peso, reps: set.reps, fecha: s.fecha }
      }
    }
  }
  return mejor
}

const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Devuelve el volumen total levantado por cada día de la semana actual (lunes a domingo)
export function volumenPorDiaSemana(sesiones = [], sesionExtra = null) {
  const hoy = new Date()
  const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay() // 1 = lunes ... 7 = domingo
  const inicio = new Date(hoy)
  inicio.setHours(0, 0, 0, 0)
  inicio.setDate(inicio.getDate() - (diaSemana - 1))

  const totales = [0, 0, 0, 0, 0, 0, 0]
  const todas = sesionExtra ? [...sesiones, sesionExtra] : sesiones

  todas.forEach(s => {
    const f = new Date(s.fecha)
    if (f < inicio) return
    const diffDias = Math.floor((f - inicio) / (1000 * 60 * 60 * 24))
    if (diffDias < 0 || diffDias > 6) return
    totales[diffDias] += Number(s.volumen_total ?? volumenSesion(s.ejercicios))
  })

  return DIAS_SEMANA.map((label, i) => ({ label, volumen: totales[i], esHoy: i === diaSemana - 1 }))
}

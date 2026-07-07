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

// ---------- Stats agregadas para la pantalla de Perfil ----------

// Racha de días consecutivos entrenando, contando hacia atrás desde hoy
export function calcularRacha(sesiones = []) {
  if (!sesiones.length) return 0
  const dias = new Set(sesiones.map(s => new Date(s.fecha).toDateString()))
  let racha = 0
  let cursor = new Date()
  while (dias.has(cursor.toDateString())) {
    racha += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return racha
}

// Racha "con recuperación": igual que calcularRacha, pero permite UN día salteado
// sin cortar la racha (estilo "streak freeze"). El día de hoy nunca cuenta como
// falta si todavía no se entrenó (para no castigar al usuario a mitad del día).
// Devuelve { racha, huboGracia } donde huboGracia indica si se usó ese día libre.
export function calcularRachaDetalle(sesiones = []) {
  if (!sesiones.length) return { racha: 0, huboGracia: false }

  const dias = new Set(sesiones.map(s => new Date(s.fecha).toDateString()))
  let racha = 0
  let graciaDisponible = 1
  let huboGracia = false
  let esPrimerDia = true

  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  // Límite de seguridad para no iterar para siempre si algo sale mal
  for (let i = 0; i < 3650; i++) {
    const key = cursor.toDateString()

    if (dias.has(key)) {
      racha += 1
      esPrimerDia = false
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    // Hoy sin sesión todavía: no es una falta, seguimos revisando ayer
    if (esPrimerDia) {
      esPrimerDia = false
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    // Día salteado: usamos la gracia una sola vez por racha
    if (graciaDisponible > 0) {
      graciaDisponible -= 1
      huboGracia = true
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    break
  }

  return { racha, huboGracia: racha > 0 && huboGracia }
}

// Volumen total levantado en toda la vida del usuario (todas las sesiones)
export function volumenTotalHistorico(sesiones = []) {
  return sesiones.reduce((acc, s) => acc + Number(s.volumen_total ?? volumenSesion(s.ejercicios)), 0)
}

// Cantidad de entrenamientos completados
export function sesionesCompletadas(sesiones = []) {
  return sesiones.filter(s => s.completada).length
}

// Horas totales de esfuerzo (suma de duracion_min de todas las sesiones)
export function horasActivasTotales(sesiones = []) {
  const minutos = sesiones.reduce((acc, s) => acc + (Number(s.duracion_min) || 0), 0)
  return Math.round(minutos / 60)
}

// Cuenta cuántas veces, a lo largo de toda la historia, se batió un récord
// personal por ejercicio (cada vez que un set superó el máximo anterior de ese ejercicio)
export function recordsPersonalesTotal(sesiones = []) {
  const mejoresPorEjercicio = {}
  let total = 0

  const ordenadas = [...sesiones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  for (const s of ordenadas) {
    for (const ej of s.ejercicios || []) {
      const mejorActual = mejoresPorEjercicio[ej.nombre] || 0
      const maxSesion = Math.max(0, ...(ej.series || []).map(set => Number(set.peso) || 0))
      if (maxSesion > mejorActual) {
        mejoresPorEjercicio[ej.nombre] = maxSesion
        total += 1
      }
    }
  }

  return total
}

// Nivel simple en base a la cantidad de entrenamientos completados
export function nivelPorSesiones(cantidadSesiones) {
  if (cantidadSesiones >= 100) return 'Avanzado'
  if (cantidadSesiones >= 25) return 'Intermedio'
  if (cantidadSesiones >= 1) return 'Principiante'
  return 'Recién llegado'
}

// ---------- Gráfico de progreso por ejercicio (Historial) ----------

// Lista de nombres únicos de ejercicios que aparecen en el historial (para el selector)
export function ejerciciosEnHistorial(sesiones = []) {
  const nombres = new Set()
  sesiones.forEach(s => (s.ejercicios || []).forEach(ej => nombres.add(ej.nombre)))
  return Array.from(nombres).sort()
}

// Serie temporal del mejor set (mayor peso) de un ejercicio puntual, sesión por sesión
export function progresoPorEjercicio(sesiones = [], nombreEjercicio) {
  if (!nombreEjercicio) return []
  const puntos = []
  const ordenadas = [...sesiones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  for (const s of ordenadas) {
    const ej = (s.ejercicios || []).find(e => e.nombre === nombreEjercicio)
    if (!ej || !(ej.series || []).length) continue
    const mejorSet = ej.series.reduce((mejor, set) => {
      const peso = Number(set.peso) || 0
      return peso > (mejor?.peso || 0) ? set : mejor
    }, null)
    if (mejorSet) {
      puntos.push({ fecha: s.fecha, peso: Number(mejorSet.peso) || 0, reps: Number(mejorSet.reps) || 0 })
    }
  }
  return puntos
}

// ---------- Heatmap de actividad (últimas N semanas, tipo GitHub) ----------

// Devuelve una grilla de semanas x días con el volumen entrenado cada día,
// terminando en la semana actual (domingo a sábado).
export function datosHeatmap(sesiones = [], semanas = 12) {
  const volumenPorDia = {}
  sesiones.forEach(s => {
    const key = new Date(s.fecha).toDateString()
    const vol = Number(s.volumen_total ?? volumenSesion(s.ejercicios))
    volumenPorDia[key] = (volumenPorDia[key] || 0) + vol
  })

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  // Retrocedemos hasta el domingo de la semana actual, y de ahí `semanas` semanas hacia atrás
  const finSemana = new Date(hoy)
  finSemana.setDate(finSemana.getDate() + (6 - finSemana.getDay()))
  const inicio = new Date(finSemana)
  inicio.setDate(inicio.getDate() - (semanas * 7 - 1))

  const maxVol = Math.max(1, ...Object.values(volumenPorDia))
  const cols = []
  let cursor = new Date(inicio)

  for (let semana = 0; semana < semanas; semana++) {
    const dias = []
    for (let dia = 0; dia < 7; dia++) {
      const key = cursor.toDateString()
      const vol = volumenPorDia[key] || 0
      const futura = cursor > hoy
      dias.push({
        fecha: new Date(cursor),
        volumen: vol,
        intensidad: futura ? -1 : vol === 0 ? 0 : Math.min(4, Math.ceil((vol / maxVol) * 4)),
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    cols.push(dias)
  }
  return cols
}

// ---------- Deload automático sugerido ----------

// Agrupa el volumen total en semanas completas (lunes a domingo), sin incluir
// la semana actual (que todavía está en curso). Devuelve las últimas `semanas`
// semanas completas, ordenadas de más vieja a más nueva.
export function volumenPorSemana(sesiones = [], semanas = 6) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const diaSemanaHoy = hoy.getDay() === 0 ? 7 : hoy.getDay() // 1 = lunes ... 7 = domingo
  const inicioSemanaActual = new Date(hoy)
  inicioSemanaActual.setDate(inicioSemanaActual.getDate() - (diaSemanaHoy - 1))

  const bloques = []
  for (let i = semanas; i >= 1; i--) {
    const inicio = new Date(inicioSemanaActual)
    inicio.setDate(inicio.getDate() - i * 7)
    const fin = new Date(inicio)
    fin.setDate(fin.getDate() + 6)
    bloques.push({ inicio, fin, volumen: 0, cantidadSesiones: 0 })
  }

  sesiones.forEach(s => {
    const f = new Date(s.fecha)
    const bloque = bloques.find(b => f >= b.inicio && f <= new Date(b.fin.getFullYear(), b.fin.getMonth(), b.fin.getDate(), 23, 59, 59))
    if (!bloque) return
    bloque.volumen += Number(s.volumen_total ?? volumenSesion(s.ejercicios))
    bloque.cantidadSesiones += 1
  })

  return bloques
}

// Detecta si conviene sugerir una semana de descarga (deload): el usuario viene
// entrenando de forma sostenida (varias semanas seguidas, sin bajar el volumen)
// pero no consiguió ningún récord personal en sus últimas sesiones — señal de
// estancamiento/fatiga acumulada más que de falta de esfuerzo.
// Devuelve null si no hay suficiente historial o no aplica, o un objeto
// { semanasSostenidas, mensaje } si conviene sugerirlo.
export function sugerirDeload(sesiones = []) {
  if (sesiones.length < 6) return null

  const semanas = volumenPorSemana(sesiones, 5)
  const semanasConEntreno = semanas.filter(s => s.cantidadSesiones > 0)

  // Necesitamos al menos 3 semanas completas seguidas con entrenamiento
  if (semanasConEntreno.length < 3) return null
  const ultimas3 = semanasConEntreno.slice(-3)
  const sonConsecutivas = ultimas3.every(s => s.cantidadSesiones > 0)
  if (!sonConsecutivas) return null

  // El volumen no debe haber caído de forma marcada semana a semana
  // (si ya bajó el usuario solo, probablemente ya está descargando)
  const vieneSostenido = ultimas3.every((s, i, arr) => i === 0 || s.volumen >= arr[i - 1].volumen * 0.85)
  if (!vieneSostenido) return null

  // ¿Hubo algún récord personal en las últimas sesiones?
  const ordenadasAsc = [...sesiones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const N = Math.min(6, ordenadasAsc.length)
  const recientes = ordenadasAsc.slice(-N)
  const anteriores = ordenadasAsc.slice(0, ordenadasAsc.length - N)

  const mejorAntes = {}
  anteriores.forEach(s => (s.ejercicios || []).forEach(ej => {
    const max = Math.max(0, ...(ej.series || []).map(set => Number(set.peso) || 0))
    if (max > (mejorAntes[ej.nombre] || 0)) mejorAntes[ej.nombre] = max
  }))

  const huboPRReciente = recientes.some(s => (s.ejercicios || []).some(ej => {
    const max = Math.max(0, ...(ej.series || []).map(set => Number(set.peso) || 0))
    return max > (mejorAntes[ej.nombre] || 0)
  }))

  if (huboPRReciente) return null

  return {
    semanasSostenidas: ultimas3.length,
    mensaje: `Llevás ${ultimas3.length} semanas entrenando fuerte sin bajar el volumen, y no sumaste ningún récord en tus últimas sesiones. Puede ser buen momento para una semana de descarga: bajá el peso ~10-20% y las series a la mitad.`,
  }
}

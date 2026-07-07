import { getExerciseInfo } from '../data/exerciseCatalog'

// ---------- Alarma de fin de descanso ----------

// Dispara una vibración corta (si el dispositivo lo soporta) y un beep audible
// generado con Web Audio API (sin archivos de sonido externos), para avisar
// que el descanso llegó a 0 sin que el usuario tenga que estar mirando la pantalla.
export function dispararAlarmaDescanso() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 80, 120])
    }
  } catch (e) {
    // Algunos navegadores/dispositivos no soportan vibrate; no es crítico.
  }

  // Notificación real del sistema operativo (aparece aunque la pantalla esté
  // apagada o la app en segundo plano), usando el service worker que ya
  // registró la PWA. No requiere suscripción push: es local, disparada por el
  // propio dispositivo al llegar el timer a 0, sin pasar por ningún servidor.
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('Descanso terminado', {
          body: 'Ya podés arrancar la próxima serie.',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'fitsync-descanso',
        })
      }).catch(() => {})
    }
  } catch (e) {
    // Notification/SW no disponible; el aviso por vibración/beep sigue funcionando.
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const ahora = ctx.currentTime

    const tocarBeep = (inicio, frecuencia) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(frecuencia, ahora + inicio)
      gain.gain.setValueAtTime(0, ahora + inicio)
      gain.gain.linearRampToValueAtTime(0.25, ahora + inicio + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ahora + inicio + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ahora + inicio)
      osc.stop(ahora + inicio + 0.25)
    }

    tocarBeep(0, 880)
    tocarBeep(0.25, 880)

    // Cerramos el contexto cuando termina de sonar, para no dejar recursos colgando.
    setTimeout(() => ctx.close().catch(() => {}), 700)
  } catch (e) {
    // Web Audio no disponible; el aviso por vibración (si existe) sigue funcionando.
  }
}

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

// ---------- Estimación de calorías (fórmula MET) ----------
// Estimación aproximada, no un dato médico exacto — se etiqueta como tal en la UI.
// MET de fuerza/resistencia según intensidad percibida (RPE): a mayor esfuerzo,
// mayor gasto por minuto. Valores estándar de compendio de actividad física.
function metPorRpe(rpe) {
  if (!rpe || rpe <= 0) return 5.0 // sin RPE registrado: intensidad moderada por defecto
  if (rpe <= 3) return 3.5 // muy liviano
  if (rpe <= 6) return 5.0 // moderado
  if (rpe <= 8) return 6.0 // vigoroso
  return 7.0 // máximo esfuerzo
}

// Calorías estimadas de UNA serie, asumiendo ~40s de esfuerzo activo por serie
// (tiempo bajo tensión típico, sin contar el descanso). kcal/min = MET * 3.5 * kg / 200
export function caloriasPorSerie(rpe, pesoCorporalKg = 75) {
  const met = metPorRpe(rpe)
  const minutosActivos = 40 / 60
  return (met * 3.5 * pesoCorporalKg / 200) * minutosActivos
}

// Calorías estimadas de la sesión completa, a partir de la duración total y el
// RPE promedio de todas las series registradas (más preciso que sumar por serie
// porque incluye el tiempo de descanso real, a un MET más bajo).
export function caloriasSesion(ejercicios = [], duracionMin = 0, pesoCorporalKg = 75) {
  const todasLasSeries = ejercicios.flatMap(ej => ej.series || [])
  const rpes = todasLasSeries.map(s => Number(s.rpe)).filter(r => r > 0)
  const rpePromedio = rpes.length ? rpes.reduce((a, b) => a + b, 0) / rpes.length : 0

  // Durante la sesión hay tramos activos (MET alto) y de descanso entre series
  // (MET bajo, ~2.0). Repartimos 40% activo / 60% descanso como aproximación.
  const metActivo = metPorRpe(rpePromedio)
  const metDescanso = 2.0
  const metPromedioSesion = metActivo * 0.4 + metDescanso * 0.6

  return Math.round(metPromedioSesion * 3.5 * pesoCorporalKg / 200 * duracionMin)
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

// ---------- Coach por ejercicio (pantalla de pre-serie) ----------

// Historial de un ejercicio puntual, un registro por sesión donde apareció,
// ordenado de más viejo a más nuevo.
function registrosEjercicio(sesiones = [], nombreEjercicio) {
  return sesiones
    .filter(s => (s.ejercicios || []).some(e => e.nombre === nombreEjercicio))
    .map(s => {
      const ej = s.ejercicios.find(e => e.nombre === nombreEjercicio)
      const series = ej.series || []
      const maxPeso = Math.max(0, ...series.map(set => Number(set.peso) || 0))
      return { fecha: s.fecha, series, maxPeso }
    })
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
}

// Analiza el historial reciente de un ejercicio y devuelve UNA sola señal de
// coach (la más relevante, según prioridad), o null si no hay nada para decir.
// `ejercicio` es el objeto de la rutina: { nombre, series_objetivo, reps_objetivo }.
export function analizarCoachEjercicio(sesiones = [], ejercicio) {
  if (!ejercicio?.nombre) return null
  const registros = registrosEjercicio(sesiones, ejercicio.nombre)
  if (registros.length < 2) return null // no hay suficiente historial para comparar

  const objetivoSeries = ejercicio.series_objetivo || 0
  const objetivoReps = ejercicio.reps_objetivo || 0
  const ultimos2 = registros.slice(-2)
  const ultimos3 = registros.slice(-3)
  const ultimos4 = registros.slice(-4)

  const cumpleObjetivo = (r) =>
    objetivoSeries > 0 && objetivoReps > 0 &&
    r.series.length >= objetivoSeries &&
    r.series.every(s => Number(s.reps) >= objetivoReps)

  const firma = (r) => r.series.map(s => `${s.peso}x${s.reps}`).join(',')

  // 1) Listo para subir peso: mismo peso y cumplió el objetivo de reps en las
  //    últimas 2 sesiones seguidas.
  if (
    objetivoReps > 0 &&
    ultimos2.length === 2 &&
    ultimos2[0].maxPeso > 0 &&
    ultimos2.every(r => r.maxPeso === ultimos2[0].maxPeso) &&
    ultimos2.every(cumpleObjetivo)
  ) {
    return {
      tipo: 'listo_subir',
      icono: 'trending_up',
      titulo: 'Listo para subir peso',
      mensaje: `Cumpliste de sobra el objetivo de reps con ${formatKg(ultimos2[0].maxPeso)} kg las últimas ${ultimos2.length} veces. Probá subir la carga en esta sesión.`,
    }
  }

  // 2) Repetición idéntica sin variación: mismo peso Y mismas reps exactas,
  //    3 sesiones seguidas (ni siquiera una micro-variación).
  if (ultimos3.length === 3) {
    const primeraFirma = firma(ultimos3[0])
    if (primeraFirma && ultimos3.every(r => firma(r) === primeraFirma) && ultimos3[0].maxPeso > 0) {
      return {
        tipo: 'repeticion_identica',
        icono: 'repeat',
        titulo: 'Siempre la misma carga',
        mensaje: `Repetiste exactamente la misma carga y reps las últimas ${ultimos3.length} veces. Metele algo de variación: subí el peso, las reps, o probá una alternativa.`,
      }
    }
  }

  // 3) Estancamiento de peso: mismo peso máximo en las últimas 3 sesiones
  //    (aunque las reps hayan variado un poco).
  if (ultimos3.length === 3 && ultimos3[0].maxPeso > 0 && ultimos3.every(r => r.maxPeso === ultimos3[0].maxPeso)) {
    return {
      tipo: 'estancamiento',
      icono: 'trending_flat',
      titulo: 'Peso estancado',
      mensaje: `Hace ${ultimos3.length} sesiones que hacés ${ejercicio.nombre} con ${formatKg(ultimos3[0].maxPeso)} kg. Probá subir un escalón la próxima serie.`,
    }
  }

  // 4) Objetivo difícil: hace varias sesiones que no completás series/reps objetivo.
  if (objetivoSeries > 0 && objetivoReps > 0 && ultimos4.length >= 3) {
    const todasIncompletas = ultimos4.every(r => !cumpleObjetivo(r))
    if (todasIncompletas) {
      return {
        tipo: 'objetivo_dificil',
        icono: 'flag',
        titulo: 'Objetivo difícil de alcanzar',
        mensaje: `Hace ${ultimos4.length} sesiones que no completás ${objetivoSeries}×${objetivoReps} en este ejercicio. Puede convenir bajar un poco el objetivo o el peso.`,
      }
    }
  }

  // 5) Regresión: bajó el peso máximo respecto a la sesión inmediatamente anterior.
  const masReciente = registros[registros.length - 1]
  const anterior = registros[registros.length - 2]
  if (masReciente.maxPeso > 0 && anterior.maxPeso > 0 && masReciente.maxPeso < anterior.maxPeso) {
    return {
      tipo: 'regresion',
      icono: 'trending_down',
      titulo: 'Bajaste un poco',
      mensaje: `Bajaste de ${formatKg(anterior.maxPeso)} kg a ${formatKg(masReciente.maxPeso)} kg respecto a la sesión anterior. Puede ser una mala recuperación puntual, o fue a propósito — vos sabés.`,
    }
  }

  return null
}

// ---------- Ejercicios abandonados (Home) ----------

// Detecta ejercicios que forman parte de las rutinas activas del usuario pero
// que hace más de `diasUmbral` días que no se registran en ninguna sesión.
// Solo avisa sobre ejercicios que alguna vez se hicieron (si nunca se hizo,
// no es "abandono", es que todavía no arrancó).
export function ejerciciosAbandonados(sesiones = [], rutinas = [], diasUmbral = 14) {
  const nombresEnRutinas = new Set()
  rutinas.forEach(r => (r.ejercicios || []).forEach(e => nombresEnRutinas.add(e.nombre)))
  if (nombresEnRutinas.size === 0) return []

  const ultimaFechaPorEjercicio = {}
  sesiones.forEach(s => (s.ejercicios || []).forEach(ej => {
    const f = new Date(s.fecha)
    if (!ultimaFechaPorEjercicio[ej.nombre] || f > ultimaFechaPorEjercicio[ej.nombre]) {
      ultimaFechaPorEjercicio[ej.nombre] = f
    }
  }))

  const hoy = new Date()
  const resultado = []
  nombresEnRutinas.forEach(nombre => {
    const ultima = ultimaFechaPorEjercicio[nombre]
    if (!ultima) return
    const dias = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24))
    if (dias >= diasUmbral) resultado.push({ nombre, dias })
  })

  return resultado.sort((a, b) => b.dias - a.dias)
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

// ---------- Balance muscular semanal ----------

// Colapsa los grupos musculares detallados del catálogo (ej. "Piernas / Cuádriceps",
// "Hombros / Deltoides posterior") en 5 categorías amplias, para poder graficar
// de un vistazo si algún patrón de movimiento quedó descuidado en la semana.
function grupoAmplio(grupoDetallado = '') {
  const g = grupoDetallado.toLowerCase()
  if (g.includes('pierna')) return 'Piernas'
  if (g.includes('core') || g.includes('abdomen') || g.includes('oblicuo')) return 'Core'
  if (g.includes('empuje') || g.includes('tríceps') || g.includes('triceps') || g.includes('deltoides anterior')) return 'Empuje'
  if (
    g.includes('tracción') || g.includes('traccion') || g.includes('espalda') ||
    g.includes('bíceps') || g.includes('biceps') || g.includes('trapecio') || g.includes('posterior')
  ) return 'Tracción'
  return 'Otro'
}

const CATEGORIAS_BALANCE = ['Empuje', 'Tracción', 'Piernas', 'Core', 'Otro']

// Volumen total levantado en la semana actual (lunes a hoy), agrupado por
// categoría de movimiento (Empuje / Tracción / Piernas / Core / Otro), usando
// el catálogo de ejercicios (+ personalizados) para saber a qué grupo pertenece
// cada ejercicio registrado.
export function volumenPorGrupoSemana(sesiones = [], personalizados = []) {
  const hoy = new Date()
  const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay() // 1 = lunes ... 7 = domingo
  const inicio = new Date(hoy)
  inicio.setHours(0, 0, 0, 0)
  inicio.setDate(inicio.getDate() - (diaSemana - 1))

  const totales = {}
  CATEGORIAS_BALANCE.forEach(c => { totales[c] = 0 })

  sesiones.forEach(s => {
    const f = new Date(s.fecha)
    if (f < inicio) return
    ;(s.ejercicios || []).forEach(ej => {
      const info = getExerciseInfo(ej.nombre, personalizados)
      const categoria = grupoAmplio(info?.grupo || '')
      const volumenEjercicio = (ej.series || []).reduce(
        (acc, set) => acc + (Number(set.peso) || 0) * (Number(set.reps) || 0), 0
      )
      totales[categoria] += volumenEjercicio
    })
  })

  return CATEGORIAS_BALANCE.map(categoria => ({ categoria, volumen: totales[categoria] }))
}

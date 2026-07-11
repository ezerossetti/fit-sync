// Sistema de logros — reglas declarativas sobre stats ya calculadas del
// historial, sin backend nuevo (todo se deriva de /sesiones que ya se trae
// en Perfil, EntrenamientoActivo, etc). Cada logro es un umbral simple sobre
// una métrica (statKey), lo que permite reusar el mismo catálogo tanto para
// pintar la grilla de logros en Perfil como para detectar "logros nuevos"
// al terminar una sesión (para mostrarlos en la tarjeta compartible).
import {
  volumenTotalHistorico, sesionesCompletadas, horasActivasTotales,
  recordsPersonalesTotal, ejerciciosEnHistorial, calcularRachaMaxima, volumenSesion,
} from '../utils/helpers'

// nivel: solo afecta el color/insignia visual (bronce/plata/oro/platino)
export const LOGROS = [
  // ---- Constancia (cantidad de sesiones) ----
  { id: 'primera_sesion', titulo: 'Primer paso', descripcion: 'Completá tu primera sesión', icono: 'flag', statKey: 'sesiones', objetivo: 1, nivel: 'bronce' },
  { id: 'sesiones_10', titulo: 'Constancia', descripcion: 'Completá 10 sesiones', icono: 'event_repeat', statKey: 'sesiones', objetivo: 10, nivel: 'bronce' },
  { id: 'sesiones_25', titulo: 'Comprometido', descripcion: 'Completá 25 sesiones', icono: 'calendar_month', statKey: 'sesiones', objetivo: 25, nivel: 'plata' },
  { id: 'sesiones_50', titulo: 'Veterano', descripcion: 'Completá 50 sesiones', icono: 'shield', statKey: 'sesiones', objetivo: 50, nivel: 'plata' },
  { id: 'sesiones_100', titulo: 'Centurión', descripcion: 'Completá 100 sesiones', icono: 'workspace_premium', statKey: 'sesiones', objetivo: 100, nivel: 'oro' },

  // ---- Racha (días consecutivos, la mejor racha histórica) ----
  { id: 'racha_3', titulo: 'Buen arranque', descripcion: 'Encadená 3 días seguidos entrenando', icono: 'local_fire_department', statKey: 'rachaMaxima', objetivo: 3, nivel: 'bronce' },
  { id: 'racha_7', titulo: 'Semana perfecta', descripcion: 'Encadená 7 días seguidos', icono: 'local_fire_department', statKey: 'rachaMaxima', objetivo: 7, nivel: 'plata' },
  { id: 'racha_14', titulo: 'Dos semanas de fuego', descripcion: 'Encadená 14 días seguidos', icono: 'local_fire_department', statKey: 'rachaMaxima', objetivo: 14, nivel: 'oro' },
  { id: 'racha_30', titulo: 'Hábito de hierro', descripcion: 'Encadená 30 días seguidos', icono: 'whatshot', statKey: 'rachaMaxima', objetivo: 30, nivel: 'platino' },

  // ---- Volumen acumulado ----
  { id: 'volumen_10t', titulo: '10 toneladas', descripcion: 'Acumulá 10.000 kg de volumen total', icono: 'fitness_center', statKey: 'volumenTotal', objetivo: 10000, nivel: 'bronce' },
  { id: 'volumen_50t', titulo: '50 toneladas', descripcion: 'Acumulá 50.000 kg de volumen total', icono: 'fitness_center', statKey: 'volumenTotal', objetivo: 50000, nivel: 'plata' },
  { id: 'volumen_100t', titulo: '100 toneladas', descripcion: 'Acumulá 100.000 kg de volumen total', icono: 'fitness_center', statKey: 'volumenTotal', objetivo: 100000, nivel: 'oro' },
  { id: 'volumen_250t', titulo: 'Cuarto de millón', descripcion: 'Acumulá 250.000 kg de volumen total', icono: 'fitness_center', statKey: 'volumenTotal', objetivo: 250000, nivel: 'platino' },

  // ---- Récords personales ----
  { id: 'pr_1', titulo: 'Primer récord', descripcion: 'Superá tu primer PR', icono: 'trophy', statKey: 'prs', objetivo: 1, nivel: 'bronce' },
  { id: 'pr_10', titulo: 'Rompe récords', descripcion: 'Superá 10 PRs en total', icono: 'trophy', statKey: 'prs', objetivo: 10, nivel: 'plata' },
  { id: 'pr_25', titulo: 'Máquina de récords', descripcion: 'Superá 25 PRs en total', icono: 'trophy', statKey: 'prs', objetivo: 25, nivel: 'oro' },

  // ---- Tiempo activo ----
  { id: 'horas_10', titulo: '10 horas activas', descripcion: 'Acumulá 10 horas de entrenamiento', icono: 'schedule', statKey: 'horas', objetivo: 10, nivel: 'bronce' },
  { id: 'horas_50', titulo: '50 horas activas', descripcion: 'Acumulá 50 horas de entrenamiento', icono: 'schedule', statKey: 'horas', objetivo: 50, nivel: 'plata' },
  { id: 'horas_100', titulo: '100 horas activas', descripcion: 'Acumulá 100 horas de entrenamiento', icono: 'schedule', statKey: 'horas', objetivo: 100, nivel: 'oro' },

  // ---- Exploración (variedad de ejercicios) ----
  { id: 'exploracion_10', titulo: 'Explorador', descripcion: 'Registrá 10 ejercicios distintos', icono: 'explore', statKey: 'ejerciciosDistintos', objetivo: 10, nivel: 'bronce' },
  { id: 'exploracion_25', titulo: 'Todo terreno', descripcion: 'Registrá 25 ejercicios distintos', icono: 'travel_explore', statKey: 'ejerciciosDistintos', objetivo: 25, nivel: 'plata' },

  // ---- Hábitos / horarios ----
  { id: 'finde_10', titulo: 'Guerrero de finde', descripcion: 'Entrená 10 veces un sábado o domingo', icono: 'weekend', statKey: 'sesionesFinDeSemana', objetivo: 10, nivel: 'bronce' },
  { id: 'madrugador_5', titulo: 'Madrugador', descripcion: 'Entrená 5 veces antes de las 7am', icono: 'wb_twilight', statKey: 'sesionesMadrugada', objetivo: 5, nivel: 'bronce' },
  { id: 'nocturno_5', titulo: 'Búho nocturno', descripcion: 'Entrená 5 veces después de las 21h', icono: 'bedtime', statKey: 'sesionesNoche', objetivo: 5, nivel: 'bronce' },

  // ---- Sesión individual ----
  { id: 'sesion_monstruo', titulo: 'Sesión monstruo', descripcion: 'Levantá 3.000 kg de volumen en una sola sesión', icono: 'bolt', statKey: 'volumenMaxSesion', objetivo: 3000, nivel: 'plata' },
]

export const NIVEL_COLOR = {
  bronce: '#C97A3D',
  plata: '#A8ADB8',
  oro: '#E3B341',
  platino: '#29B0E8',
}

// Calcula todas las métricas base sobre las que se evalúan los logros, a
// partir del historial de sesiones. Se centraliza acá para no recorrer el
// historial una vez por logro.
export function calcularStatsLogros(sesiones = []) {
  const sesionesFinDeSemana = sesiones.filter(s => {
    const dia = new Date(s.fecha).getDay()
    return dia === 0 || dia === 6
  }).length
  const sesionesMadrugada = sesiones.filter(s => new Date(s.fecha).getHours() < 7).length
  const sesionesNoche = sesiones.filter(s => new Date(s.fecha).getHours() >= 21).length
  const volumenMaxSesion = sesiones.reduce((max, s) => {
    const vol = Number(s.volumen_total ?? volumenSesion(s.ejercicios))
    return vol > max ? vol : max
  }, 0)

  return {
    sesiones: sesionesCompletadas(sesiones),
    volumenTotal: volumenTotalHistorico(sesiones),
    prs: recordsPersonalesTotal(sesiones),
    horas: horasActivasTotales(sesiones),
    ejerciciosDistintos: ejerciciosEnHistorial(sesiones).length,
    rachaMaxima: calcularRachaMaxima(sesiones),
    sesionesFinDeSemana,
    sesionesMadrugada,
    sesionesNoche,
    volumenMaxSesion,
  }
}

// Devuelve el catálogo completo con el estado de cada logro (desbloqueado o
// no) y el progreso (0-1) para poder mostrar una barra en los bloqueados.
export function calcularLogros(sesiones = []) {
  const stats = calcularStatsLogros(sesiones)
  return LOGROS.map(logro => {
    const actual = stats[logro.statKey] || 0
    return {
      ...logro,
      actual,
      desbloqueado: actual >= logro.objetivo,
      progreso: Math.min(1, actual / logro.objetivo),
    }
  })
}

// Compara el historial ANTES de una sesión con el historial DESPUÉS
// (incluyéndola) y devuelve los logros que se desbloquearon justo con esa
// sesión — pensado para la pantalla de resumen y la tarjeta compartible.
export function logrosNuevos(historialPrevio = [], sesionNueva) {
  if (!sesionNueva) return []
  const antes = calcularLogros(historialPrevio)
  const despues = calcularLogros([...historialPrevio, sesionNueva])
  const idsAntes = new Set(antes.filter(l => l.desbloqueado).map(l => l.id))
  return despues.filter(l => l.desbloqueado && !idsAntes.has(l.id))
}

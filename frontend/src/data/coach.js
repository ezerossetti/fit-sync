// Modo Coach — sugerencias simples basadas en el catálogo de ejercicios.
// No usa IA en runtime: son reglas sobre EXERCISE_CATALOG (+ ejercicios propios
// del usuario), rápido, sin costo, sin latencia. Distinto del generador de
// Coach Chiche (ese sí pega a Groq y arma una rutina 100% a medida charlando).
import { EXERCISE_CATALOG, normalizarPersonalizado } from './exerciseCatalog'
import { sesionesCompletadas, nivelPorSesiones, volumenPorGrupoSemana } from '../utils/helpers'

// Extrae la categoría amplia del grupo (ej: "Piernas / Cuádriceps" -> "Piernas")
function categoriaAmplia(grupo = '') {
  return grupo.split('/')[0].trim()
}

// Sugiere ejercicios alternativos para reemplazar uno dado.
// 1) Busca primero en el mismo subgrupo exacto (estímulo más parecido).
// 2) Si no hay suficientes, amplía a la categoría general.
export function sugerirAlternativas(nombreActual, grupoActual, cantidad = 4) {
  if (!grupoActual) return []

  const mismosSubgrupo = EXERCISE_CATALOG.filter(
    e => e.grupo === grupoActual && e.nombre !== nombreActual
  )

  if (mismosSubgrupo.length >= cantidad) {
    return mismosSubgrupo.slice(0, cantidad)
  }

  const categoria = categoriaAmplia(grupoActual)
  const mismaCategoria = EXERCISE_CATALOG.filter(
    e => categoriaAmplia(e.grupo) === categoria &&
      e.nombre !== nombreActual &&
      !mismosSubgrupo.includes(e)
  )

  return [...mismosSubgrupo, ...mismaCategoria].slice(0, cantidad)
}

// ---------- Generador de rutinas sugeridas por tipo de split ----------

function porGrupo(pool, ...prefijos) {
  return pool.filter(e => prefijos.some(p => e.grupo.startsWith(p)))
}

// Mismo criterio de series/reps que usa el prompt de generar_rutina del coach IA,
// para que la sugerencia local no quede desactualizada respecto a tu nivel real.
function seriesRepsPorNivel(nivel) {
  if (nivel === 'Avanzado') return { series: 5, reps: 7 }
  if (nivel === 'Intermedio') return { series: 4, reps: 9 }
  return { series: 3, reps: 11 } // Principiante / Recién llegado
}

// Elige un ejercicio de la lista dada, evitando:
// 1) repetir un ejercicio ya elegido en esta misma sugerencia, y
// 2) (si hay alternativa) uno que ya esté en alguna de tus rutinas actuales,
//    para que "Generar rutina sugerida" te dé variedad real en vez de
//    repetirte siempre el mismo ejercicio de tu rutina de toda la vida.
// Si no queda ningún candidato "nuevo", cae de vuelta a repetir antes que
// dejar el hueco vacío. Entre los candidatos válidos, elige al azar (antes
// siempre era el primero del array, así que la sugerencia era idéntica cada vez).
function elegir(lista, usados, enRutinasActuales) {
  const disponibles = lista.filter(e => !usados.has(e.nombre))
  if (disponibles.length === 0) return null
  const nuevos = disponibles.filter(e => !enRutinasActuales.has(e.nombre))
  const pool = nuevos.length > 0 ? nuevos : disponibles
  return pool[Math.floor(Math.random() * pool.length)]
}

// Categorías usadas por el split Full Body, con sus prefijos de grupo del catálogo.
const CATEGORIAS_FULL_BODY = {
  Piernas: ['Piernas / Cuádriceps', 'Piernas / Cadena posterior', 'Piernas / Isquiotibiales', 'Piernas / Glúteos', 'Piernas / Unilateral', 'Piernas / Gemelos'],
  Empuje: ['Empuje'],
  Tracción: ['Tracción'],
  Core: ['Core'],
  Hombros: ['Hombros'],
}

const SPLITS = {
  full_body: {
    label: 'Full Body',
    descripcion: 'Rutina de cuerpo completo, ideal para entrenar 3 veces por semana.',
  },
  push: {
    label: 'Empuje (Push)',
    descripcion: 'Pecho, hombros y tríceps.',
    grupos: [
      ['Empuje / Pecho'],
      ['Empuje / Pecho'],
      ['Empuje / Hombros'],
      ['Brazos / Tríceps'],
      ['Hombros / Deltoides lateral'],
    ],
  },
  pull: {
    label: 'Tracción (Pull)',
    descripcion: 'Espalda y bíceps.',
    grupos: [
      ['Tracción / Espalda', 'Tracción / Cadena posterior'],
      ['Tracción / Espalda'],
      ['Tracción / Cadena posterior'],
      ['Brazos / Bíceps'],
      ['Espalda / Hombro posterior'],
    ],
  },
  piernas: {
    label: 'Piernas (Legs)',
    descripcion: 'Cuádriceps, isquiotibiales y glúteos.',
    grupos: [
      ['Piernas / Cuádriceps'],
      ['Piernas / Isquiotibiales'],
      ['Piernas / Glúteos'],
      ['Piernas / Unilateral'],
      ['Piernas / Gemelos'],
    ],
  },
}

export function tiposDeSplit() {
  return Object.entries(SPLITS).map(([id, s]) => ({ id, label: s.label, descripcion: s.descripcion }))
}

// Genera una lista de ejercicios (formato compatible con el ExerciseBuilder de Rutinas.jsx).
// `contexto` es opcional para no romper compatibilidad, pero si se pasa permite:
// - incluir tus ejercicios personalizados como candidatos válidos,
// - no repetir ejercicios que ya tenés en tus rutinas actuales (si hay alternativa),
// - ajustar series/reps según tu nivel de experiencia real,
// - en Full Body, priorizar con una serie extra el grupo muscular más descuidado
//   de la semana (en vez del quinto ejercicio fijo "Hombros" de siempre).
export function generarRutinaSugerida(splitId, contexto = {}) {
  const split = SPLITS[splitId]
  if (!split) return []

  const { personalizados = [], rutinas = [], sesiones = [] } = contexto
  const pool = [...EXERCISE_CATALOG, ...personalizados.map(normalizarPersonalizado)]
  const nombresEnRutinas = new Set(rutinas.flatMap(r => (r.ejercicios || []).map(e => e.nombre)))
  const nivel = nivelPorSesiones(sesionesCompletadas(sesiones))
  const { series, reps } = seriesRepsPorNivel(nivel)

  let candidatosPorSlot

  if (splitId === 'full_body') {
    const categoriasBase = ['Piernas', 'Empuje', 'Tracción', 'Core']
    const balance = volumenPorGrupoSemana(sesiones, personalizados)
    const volPorCategoria = Object.fromEntries(balance.map(b => [b.categoria, b.volumen]))

    // La categoría base con menos volumen esta semana se lleva el quinto
    // ejercicio extra. Si todas tienen algo de volumen (nadie en 0 claro),
    // el quinto slot vuelve a ser "Hombros" como antes, para no forzar
    // una segunda vuelta de piernas dos días seguidos sin motivo real.
    const masDescuidada = categoriasBase.reduce(
      (min, c) => ((volPorCategoria[c] ?? 0) < (volPorCategoria[min] ?? 0) ? c : min),
      categoriasBase[0]
    )
    const bonusSlot = (volPorCategoria[masDescuidada] || 0) === 0 ? masDescuidada : 'Hombros'

    candidatosPorSlot = [...categoriasBase, bonusSlot].map(cat =>
      porGrupo(pool, ...CATEGORIAS_FULL_BODY[cat])
    )
  } else {
    candidatosPorSlot = split.grupos.map(prefijos => porGrupo(pool, ...prefijos))
  }

  const usados = new Set()
  const ejercicios = []

  for (const candidatos of candidatosPorSlot) {
    const elegido = elegir(candidatos, usados, nombresEnRutinas)
    if (!elegido) continue
    usados.add(elegido.nombre)
    ejercicios.push({
      nombre: elegido.nombre,
      grupo: elegido.grupo,
      series_objetivo: series,
      reps_objetivo: reps,
    })
  }

  return ejercicios
}

// Modo Coach — sugerencias simples basadas en el catálogo de ejercicios.
// No usa IA en runtime: son reglas sobre EXERCISE_CATALOG (rápido, sin costo, sin latencia).
import { EXERCISE_CATALOG } from './exerciseCatalog'

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

function porGrupo(...prefijos) {
  return EXERCISE_CATALOG.filter(e => prefijos.some(p => e.grupo.startsWith(p)))
}

const SPLITS = {
  full_body: {
    label: 'Full Body',
    descripcion: 'Rutina de cuerpo completo, ideal para entrenar 3 veces por semana.',
    construir: () => [
      pick(porGrupo('Piernas / Cuádriceps', 'Piernas / Cadena posterior')),
      pick(porGrupo('Empuje')),
      pick(porGrupo('Tracción')),
      pick(porGrupo('Hombros')),
      pick(porGrupo('Core')),
    ],
  },
  push: {
    label: 'Empuje (Push)',
    descripcion: 'Pecho, hombros y tríceps.',
    construir: () => [
      pick(porGrupo('Empuje / Pecho'), 0),
      pick(porGrupo('Empuje / Pecho'), 1),
      pick(porGrupo('Empuje / Hombros')),
      pick(porGrupo('Brazos / Tríceps')),
      pick(porGrupo('Hombros / Deltoides lateral')),
    ],
  },
  pull: {
    label: 'Tracción (Pull)',
    descripcion: 'Espalda y bíceps.',
    construir: () => [
      pick(porGrupo('Tracción / Espalda', 'Tracción / Cadena posterior'), 0),
      pick(porGrupo('Tracción / Espalda'), 1),
      pick(porGrupo('Tracción / Cadena posterior')),
      pick(porGrupo('Brazos / Bíceps')),
      pick(porGrupo('Espalda / Hombro posterior')),
    ],
  },
  piernas: {
    label: 'Piernas (Legs)',
    descripcion: 'Cuádriceps, isquiotibiales y glúteos.',
    construir: () => [
      pick(porGrupo('Piernas / Cuádriceps'), 0),
      pick(porGrupo('Piernas / Isquiotibiales')),
      pick(porGrupo('Piernas / Glúteos')),
      pick(porGrupo('Piernas / Unilateral')),
      pick(porGrupo('Piernas / Gemelos')),
    ],
  },
}

function pick(lista, indiceDesde = 0) {
  return lista[indiceDesde] || lista[0]
}

export function tiposDeSplit() {
  return Object.entries(SPLITS).map(([id, s]) => ({ id, label: s.label, descripcion: s.descripcion }))
}

// Genera una lista de ejercicios (formato compatible con el ExerciseBuilder de Rutinas.jsx)
export function generarRutinaSugerida(splitId) {
  const split = SPLITS[splitId]
  if (!split) return []

  const elegidos = split.construir().filter(Boolean)
  const nombresUsados = new Set()
  const ejercicios = []

  for (const ex of elegidos) {
    if (!ex || nombresUsados.has(ex.nombre)) continue
    nombresUsados.add(ex.nombre)
    ejercicios.push({
      nombre: ex.nombre,
      grupo: ex.grupo,
      series_objetivo: 3,
      reps_objetivo: 10,
    })
  }
  return ejercicios
}

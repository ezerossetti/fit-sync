// Catálogo bilingüe de ejercicios — Insight #1 de C4:
// UI siempre en español formal, pero la búsqueda acepta sinónimos en inglés y acrónimos (PB, 1RM, RDL).
export const EXERCISE_CATALOG = [
  { nombre: 'Peso muerto', sinonimos: ['deadlift'], grupo: 'Espalda / Piernas' },
  { nombre: 'Peso muerto rumano', sinonimos: ['rdl', 'romanian deadlift'], grupo: 'Piernas' },
  { nombre: 'Press de banca plano', sinonimos: ['bench press', 'press banca'], grupo: 'Pecho' },
  { nombre: 'Press de banca inclinado', sinonimos: ['incline bench press'], grupo: 'Pecho' },
  { nombre: 'Sentadilla', sinonimos: ['squat', 'back squat'], grupo: 'Piernas' },
  { nombre: 'Sentadilla frontal', sinonimos: ['front squat'], grupo: 'Piernas' },
  { nombre: 'Press militar', sinonimos: ['overhead press', 'ohp'], grupo: 'Hombros' },
  { nombre: 'Remo con barra', sinonimos: ['barbell row'], grupo: 'Espalda' },
  { nombre: 'Dominadas', sinonimos: ['pull up', 'pullup'], grupo: 'Espalda' },
  { nombre: 'Curl de bíceps', sinonimos: ['bicep curl'], grupo: 'Brazos' },
  { nombre: 'Extensión de tríceps', sinonimos: ['tricep extension'], grupo: 'Brazos' },
  { nombre: 'Zancadas', sinonimos: ['lunges'], grupo: 'Piernas' },
  { nombre: 'Hip thrust', sinonimos: ['empuje de cadera'], grupo: 'Piernas' },
  { nombre: 'Fondos', sinonimos: ['dips'], grupo: 'Pecho / Brazos' },
  { nombre: 'Elevaciones laterales', sinonimos: ['lateral raises'], grupo: 'Hombros' },
]

export function searchExercises(query) {
  const q = query.trim().toLowerCase()
  if (!q) return EXERCISE_CATALOG
  return EXERCISE_CATALOG.filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    e.sinonimos.some(s => s.toLowerCase().includes(q))
  )
}

// Integración con free-exercise-db (github.com/yuhonas/free-exercise-db).
// El dataset completo (873 ejercicios, sin instrucciones para achicar el peso) vive
// en /public/data/exercises-db.json y se sirve como asset estático — no pega a GitHub
// en cada carga, solo las imágenes (que sí salen de raw.githubusercontent.com).
//
// Insight clave (mismo patrón que la validación de "Guardar rutina" del coach):
// nunca inventamos una foto para un ejercicio que no matcheamos con confianza.
// Si no hay match bueno, se devuelve null y la UI cae al ícono placeholder.

const RAW_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

// Mapeo curado a mano: nombre del catálogo propio (EXERCISE_CATALOG) -> id exacto
// en free-exercise-db. Se armó revisando candidatos reales del dataset para evitar
// falsos positivos típicos de un matching automático (ej: "Sentadilla" -> "Box Squat"
// en vez de "Barbell Squat", o "Peso muerto" -> "Car Deadlift").
const CURATED_MAP = {
  'Peso muerto': 'Barbell_Deadlift',
  'Peso muerto rumano': 'Romanian_Deadlift',
  'Press de banca plano': 'Barbell_Bench_Press_-_Medium_Grip',
  'Press de banca inclinado': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Sentadilla': 'Barbell_Squat',
  'Sentadilla frontal': 'Front_Barbell_Squat',
  'Press militar': 'Standing_Military_Press',
  'Remo con barra': 'Bent_Over_Barbell_Row',
  'Dominadas': 'Pullups',
  'Curl de bíceps': 'Barbell_Curl',
  'Extensión de tríceps': 'Triceps_Pushdown',
  'Zancadas': 'Dumbbell_Lunges',
  'Hip thrust': 'Barbell_Hip_Thrust',
  'Fondos': 'Bench_Dips',
  'Elevaciones laterales': 'Side_Lateral_Raise',
  'Prensa de piernas': 'Leg_Press',
  'Sentadilla búlgara': 'Split_Squat_with_Dumbbells',
  'Extensión de cuádriceps': 'Leg_Extensions',
  'Curl femoral': 'Lying_Leg_Curls',
  'Elevación de talones de pie': 'Standing_Calf_Raises',
  'Elevación de talones sentado': 'Seated_Calf_Raise',
  'Sentadilla goblet': 'Goblet_Squat',
  'Zancadas caminando': 'Bodyweight_Walking_Lunge',
  'Peso muerto sumo': 'Sumo_Deadlift',
  'Puente de glúteos': 'Barbell_Glute_Bridge',
  'Abducción de cadera': 'Thigh_Abductor',
  'Jalón al pecho': 'Wide-Grip_Lat_Pulldown',
  'Remo con mancuerna a una mano': 'One-Arm_Dumbbell_Row',
  'Remo en polea baja': 'Seated_Cable_Rows',
  'Pull over': 'Bent-Arm_Barbell_Pullover',
  'Remo en T': 'Lying_T-Bar_Row',
  'Face pull': 'Face_Pull',
  'Hiperextensiones': 'Hyperextensions_Back_Extensions',
  'Press de banca declinado': 'Decline_Barbell_Bench_Press',
  'Press con mancuernas': 'Dumbbell_Bench_Press',
  'Aperturas con mancuernas': 'Dumbbell_Flyes',
  'Cruce de poleas': 'Cable_Crossover',
  'Press en máquina': 'Machine_Bench_Press',
  'Flexiones de brazos': 'Pushups',
  'Press militar con mancuernas': 'Dumbbell_Shoulder_Press',
  'Elevaciones frontales': 'Front_Raise_And_Pullover',
  'Elevaciones posteriores': 'Cable_Rear_Delt_Fly',
  'Press Arnold': 'Arnold_Dumbbell_Press',
  'Encogimientos de hombros': 'Barbell_Shrug',
  'Curl con mancuernas alterno': 'Dumbbell_Alternate_Bicep_Curl',
  'Curl martillo': 'Hammer_Curls',
  'Curl en banco Scott': 'Preacher_Curl',
  'Press francés': 'Band_Skull_Crusher',
  'Extensión de tríceps en polea': 'Cable_One_Arm_Tricep_Extension',
  'Fondos en banco': 'Bench_Dips',
  'Curl de muñeca': 'Seated_Palm-Up_Barbell_Wrist_Curl',
  'Plancha abdominal': 'Plank',
  'Crunch abdominal': 'Crunches',
  'Elevación de piernas colgado': 'Hanging_Leg_Raise',
  'Rueda abdominal': 'Ab_Roller',
  'Giro ruso': 'Russian_Twist',
  'Pallof press': 'Pallof_Press',
  'Kettlebell swing': 'One-Arm_Kettlebell_Swings',
  'Saltos al cajón': 'Box_Jump_Multiple_Response',
  'Remo en máquina (cardio)': 'Rowing_Stationary',
  'Escalador (mountain climbers)': 'Mountain_Climbers',
  // 'Burpees' queda sin match: free-exercise-db no tiene una entrada equivalente.
}

let dbPromise = null
let dbById = null

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca acentos
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function loadDb() {
  if (!dbPromise) {
    dbPromise = fetch('/data/exercises-db.json')
      .then(r => {
        if (!r.ok) throw new Error('No se pudo cargar exercises-db.json')
        return r.json()
      })
      .then(list => {
        dbById = new Map(list.map(e => [e.id, e]))
        // índice normalizado por nombre, para el fallback fuzzy
        const byNormName = list.map(e => [normalize(e.name), e])
        dbById._byNormName = byNormName
        return dbById
      })
      .catch(() => {
        dbById = new Map()
        dbById._byNormName = []
        return dbById
      })
  }
  return dbPromise
}

// Fallback para ejercicios sin entrada en CURATED_MAP (típicamente personalizados
// del usuario). Solo devuelve match si es razonablemente confiable: coincidencia
// exacta normalizada, o todas las palabras de un sinónimo contenidas en el nombre
// del ejercicio de la base (se prioriza el nombre más corto = más genérico).
function fuzzyMatch(byNormName, candidatesText) {
  for (const text of candidatesText) {
    const q = normalize(text)
    if (!q) continue
    const exact = byNormName.find(([n]) => n === q)
    if (exact) return exact[1]
  }
  for (const text of candidatesText) {
    const q = normalize(text)
    if (!q) continue
    const qwords = new Set(q.split(' '))
    const subset = byNormName
      .filter(([n]) => {
        const nwords = n.split(' ')
        return qwords.size > 1 ? nwords.length && [...qwords].every(w => nwords.includes(w)) : nwords.includes(q)
      })
      .sort((a, b) => a[0].length - b[0].length)
    if (subset.length) return subset[0][1]
  }
  return null
}

// Devuelve { images: [url, url2], id, name } o null si no hay match confiable.
export async function getExerciseMedia(exerciseCatalogEntry) {
  if (!exerciseCatalogEntry?.nombre) return null
  const db = await loadDb()

  let entry = null
  const curatedId = CURATED_MAP[exerciseCatalogEntry.nombre]
  if (curatedId) {
    entry = db.get(curatedId) || null
  }

  if (!entry && exerciseCatalogEntry.personalizado) {
    const candidates = [exerciseCatalogEntry.nombre, ...(exerciseCatalogEntry.sinonimos || [])]
    entry = fuzzyMatch(db._byNormName || [], candidates)
  }

  if (!entry || !entry.images?.length) return null

  return {
    id: entry.id,
    name: entry.name,
    images: entry.images.map(path => `${RAW_BASE}/${path}`),
  }
}

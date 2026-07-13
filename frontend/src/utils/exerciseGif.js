// Integración con ExerciseDB (https://oss.exercisedb.dev) — tier gratuito,
// uso no comercial, atribución requerida (ver badge en ExerciseMedia.jsx).
// A diferencia de la integración de fotos (free-exercise-db, en public/data/
// como asset estático con un mapeo curado a mano), acá NO hay un JSON
// pre-armado: es una API en vivo pensada para consumirse directo desde el
// cliente ("no sign-up, no API key — just call the endpoint directly"), así
// que el dataset completo (~1500 ejercicios) se trae paginado UNA vez por
// sesión y se cachea en memoria.
//
// Insight clave (mismo principio que ya usa exerciseMedia.js): nunca se
// inventa un GIF para un ejercicio que no matcheamos con confianza. Como acá
// no pudimos verificar un mapeo id-por-id a mano (dataset en inglés, 1500
// entradas), el matching corre sobre los sinónimos en inglés que ya tiene
// EXERCISE_CATALOG — mismo algoritmo "de confianza" que el fallback fuzzy de
// personalizados, pero acá es la estrategia principal. Si en algún momento
// se detecta un match incorrecto para algún ejercicio puntual, se puede forzar
// el id correcto a mano en CURATED_GIF_OVERRIDES de abajo (mismo patrón que
// CURATED_MAP en exerciseMedia.js).
const API_BASE = 'https://oss.exercisedb.dev/api/v1/exercises'

// Overrides manuales por si el matching automático le pifia a algún ejercicio
// puntual. Vacío por ahora — completar con { 'Nombre del catálogo': 'exerciseId' }
// si se detecta un falso positivo (revisando el badge "ExerciseDB" en la app).
const CURATED_GIF_OVERRIDES = {}

let gifDbPromise = null
let byNormName = null

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca acentos
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Trae el dataset completo paginando por cursor, quedándose solo con los
// campos que usamos (para no cargar en memoria las instrucciones en 9 idiomas
// de 1500 ejercicios). Tiene un tope de páginas de seguridad por si la API
// alguna vez deja de mandar hasNextPage: false por algún bug.
async function fetchGifDataset() {
  const items = []
  let cursor = null
  let paginas = 0
  const TOPE_PAGINAS = 80 // 1500 ejercicios / ~20 por página, con margen

  while (paginas < TOPE_PAGINAS) {
    const url = cursor ? `${API_BASE}?cursor=${encodeURIComponent(cursor)}` : API_BASE
    let res
    try {
      res = await fetch(url)
    } catch {
      break // sin conexión o API caída: cortamos acá, se usa lo que se haya juntado (o nada)
    }
    if (!res.ok) break

    const json = await res.json()
    const pagina = json?.data || []
    for (const e of pagina) {
      if (e.exerciseId && e.name && e.gifUrl) {
        items.push({ id: e.exerciseId, name: e.name, gifUrl: e.gifUrl })
      }
    }

    paginas += 1
    if (!json?.meta?.hasNextPage || !json?.meta?.nextCursor || json.meta.nextCursor === cursor) break
    cursor = json.meta.nextCursor
  }

  return items
}

async function loadGifDb() {
  if (!gifDbPromise) {
    gifDbPromise = fetchGifDataset()
      .then(items => {
        byNormName = items.map(e => [normalize(e.name), e])
        return items
      })
      .catch(() => {
        byNormName = []
        return []
      })
  }
  return gifDbPromise
}

// Mismo criterio de confianza que exerciseMedia.js: match exacto normalizado
// primero; si no, todas las palabras del sinónimo deben estar contenidas en
// el nombre candidato (se prioriza el nombre más corto = más genérico).
function fuzzyMatch(candidatesText) {
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

// Devuelve { id, name, gifUrl } o null si no hay match confiable.
export async function getExerciseGif(exerciseCatalogEntry) {
  if (!exerciseCatalogEntry?.nombre) return null
  await loadGifDb()
  if (!byNormName?.length) return null // API no disponible esta sesión: se cae al fallback de fotos

  const overrideId = CURATED_GIF_OVERRIDES[exerciseCatalogEntry.nombre]
  if (overrideId) {
    const items = await gifDbPromise
    const forced = items.find(e => e.id === overrideId)
    if (forced) return forced
  }

  // Sinónimos en inglés primero (el dataset está en inglés), nombre en
  // español al final como último recurso.
  const candidatos = [...(exerciseCatalogEntry.sinonimos || []), exerciseCatalogEntry.nombre]
  return fuzzyMatch(candidatos)
}

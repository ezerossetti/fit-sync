// Pantalla de pre-serie: media del ejercicio, 100% desde exercises-dataset
// (github.com/hasaneyldrm/exercises-dataset). Cada entrada del catálogo trae
// su propio gifUrl/imageUrl ya resuelto (EXTRA_EJERCICIOS del dataset externo,
// o el curado a mano vía gifOverrides.json) — sin matching en runtime, sin
// llamadas a APIs externas de terceros. Si el ejercicio no tiene gifUrl ni
// imageUrl (no hay equivalente en el dataset), mostramos el ícono placeholder.
import { useEffect, useState } from 'react'

export default function ExerciseMedia({ exerciseInfo }) {
  const [gifFailed, setGifFailed] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)

  useEffect(() => {
    setGifFailed(false)
    setPhotoFailed(false)
  }, [exerciseInfo?.nombre])

  const gifUrl = exerciseInfo?.gifUrl
  const imageUrl = exerciseInfo?.imageUrl

  // ---- GIF animado (prioridad 1) ----
  if (gifUrl && !gifFailed) {
    return (
      <div className="card relative h-40 mb-4 overflow-hidden bg-surface-container-high">
        <img
          src={gifUrl}
          alt={exerciseInfo.nombre}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setGifFailed(true)}
        />
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-black/40 backdrop-blur text-white/80 px-2 py-0.5 rounded-full">
          exercises-dataset
        </span>
      </div>
    )
  }

  // ---- Foto estática (prioridad 2, si el GIF no existe o falló al cargar) ----
  if (imageUrl && !photoFailed) {
    return (
      <div className="card relative h-40 mb-4 overflow-hidden bg-surface-container-high">
        <img
          src={imageUrl}
          alt={exerciseInfo.nombre}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setPhotoFailed(true)}
        />
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-black/40 backdrop-blur text-white/80 px-2 py-0.5 rounded-full">
          exercises-dataset
        </span>
      </div>
    )
  }

  // ---- Sin match en el dataset: ícono placeholder ----
  return (
    <div className="card relative h-40 mb-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container">
      <span className="material-symbols-outlined text-on-surface-variant/30 text-[96px]">fitness_center</span>
    </div>
  )
}

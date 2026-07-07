import { useEffect, useState } from 'react'
import { getExerciseMedia } from '../utils/exerciseMedia'

// Pantalla de pre-serie: reemplaza el placeholder estático por fotos reales del
// ejercicio (free-exercise-db) cuando hay match confiable, o cae al ícono si no.
export default function ExerciseMedia({ exerciseInfo }) {
  const [media, setMedia] = useState(undefined) // undefined = cargando, null = sin match
  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelado = false
    setMedia(undefined)
    setIdx(0)
    setFailed(false)
    getExerciseMedia(exerciseInfo).then(m => {
      if (!cancelado) setMedia(m)
    })
    return () => { cancelado = true }
  }, [exerciseInfo?.nombre])

  const sinMedia = media === null || failed || !media?.images?.length

  if (sinMedia) {
    return (
      <div className="card relative h-40 mb-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container">
        <span className="material-symbols-outlined text-on-surface-variant/30 text-[96px]">fitness_center</span>
      </div>
    )
  }

  if (media === undefined) {
    return (
      <div className="card relative h-40 mb-4 overflow-hidden flex items-center justify-center bg-surface-container animate-pulse">
        <span className="material-symbols-outlined text-on-surface-variant/20 text-[64px]">image</span>
      </div>
    )
  }

  const imgs = media.images.slice(0, 2) // free-exercise-db trae 2 fotos (inicio/fin del movimiento)

  return (
    <div className="card relative h-40 mb-4 overflow-hidden bg-surface-container-high">
      <img
        key={imgs[idx]}
        src={imgs[idx]}
        alt={media.name}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
      {imgs.length > 1 && (
        <button
          type="button"
          onClick={() => setIdx(i => (i + 1) % imgs.length)}
          className="absolute inset-0 flex items-center justify-center group"
          aria-label="Ver siguiente foto del ejercicio"
        >
          <span className="w-14 h-14 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/20 opacity-0 group-active:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white text-[26px]">chevron_right</span>
          </span>
        </button>
      )}
      {imgs.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {imgs.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
      <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-black/40 backdrop-blur text-white/80 px-2 py-0.5 rounded-full">
        free-exercise-db
      </span>
    </div>
  )
}

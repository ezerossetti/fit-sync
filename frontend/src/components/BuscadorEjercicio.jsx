import { useState } from 'react'
import { searchExercises } from '../data/exerciseCatalog'

// Buscador de ejercicios: catálogo bilingüe + personalizados del usuario +
// texto libre (si no está catalogado, se puede cargar igual con el nombre
// tal cual lo escribió). onElegir(ej) recibe { nombre, grupo? }.
export default function BuscadorEjercicio({
  personalizados,
  onElegir,
  placeholder = 'Ej: press banca, deadlift, remo...',
  autoFocus = false,
  maxResultados = 8,
}) {
  const [busqueda, setBusqueda] = useState('')
  const resultados = searchExercises(busqueda, personalizados)
  const nombreExacto = busqueda.trim()
  const yaExisteExacto = resultados.some(e => e.nombre.toLowerCase() === nombreExacto.toLowerCase())

  return (
    <div>
      <div className="relative mb-3">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input
          type="text"
          className="input-field pl-10"
          placeholder={placeholder}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoFocus={autoFocus}
        />
      </div>

      <div className="space-y-2">
        {resultados.slice(0, maxResultados).map((ej, i) => (
          <button
            key={i}
            onClick={() => { onElegir(ej); setBusqueda('') }}
            className="w-full card p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent">fitness_center</span>
              <div>
                <p className="text-body-md font-semibold text-on-surface">{ej.nombre}</p>
                <p className="text-label-md text-on-surface-variant">{ej.grupo || 'Personalizado'}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-accent">chevron_right</span>
          </button>
        ))}

        {nombreExacto && !yaExisteExacto && (
          <button
            onClick={() => { onElegir({ nombre: nombreExacto }); setBusqueda('') }}
            className="w-full card p-4 flex items-center gap-3 text-left border-dashed"
          >
            <span className="material-symbols-outlined text-accent">add_circle</span>
            <p className="text-body-md text-on-surface">Agregar "<span className="font-semibold">{nombreExacto}</span>" como ejercicio nuevo</p>
          </button>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import { searchExercises, getExerciseInfo } from '../data/exerciseCatalog'
import { sugerirAlternativas, tiposDeSplit, generarRutinaSugerida } from '../data/coach'
import { useTour } from '../context/TourContext'
import { TOURS } from '../data/tours'

// ---------- Control numérico compacto (- valor +) ----------
function NumberControl({ value, onChange, min = 1 }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-full border border-accent/40 text-accent flex items-center justify-center active:bg-accent/10"
        aria-label="Restar"
      >
        <span className="material-symbols-outlined text-[16px]">remove</span>
      </button>
      <span className="font-mono text-body-md text-on-surface w-6 text-center tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-full border border-accent/40 text-accent flex items-center justify-center active:bg-accent/10"
        aria-label="Sumar"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
      </button>
    </div>
  )
}

// ---------- Constructor de ejercicios de la rutina ----------
function ExerciseBuilder({ ejercicios, setEjercicios, personalizados, onCrearPersonalizado }) {
  const [query, setQuery] = useState('')
  const [alternativasAbiertas, setAlternativasAbiertas] = useState(null) // índice del ejercicio con panel abierto
  const [creandoNuevo, setCreandoNuevo] = useState(false)
  const [grupoNuevo, setGrupoNuevo] = useState('')
  const [guardandoNuevo, setGuardandoNuevo] = useState(false)
  const sugerencias = query.trim() ? searchExercises(query, personalizados).slice(0, 5) : []
  const qTrim = query.trim()
  const hayMatchExacto = sugerencias.some(s => s.nombre.toLowerCase() === qTrim.toLowerCase())

  const agregar = (nombre, grupo) => {
    if (!nombre.trim()) return
    const info = getExerciseInfo(nombre, personalizados)
    setEjercicios([...ejercicios, {
      nombre: nombre.trim(),
      grupo: grupo || info?.grupo || 'Personalizado',
      series_objetivo: 3,
      reps_objetivo: 10,
    }])
    setQuery('')
    setCreandoNuevo(false)
    setGrupoNuevo('')
  }

  const quitar = (idx) => setEjercicios(ejercicios.filter((_, i) => i !== idx))

  const actualizar = (idx, campo, valor) => {
    const copia = [...ejercicios]
    copia[idx] = { ...copia[idx], [campo]: valor }
    setEjercicios(copia)
  }

  const reemplazar = (idx, alternativa) => {
    const copia = [...ejercicios]
    copia[idx] = { ...copia[idx], nombre: alternativa.nombre, grupo: alternativa.grupo }
    setEjercicios(copia)
    setAlternativasAbiertas(null)
  }

  // Ejercicio personalizado persistente: se guarda en el backend (para poder
  // reutilizarlo, verlo en Perfil, y que aparezca en el pre-serie con su info)
  // y se agrega de una a la rutina que se está armando.
  const crearPersonalizado = async () => {
    if (!qTrim) return
    setGuardandoNuevo(true)
    try {
      const grupo = grupoNuevo.trim() || 'Personalizado'
      const creado = await ejerciciosPersonalizadosService.create({ nombre: qTrim, grupo })
      onCrearPersonalizado?.(creado)
      agregar(creado.nombre, creado.grupo)
    } catch (err) {
      console.error(err)
      alert('No se pudo crear el ejercicio personalizado.')
    } finally {
      setGuardandoNuevo(false)
    }
  }

  return (
    <div>
      <label className="text-label-md text-on-surface-variant uppercase">Ejercicios</label>
      <div className="relative mt-1">
        <input
          className="input-field"
          placeholder="Buscar ejercicio (ej: deadlift, sentadilla)"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCreandoNuevo(false) }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), hayMatchExacto ? agregar(query) : null)}
        />
        {sugerencias.length > 0 && (
          <div className="absolute z-10 w-full mt-1 card overflow-hidden">
            {sugerencias.map(s => (
              <button
                key={s.nombre}
                type="button"
                onClick={() => agregar(s.nombre, s.grupo)}
                className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container-high flex items-center justify-between"
              >
                <span>{s.nombre} <span className="text-on-surface-variant text-label-md">· {s.grupo}</span></span>
                {s.personalizado && <span className="material-symbols-outlined text-[14px] text-accent shrink-0 ml-2">star</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {qTrim && !hayMatchExacto && (
        <div className="mt-2">
          {!creandoNuevo ? (
            <button
              type="button"
              onClick={() => setCreandoNuevo(true)}
              className="w-full text-left px-4 py-2.5 rounded-md border border-dashed border-accent/40 text-body-sm text-accent flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Crear "{qTrim}" como ejercicio nuevo
            </button>
          ) : (
            <div className="card p-3 space-y-2">
              <p className="text-body-sm text-on-surface">Nuevo ejercicio: <span className="font-semibold">{qTrim}</span></p>
              <input
                className="input-field"
                placeholder="Grupo muscular (ej: Piernas / Cuádriceps)"
                value={grupoNuevo}
                onChange={(e) => setGrupoNuevo(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setCreandoNuevo(false)} className="flex-1 py-2 text-body-sm text-on-surface-variant">
                  Cancelar
                </button>
                <button type="button" onClick={crearPersonalizado} disabled={guardandoNuevo} className="btn-primary flex-1 py-2 text-body-sm">
                  {guardandoNuevo ? 'Creando...' : 'Crear y agregar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {ejercicios.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant italic mt-3">Todavía no agregaste ejercicios.</p>
      ) : (
        <p className="text-label-md text-accent uppercase mt-4 mb-2">Ejercicios seleccionados</p>
      )}

      <div className="space-y-2.5">
        {ejercicios.map((ej, idx) => {
          const alternativas = ej.grupo ? sugerirAlternativas(ej.nombre, ej.grupo) : []
          const panelAbierto = alternativasAbiertas === idx

          return (
            <div key={idx} className="card p-4 relative">
              <button
                type="button"
                onClick={() => quitar(idx)}
                className="absolute top-3 right-3 w-7 h-7 rounded-md bg-error-container/40 text-error flex items-center justify-center"
                aria-label="Quitar ejercicio"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>

              <p className="text-body-md font-semibold text-on-surface pr-8">{ej.nombre}</p>
              <p className="text-label-md text-on-surface-variant mb-3">{ej.grupo || 'Personalizado'}</p>

              <div className="flex items-center gap-6 mb-3">
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase mb-1">Series</p>
                  <NumberControl value={ej.series_objetivo} onChange={(v) => actualizar(idx, 'series_objetivo', v)} />
                </div>
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase mb-1">Reps</p>
                  <NumberControl value={ej.reps_objetivo} onChange={(v) => actualizar(idx, 'reps_objetivo', v)} />
                </div>
              </div>

              {alternativas.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setAlternativasAbiertas(panelAbierto ? null : idx)}
                    className="flex items-center gap-1 text-label-md text-accent uppercase"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    Sugerir alternativa
                  </button>

                  {panelAbierto && (
                    <div className="mt-2 space-y-1.5">
                      {alternativas.map(alt => (
                        <button
                          key={alt.nombre}
                          type="button"
                          onClick={() => reemplazar(idx, alt)}
                          className="w-full text-left px-3 py-2 rounded-md bg-surface-container-high text-body-sm text-on-surface"
                        >
                          {alt.nombre} <span className="text-on-surface-variant text-label-md">· {alt.grupo}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Rutinas() {
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [personalizados, setPersonalizados] = useState([])
  const [sesiones, setSesiones] = useState([])
  const [ejercicios, setEjercicios] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showSplits, setShowSplits] = useState(false)
  const [ultimoSplit, setUltimoSplit] = useState(null)
  const navigate = useNavigate()
  const splits = tiposDeSplit()
  const { startTour } = useTour()

  useEffect(() => {
    startTour('rutinas', TOURS.rutinas.steps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const aplicarSplit = (splitId) => {
    const sugerida = generarRutinaSugerida(splitId, { personalizados, rutinas, sesiones })
    setEjercicios(sugerida)
    setUltimoSplit(splitId)
    if (!nombre.trim()) {
      const label = splits.find(s => s.id === splitId)?.label
      if (label) setNombre(`Día de ${label}`)
    }
    setShowSplits(false)
  }

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await rutinasService.getAll()
      setRutinas(data || [])
    } catch (e) {
      console.error(e)
      setError('No se pudieron cargar las rutinas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    ejerciciosPersonalizadosService.getAll().then(setPersonalizados).catch(() => {})
    sesionesService.getAll().then(setSesiones).catch(() => {})
  }, [])

  const abrirNueva = () => {
    setEditando(null)
    setNombre('')
    setDescripcion('')
    setEjercicios([])
    setUltimoSplit(null)
    setShowForm(true)
  }

  const abrirEditar = (r) => {
    setEditando(r)
    setNombre(r.nombre)
    setDescripcion(r.descripcion || '')
    setEjercicios(r.ejercicios || [])
    setUltimoSplit(null)
    setShowForm(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setSaving(true)
    setError(null)
    try {
      const payload = { nombre, descripcion, ejercicios, activa: true }
      if (editando) {
        await rutinasService.update(editando.id, payload)
      } else {
        await rutinasService.create(payload)
      }
      setShowForm(false)
      await cargar()
    } catch (e) {
      console.error(e)
      setError('No se pudo guardar la rutina.')
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta rutina?')) return
    try {
      await rutinasService.delete(id)
      await cargar()
    } catch (e) {
      console.error(e)
    }
  }

  const duplicar = async (r) => {
    try {
      await rutinasService.create({
        nombre: `${r.nombre} (copia)`,
        descripcion: r.descripcion || '',
        ejercicios: r.ejercicios || [],
        activa: true,
      })
      await cargar()
    } catch (e) {
      console.error(e)
      setError('No se pudo duplicar la rutina.')
    }
  }

  if (showForm) {
    return (
      <div>
        <button onClick={() => setShowForm(false)} className="flex items-center gap-1 text-accent text-body-sm mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Volver
        </button>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">
          {editando ? 'Editar rutina' : 'Nueva rutina'}
        </h1>
        <p className="text-body-sm text-on-surface-variant mb-5">Definí el nombre y los ejercicios que la componen.</p>

        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="text-label-md text-on-surface-variant uppercase">Nombre</label>
            <input className="input-field mt-1" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Día de Empuje" required />
          </div>
          <div>
            <label className="text-label-md text-on-surface-variant uppercase">Descripción (opcional)</label>
            <textarea className="input-field mt-1" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Notas sobre esta rutina" />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowSplits(s => !s)}
              className="btn-secondary w-full py-2.5 text-body-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Generar rutina sugerida
            </button>
            {showSplits && (
              <div className="mt-2 space-y-1.5">
                {splits.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => aplicarSplit(s.id)}
                    className="w-full text-left px-3 py-2 rounded-md bg-surface-container-high"
                  >
                    <p className="text-body-sm font-semibold text-on-surface">{s.label}</p>
                    <p className="text-label-md text-on-surface-variant">{s.descripcion}</p>
                  </button>
                ))}
                {ejercicios.length > 0 && (
                  <p className="text-label-md text-on-surface-variant italic px-1">
                    Esto reemplaza los ejercicios que ya elegiste.
                  </p>
                )}
              </div>
            )}
            {ultimoSplit && !showSplits && (
              <button
                type="button"
                onClick={() => aplicarSplit(ultimoSplit)}
                className="w-full mt-2 flex items-center justify-center gap-1.5 text-label-md text-accent uppercase py-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Generar otra combinación
              </button>
            )}
          </div>

          <ExerciseBuilder
            ejercicios={ejercicios}
            setEjercicios={setEjercicios}
            personalizados={personalizados}
            onCrearPersonalizado={(nuevo) => setPersonalizados(prev => [...prev, nuevo])}
          />

          {error && <p className="text-body-sm text-error">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-body-md">
            {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear rutina'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Mis rutinas</h1>
      </div>
      <p className="text-body-sm text-on-surface-variant mb-5">Organizá tus días de entrenamiento.</p>

      <button data-tour="rutinas-nueva" onClick={abrirNueva} className="btn-primary w-full py-3 text-body-md mb-5 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[18px]">add</span> Nueva rutina
      </button>

      {error && <p className="text-body-sm text-error mb-3">{error}</p>}

      {loading ? (
        <p className="text-body-sm text-on-surface-variant">Cargando rutinas...</p>
      ) : rutinas.length === 0 ? (
        <div className="card p-6 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2">checklist</span>
          <p className="text-body-md text-on-surface">Todavía no creaste ninguna rutina</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rutinas.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-body-lg font-semibold text-on-surface">{r.nombre}</p>
                  {r.descripcion && <p className="text-body-sm text-on-surface-variant mt-0.5">{r.descripcion}</p>}
                  <p className="text-label-md text-on-surface-variant mt-2">
                    {(r.ejercicios || []).length} ejercicios · {(r.ejercicios || []).map(e => e.nombre).join(', ') || 'sin ejercicios'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant">
                <button
                  onClick={() => navigate(`/entrenar/${r.id}`)}
                  data-tour={r.id === rutinas[0]?.id ? 'rutinas-entrenar-btn' : undefined}
                  className="btn-secondary flex-1 py-2 text-body-sm flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span> Entrenar
                </button>
                <button onClick={() => abrirEditar(r)} className="px-3 py-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onClick={() => duplicar(r)} className="px-3 py-2 text-on-surface-variant" aria-label="Duplicar rutina">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
                <button onClick={() => eliminar(r.id)} className="px-3 py-2 text-error">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getExerciseInfo } from '../data/exerciseCatalog'
import { muscleGroup, MUSCLES, completedSessions } from '../utils/moments'
import { formatFechaRelativa } from '../utils/helpers'

// Symmetric vector artwork: small enough to stay crisp and available offline.
const outline = 'M88 60 Q86 70 78 73 L61 79 Q49 83 46 98 L41 127 Q35 145 32 162 L24 185 Q20 193 23 201 L28 207 Q32 209 34 204 L37 194 L40 192 L39 182 Q47 165 51 152 L58 130 L65 111 Q68 132 71 150 Q73 165 66 184 Q60 201 65 228 L74 270 Q71 288 75 314 L80 351 L77 367 Q74 375 80 377 L93 377 Q99 375 97 369 L94 355 L97 316 Q99 296 95 276 L100 226 L105 276 Q101 296 103 316 L106 355 L103 369 Q101 375 107 377 L120 377 Q126 375 123 367 L120 351 L125 314 Q129 288 126 270 L135 228 Q140 201 134 184 Q127 165 129 150 Q132 132 135 111 L142 130 L149 152 Q153 165 161 182 L160 192 L163 194 L166 204 Q168 209 172 207 L177 201 Q180 193 176 185 L168 162 Q165 145 159 127 L154 98 Q151 83 139 79 L122 73 Q114 70 112 60Z'
const front = {
  chest: 'M70 91 Q84 87 98 94 L98 118 Q84 127 69 117 Q66 104 70 91Z',
  shoulders: 'M62 83 Q47 87 48 109 L62 115 Q64 97 70 89Z',
  arms: 'M48 115 Q57 113 61 120 L53 146 Q50 155 43 157 L39 151Z M40 160 L48 160 Q42 179 35 188 L30 185Z',
  core: 'M78 128 Q87 130 98 127 L98 139 L79 139Z M79 143 L98 143 L98 155 L80 155Z M80 159 L98 159 L98 173 L85 171Z M74 127 L77 155 L83 175 L73 167 L69 144Z',
  quads: 'M72 185 Q83 181 96 189 L94 224 Q91 250 84 263 Q75 245 70 219 Q66 200 72 185Z M96 231 L94 267 Q87 272 85 265Z',
  calves: 'M79 282 Q87 275 92 283 Q97 300 91 323 L86 346 L82 324 Q76 298 79 282Z',
}
const back = {
  shoulders: front.shoulders,
  arms: front.arms,
  back: 'M72 85 Q82 84 98 73 L98 119 Q88 118 73 109Z M70 114 Q86 127 98 125 L98 168 Q87 165 80 151Z',
  posterior: 'M73 173 Q86 169 98 176 L98 203 Q82 212 69 198Z M69 207 Q82 214 96 208 L92 260 Q85 268 79 260 L70 228Z',
  calves: front.calves,
}

function Anatomy({ groups }) {
  const [side, setSide] = useState(groups.some(g => g === 'back' || g === 'posterior') && !groups.includes('chest') ? 'back' : 'front')
  return <div className="focus-anatomy">
    <svg viewBox="15 8 170 380" role="img" aria-label={`Vista ${side === 'front' ? 'frontal' : 'posterior'}. ${groups.length ? `Grupos principales: ${groups.map(g => MUSCLES.find(([id]) => id === g)?.[1]).join(', ')}` : 'Sin grupos musculares clasificados'}`}>
      <path className="anatomy-guide" d="M100 12V382 M21 199H179"/>
      <path className="anatomy-base" d={outline}/>
      <path className="anatomy-base" d="M85 24 Q85 13 100 13 Q115 13 115 24 L114 43 Q113 53 105 59 L95 59 Q87 53 86 43Z"/>
      <path className="anatomy-detail" d="M88 66L100 81L112 66 M100 179V218 M80 272L92 273 M108 273L120 272"/>
      {Object.entries(side === 'front' ? front : back).map(([group, d]) => <g key={group} data-muscle={group} className={groups.includes(group) ? 'anatomy-muscle is-focused' : 'anatomy-muscle'}><path d={d}/><path d={d} transform="translate(200 0) scale(-1 1)"/></g>)}
    </svg>
    <div className="anatomy-views" aria-label="Vista de la silueta"><button aria-pressed={side === 'front'} onClick={() => setSide('front')}>Frente</button><span aria-hidden="true">/</span><button aria-pressed={side === 'back'} onClick={() => setSide('back')}>Espalda</button></div>
  </div>
}

export default function TrainingFocus({ sesiones, draft, loading, error }) {
  const last = completedSessions(sesiones).at(-1)
  // Only performed exercises contribute to the previous session's silhouette.
  const exercises = (last?.ejercicios || []).filter(e => e.series?.length > 0)
  const groups = [...new Set(exercises.map(e => {
    const own = muscleGroup(e.grupo || '')
    return own !== 'other' ? own : muscleGroup(getExerciseInfo(e.nombre)?.grupo || '')
  }))].filter(g => g !== 'other')
  const sets = exercises.reduce((n, e) => n + e.series.length, 0)
  const title = loading ? 'Preparando…' : last ? last.rutina_nombre || 'Sesión libre' : error ? 'Tu historial' : 'Tu primera sesión'
  const labels = groups.map(g => MUSCLES.find(([id]) => id === g)[1])
  const duration = last?.duracion_min != null && Number.isFinite(Number(last.duracion_min)) && Number(last.duracion_min) > 0 ? `${Number(last.duracion_min).toLocaleString('es-AR')} min · ` : ''
  return <section className="training-feature training-focus" aria-label="Tu último entrenamiento completado" aria-busy={loading}>
    <div className="focus-eyebrow"><span><i/>{last ? 'ÚLTIMA SESIÓN' : 'TU HISTORIAL'}</span><span>{last ? formatFechaRelativa(last.fecha) : 'FITSYNC'}</span></div>
    <div className="focus-composition" key={last?.id || 'empty'}>
      <div className="focus-copy">
        <h2>{title}</h2>
        <p className="focus-muscles">{loading ? 'Cargando tu historial' : labels.length ? labels.join(' · ') : last ? 'Tu entrenamiento registrado' : error ? 'No pudimos cargar tus sesiones.' : 'Tu próximo entrenamiento quedará acá.'}</p>
        <div className="focus-numbers">
          <div><strong>{loading || !last ? '—' : String(exercises.length).padStart(2, '0')}</strong><span>ejercicios realizados</span></div>
          <div><strong>{loading || !last ? '—' : String(sets).padStart(2, '0')}</strong><span>series completadas</span></div>
        </div>
        <p className="focus-context">{last ? `${duration}Sesión completada` : loading || error ? 'Tus datos se conservan.' : 'Cada sesión cuenta.'}</p>
      </div>
      <Anatomy groups={groups}/>
    </div>
    <div className="focus-actions">
      <span className="focus-legend"><i/>{draft ? 'Tenés una sesión en curso' : last ? 'Entrenamiento registrado' : 'A tu ritmo'}</span>
      <Link to="/entrenar" data-tour="home-cta-entrenar" className="training-start-button" aria-label={draft ? 'Retomar entrenamiento' : 'Empezar entrenamiento'}>{draft ? 'Continuar' : 'Entrenar'}<ArrowUpRight size={19}/></Link>
    </div>
  </section>
}

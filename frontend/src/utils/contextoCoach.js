// Arma los distintos "contextos" que le mandamos al coach IA, reusando las
// heurísticas que ya existen en helpers.js (deload, racha, balance muscular,
// progreso por ejercicio) en vez de duplicar esa lógica en el backend.
// La idea: el backend nunca calcula nada de negocio, solo arma el prompt y
// llama a Gemini. Todo el laburo de "qué mandarle" vive acá.

import {
  calcularRachaDetalle,
  sugerirDeload,
  volumenPorGrupoSemana,
  volumenPorSemana,
  volumenTotalHistorico,
  recordsPersonalesTotal,
  ultimoRegistroEjercicio,
  prPersonalEjercicio,
  analizarCoachEjercicio,
  ejerciciosAbandonados,
  nivelPorSesiones,
  sesionesCompletadas,
} from './helpers'
import { getExerciseInfo, EXERCISE_CATALOG } from '../data/exerciseCatalog'

// Contexto liviano para el chat libre: un panorama general, no todo el detalle.
export function construirContextoChat(sesiones = [], rutinas = [], personalizados = [], nombreUsuario = null) {
  return {
    usuario_nombre: nombreUsuario,
    racha: calcularRachaDetalle(sesiones),
    volumen_total_historico: volumenTotalHistorico(sesiones),
    sesiones_completadas: sesiones.filter((s) => s.completada).length,
    balance_muscular_semana: volumenPorGrupoSemana(sesiones, personalizados),
    deload_sugerido: sugerirDeload(sesiones),
    ejercicios_abandonados: ejerciciosAbandonados(sesiones, rutinas),
    rutinas: rutinas.map((r) => ({ nombre: r.nombre, ejercicios: (r.ejercicios || []).map((e) => e.nombre) })),
  }
}

// Contexto para el comentario automático post-sesión: la sesión recién
// terminada, comparada contra el historial inmediato de cada ejercicio.
export function construirContextoComentarioSesion(sesionActual, sesionesPrevias = []) {
  const ejercicios = (sesionActual.ejercicios || []).map((ej) => ({
    nombre: ej.nombre,
    series: ej.series,
    ultimo_registro_previo: ultimoRegistroEjercicio(sesionesPrevias, ej.nombre),
    pr_previo: prPersonalEjercicio(sesionesPrevias, ej.nombre),
    analisis_coach: analizarCoachEjercicio(sesionesPrevias, ej.nombre),
  }))

  return {
    fecha: sesionActual.fecha,
    rutina_nombre: sesionActual.rutina_nombre,
    volumen_total: sesionActual.volumen_total,
    duracion_min: sesionActual.duracion_min,
    notas: sesionActual.notas,
    ejercicios,
  }
}

// Contexto para el resumen semanal/mensual.
export function construirContextoResumen(sesiones = [], personalizados = [], tipo = 'semanal') {
  const semanas = tipo === 'mensual' ? 4 : 1
  return {
    tipo,
    volumen_por_semana: volumenPorSemana(sesiones, semanas + 1), // +1 para poder comparar contra la anterior
    balance_muscular: volumenPorGrupoSemana(sesiones, personalizados),
    racha: calcularRachaDetalle(sesiones),
    deload_sugerido: sugerirDeload(sesiones),
    records_personales_total: recordsPersonalesTotal(sesiones),
  }
}

// Contexto para sugerencia de ejercicios nuevos.
export function construirContextoSugerirEjercicios(rutinas = [], sesiones = [], personalizados = []) {
  return {
    balance_muscular: volumenPorGrupoSemana(sesiones, personalizados),
    rutinas_actuales: rutinas.map((r) => ({
      nombre: r.nombre,
      ejercicios: (r.ejercicios || []).map((e) => e.nombre),
    })),
  }
}

// Contexto para el análisis de técnica de un ejercicio puntual: el ejercicio
// con sus puntos clave reales del catálogo (para que el coach no invente
// consejos de técnica), su historial reciente, su PR, y la lectura de
// progreso que ya calculamos en helpers. La descripción del usuario ("me
// tembló la rodilla") viaja aparte, como mensajeUsuario.
export function construirContextoTecnica(ejercicio, sesiones = [], personalizados = []) {
  const info = getExerciseInfo(ejercicio?.nombre, personalizados)
  return {
    ejercicio: {
      nombre: ejercicio?.nombre,
      grupo: info?.grupo || ejercicio?.grupo || null,
      puntos_clave_tecnica: info?.puntosClave || [],
    },
    ultimo_registro: ultimoRegistroEjercicio(sesiones, ejercicio?.nombre),
    pr_personal: prPersonalEjercicio(sesiones, ejercicio?.nombre),
    analisis_previo: analizarCoachEjercicio(sesiones, ejercicio),
  }
}

// Contexto para el generador de rutina personalizada por IA: preferencias
// del usuario (objetivo, días disponibles), su nivel según cantidad de
// sesiones, el balance muscular actual, sus rutinas existentes (para que la
// IA no las duplique) y la lista COMPLETA de ejercicios válidos (catálogo +
// personalizados), para restringir al modelo a nombres que existen de verdad.
export function construirContextoGenerarRutina(rutinas = [], sesiones = [], personalizados = [], preferencias = {}) {
  const ejerciciosValidos = [
    ...EXERCISE_CATALOG.map((e) => ({ nombre: e.nombre, grupo: e.grupo })),
    ...personalizados.map((p) => ({ nombre: p.nombre, grupo: p.grupo || 'Personalizado' })),
  ]

  return {
    objetivo: preferencias.objetivo || null,
    dias_por_semana: preferencias.diasPorSemana || null,
    nivel: nivelPorSesiones(sesionesCompletadas(sesiones)),
    balance_muscular_semana: volumenPorGrupoSemana(sesiones, personalizados),
    rutinas_actuales: rutinas.map((r) => ({
      nombre: r.nombre,
      activa: r.activa,
      ejercicios: (r.ejercicios || []).map((e) => e.nombre),
    })),
    ejercicios_validos: ejerciciosValidos,
  }
}

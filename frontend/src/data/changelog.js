// ---------------------------------------------------------------------------
// Registro de novedades ("¿Qué hay de nuevo?"), mostrado una sola vez por
// usuario cuando actualiza a una versión con entradas nuevas.
//
// Cómo agregar una entrada en cada release:
//   1. Subí APP_VERSION (alcanza con una fecha tipo '2026.07.19', no hace
//      falta semver estricto).
//   2. Sumá un objeto nuevo al PRINCIPIO de CHANGELOG con esa misma versión
//      y una lista corta de bullets en criollo, sin tecnicismos internos
//      (esto lo lee el usuario final, no es un changelog de git).
// ---------------------------------------------------------------------------

export const APP_VERSION = '2026.07.19'

export const CHANGELOG = [
  {
    version: '2026.07.19',
    fecha: '19 jul 2026',
    items: [
      'Los logros de Inicio y Perfil ahora son siempre los mismos, sin sorpresas.',
      'Tutoriales nuevos para elegir cómo entrenar, elegir ejercicio y el resumen final de la sesión.',
      'FitSync es 100% libre: sacamos cualquier mención a planes o límites.',
    ],
  },
]

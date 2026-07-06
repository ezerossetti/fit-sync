// Catálogo bilingüe de ejercicios — Insight #1 de C4:
// UI siempre en español formal, pero la búsqueda acepta sinónimos en inglés y acrónimos (PB, 1RM, RDL).
// Cada ejercicio incluye metadata para la pantalla de pre-serie (descripción, puntos clave).
export const EXERCISE_CATALOG = [
  {
    nombre: 'Peso muerto',
    sinonimos: ['deadlift'],
    grupo: 'Tracción / Cadena posterior',
    descripcion: 'Ejercicio compuesto que trabaja toda la cadena posterior: isquiotibiales, glúteos y espalda baja.',
    puntosClave: [
      'Mantené la columna neutra y el core controlado durante toda la tracción.',
      'Empujá el suelo con los pies; no intentes "tirar" solo con los brazos.',
      'Extensión completa de cadera en el bloqueo superior.',
    ],
  },
  {
    nombre: 'Peso muerto rumano',
    sinonimos: ['rdl', 'romanian deadlift'],
    grupo: 'Piernas / Isquiotibiales',
    descripcion: 'Variante con rodillas semi-flexionadas, foco en el estiramiento de isquiotibiales.',
    puntosClave: [
      'La barra recorre pegada a las piernas todo el trayecto.',
      'Cadera hacia atrás, no hacia abajo.',
      'Frená el descenso apenas sientas el estiramiento en isquios.',
    ],
  },
  {
    nombre: 'Press de banca plano',
    sinonimos: ['bench press', 'press banca'],
    grupo: 'Empuje / Pecho',
    descripcion: 'Ejercicio base para el desarrollo de pecho, hombros y tríceps.',
    puntosClave: [
      'Escápulas retraídas y pecho arriba durante todo el movimiento.',
      'La barra baja hasta rozar el pecho, sin rebotar.',
      'Pies firmes en el piso para generar tensión desde las piernas.',
    ],
  },
  {
    nombre: 'Press de banca inclinado',
    sinonimos: ['incline bench press'],
    grupo: 'Empuje / Pecho superior',
    descripcion: 'Variante inclinada que enfatiza la porción clavicular del pectoral.',
    puntosClave: [
      'Inclinación de banco entre 30° y 45°, no más.',
      'Bajá la barra a la altura de la clavícula.',
      'Controlá el descenso, no dejes caer el peso.',
    ],
  },
  {
    nombre: 'Sentadilla',
    sinonimos: ['squat', 'back squat'],
    grupo: 'Piernas / Cuádriceps',
    descripcion: 'El ejercicio rey para piernas: cuádriceps, glúteos y core.',
    puntosClave: [
      'Rodillas alineadas con la punta de los pies durante todo el recorrido.',
      'Bajá hasta que la cadera quede a la altura de la rodilla o más abajo.',
      'Pecho arriba y mirada al frente, no redondees la espalda baja.',
    ],
  },
  {
    nombre: 'Sentadilla frontal',
    sinonimos: ['front squat'],
    grupo: 'Piernas / Cuádriceps',
    descripcion: 'Variante con la barra al frente, mayor exigencia de core y cuádriceps.',
    puntosClave: [
      'Codos altos para sostener la barra sobre los hombros.',
      'Torso lo más vertical posible durante el descenso.',
      'Core activo para evitar que el torso se incline hacia adelante.',
    ],
  },
  {
    nombre: 'Press militar',
    sinonimos: ['overhead press', 'ohp'],
    grupo: 'Empuje / Hombros',
    descripcion: 'Press por encima de la cabeza para desarrollar hombros y estabilidad de core.',
    puntosClave: [
      'Glúteos y abdomen contraídos para no arquear la espalda baja.',
      'La barra sube en línea recta, cerca de la cara.',
      'Bloqueo completo arriba, con la cabeza pasando bajo la barra.',
    ],
  },
  {
    nombre: 'Remo con barra',
    sinonimos: ['barbell row'],
    grupo: 'Tracción / Espalda',
    descripcion: 'Ejercicio de tracción horizontal para dorsales y espalda media.',
    puntosClave: [
      'Torso inclinado ~45°, espalda recta durante toda la serie.',
      'Llevá la barra hacia el abdomen, no hacia el pecho.',
      'Evitá el impulso con el cuerpo; el movimiento lo hace la espalda.',
    ],
  },
  {
    nombre: 'Dominadas',
    sinonimos: ['pull up', 'pullup'],
    grupo: 'Tracción / Espalda',
    descripcion: 'Ejercicio de peso corporal para dorsales, bíceps y agarre.',
    puntosClave: [
      'Arrancá desde brazos extendidos, sin balanceo.',
      'Llevá el pecho hacia la barra, no solo la barbilla.',
      'Bajá controlado hasta la extensión completa.',
    ],
  },
  {
    nombre: 'Curl de bíceps',
    sinonimos: ['bicep curl'],
    grupo: 'Brazos / Bíceps',
    descripcion: 'Ejercicio de aislamiento para el bíceps braquial.',
    puntosClave: [
      'Codos pegados al torso durante todo el recorrido.',
      'Evitá el balanceo de cadera para "ayudar" al levantamiento.',
      'Controlá especialmente la fase de bajada.',
    ],
  },
  {
    nombre: 'Extensión de tríceps',
    sinonimos: ['tricep extension'],
    grupo: 'Brazos / Tríceps',
    descripcion: 'Ejercicio de aislamiento para la cabeza larga del tríceps.',
    puntosClave: [
      'Codos fijos, apuntando al techo o al frente según variante.',
      'Extensión completa sin bloquear violentamente el codo.',
      'Bajá controlado hasta sentir el estiramiento.',
    ],
  },
  {
    nombre: 'Zancadas',
    sinonimos: ['lunges'],
    grupo: 'Piernas / Unilateral',
    descripcion: 'Ejercicio unilateral para piernas y glúteos, con foco en estabilidad.',
    puntosClave: [
      'Rodilla trasera baja casi hasta rozar el piso.',
      'Torso erguido durante todo el movimiento.',
      'Empujá con el talón de la pierna delantera para volver a subir.',
    ],
  },
  {
    nombre: 'Hip thrust',
    sinonimos: ['empuje de cadera'],
    grupo: 'Piernas / Glúteos',
    descripcion: 'El ejercicio más efectivo para el desarrollo de glúteos.',
    puntosClave: [
      'Mentón metido, evitá hiperextender el cuello arriba.',
      'Apretá glúteos con fuerza en el punto más alto.',
      'Pies a una distancia que forme ~90° en la rodilla arriba.',
    ],
  },
  {
    nombre: 'Fondos',
    sinonimos: ['dips'],
    grupo: 'Empuje / Pecho y tríceps',
    descripcion: 'Ejercicio de peso corporal para pecho inferior y tríceps.',
    puntosClave: [
      'Inclinación leve del torso hacia adelante para enfatizar pecho.',
      'Bajá hasta sentir estiramiento en el hombro, sin pasarte.',
      'Codos cerca del cuerpo si el foco es tríceps.',
    ],
  },
  {
    nombre: 'Elevaciones laterales',
    sinonimos: ['lateral raises'],
    grupo: 'Hombros / Deltoides lateral',
    descripcion: 'Ejercicio de aislamiento para la cabeza lateral del hombro.',
    puntosClave: [
      'Codos con leve flexión, no completamente rígidos.',
      'Subí hasta la altura del hombro, no más arriba.',
      'Controlá la bajada, no dejes caer el peso.',
    ],
  },
]

export function searchExercises(query) {
  const q = query.trim().toLowerCase()
  if (!q) return EXERCISE_CATALOG
  return EXERCISE_CATALOG.filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    e.sinonimos.some(s => s.toLowerCase().includes(q))
  )
}

// Busca metadata de un ejercicio por nombre exacto (o null si es un ejercicio personalizado sin catálogo)
export function getExerciseInfo(nombre) {
  if (!nombre) return null
  const n = nombre.trim().toLowerCase()
  return EXERCISE_CATALOG.find(e => e.nombre.toLowerCase() === n) || null
}

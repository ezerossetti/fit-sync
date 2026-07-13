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

  // ---------- Piernas ----------
  {
    nombre: 'Prensa de piernas',
    sinonimos: ['leg press'],
    grupo: 'Piernas / Cuádriceps',
    descripcion: 'Ejercicio en máquina para cuádriceps y glúteos con menor exigencia de estabilidad que la sentadilla.',
    puntosClave: [
      'Pies a la altura de los hombros, apoyados en toda la planta.',
      'No bloquees las rodillas de golpe arriba.',
      'Bajá hasta 90° de rodilla sin despegar la zona lumbar del respaldo.',
    ],
  },
  {
    nombre: 'Sentadilla búlgara',
    sinonimos: ['bulgarian split squat'],
    grupo: 'Piernas / Unilateral',
    descripcion: 'Variante unilateral con el pie trasero elevado, gran exigencia de cuádriceps y glúteo.',
    puntosClave: [
      'Torso ligeramente inclinado adelante para más glúteo, vertical para más cuádriceps.',
      'La rodilla delantera no debería adelantarse mucho a la punta del pie.',
      'Bajá controlado, sin rebotar en el piso.',
    ],
  },
  {
    nombre: 'Extensión de cuádriceps',
    sinonimos: ['leg extension'],
    grupo: 'Piernas / Cuádriceps',
    descripcion: 'Ejercicio de aislamiento en máquina para el cuádriceps.',
    puntosClave: [
      'Extensión completa arriba, con una pausa breve.',
      'Bajá controlado sin soltar el peso de golpe.',
      'Espalda apoyada en el respaldo durante todo el movimiento.',
    ],
  },
  {
    nombre: 'Curl femoral',
    sinonimos: ['leg curl', 'hamstring curl'],
    grupo: 'Piernas / Isquiotibiales',
    descripcion: 'Ejercicio de aislamiento en máquina para isquiotibiales.',
    puntosClave: [
      'Cadera pegada al banco/almohadilla durante todo el recorrido.',
      'Contracción máxima arriba, sin usar impulso.',
      'Bajá controlado hasta la extensión casi completa.',
    ],
  },
  {
    nombre: 'Elevación de talones de pie',
    sinonimos: ['standing calf raise', 'gemelos de pie'],
    grupo: 'Piernas / Gemelos',
    descripcion: 'Ejercicio de aislamiento para gemelos, en máquina o con mancuernas.',
    puntosClave: [
      'Recorrido completo: estiramiento abajo, contracción máxima arriba.',
      'Pausá un segundo en la contracción máxima.',
      'Evitá rebotar para usar impulso.',
    ],
  },
  {
    nombre: 'Elevación de talones sentado',
    sinonimos: ['seated calf raise'],
    grupo: 'Piernas / Gemelos',
    descripcion: 'Variante sentada que enfatiza el sóleo.',
    puntosClave: [
      'Rodillas en 90° durante todo el ejercicio.',
      'Subí hasta la punta de los pies, pausá arriba.',
      'Controlá la bajada hasta el estiramiento completo.',
    ],
  },
  {
    nombre: 'Sentadilla goblet',
    sinonimos: ['goblet squat'],
    grupo: 'Piernas / Cuádriceps',
    descripcion: 'Sentadilla con una mancuerna o kettlebell sostenida al pecho, ideal para aprender la técnica.',
    puntosClave: [
      'Codos rozando la cara interna de las rodillas al bajar.',
      'Pecho arriba, mirada al frente.',
      'Buena profundidad sin perder la posición neutra de la espalda.',
    ],
  },
  {
    nombre: 'Zancadas caminando',
    sinonimos: ['walking lunges'],
    grupo: 'Piernas / Unilateral',
    descripcion: 'Variante dinámica de las zancadas, avanzando paso a paso.',
    puntosClave: [
      'Paso amplio, rodilla trasera casi tocando el piso.',
      'Torso erguido durante todo el desplazamiento.',
      'Impulso desde el talón delantero para avanzar.',
    ],
  },
  {
    nombre: 'Peso muerto sumo',
    sinonimos: ['sumo deadlift'],
    grupo: 'Piernas / Cadena posterior',
    descripcion: 'Variante con postura ancha, mayor participación de cuádriceps y aductores.',
    puntosClave: [
      'Pies bien abiertos, puntas hacia afuera.',
      'Torso más vertical que en el peso muerto convencional.',
      'Empujá el piso hacia afuera con los pies durante la tracción.',
    ],
  },
  {
    nombre: 'Puente de glúteos',
    sinonimos: ['glute bridge'],
    grupo: 'Piernas / Glúteos',
    descripcion: 'Variante de hip thrust apoyado en el piso, buena para principiantes.',
    puntosClave: [
      'Apretá glúteos con fuerza en el punto más alto.',
      'Evitá arquear excesivamente la zona lumbar.',
      'Pies cerca de los glúteos para mayor rango.',
    ],
  },
  {
    nombre: 'Abducción de cadera',
    sinonimos: ['hip abduction'],
    grupo: 'Piernas / Glúteo medio',
    descripcion: 'Ejercicio de aislamiento en máquina para glúteo medio.',
    puntosClave: [
      'Movimiento controlado, sin usar impulso del torso.',
      'Pausá un segundo en la apertura máxima.',
      'Espalda apoyada firme contra el respaldo.',
    ],
  },

  // ---------- Espalda / Tracción ----------
  {
    nombre: 'Jalón al pecho',
    sinonimos: ['lat pulldown'],
    grupo: 'Tracción / Espalda',
    descripcion: 'Ejercicio en polea para dorsales, alternativa accesible a las dominadas.',
    puntosClave: [
      'Llevá la barra hacia la parte superior del pecho, no hacia el cuello.',
      'Escápulas hacia abajo y atrás antes de tirar.',
      'Evitá balancear el torso hacia atrás para generar impulso.',
    ],
  },
  {
    nombre: 'Remo con mancuerna a una mano',
    sinonimos: ['one arm dumbbell row', 'remo mancuerna'],
    grupo: 'Tracción / Espalda',
    descripcion: 'Ejercicio unilateral de tracción horizontal, apoyado en banco.',
    puntosClave: [
      'Espalda paralela al piso y neutra, sin rotar el torso.',
      'Codo pegado al cuerpo durante la tracción.',
      'Contracción completa arriba, controlá la bajada.',
    ],
  },
  {
    nombre: 'Remo en polea baja',
    sinonimos: ['seated cable row', 'remo en máquina'],
    grupo: 'Tracción / Espalda',
    descripcion: 'Remo horizontal en polea sentado, buen aislamiento de espalda media.',
    puntosClave: [
      'Espalda recta, sin balancear el torso adelante y atrás.',
      'Llevá los codos hacia atrás, cerca del cuerpo.',
      'Pausá la contracción antes de volver a extender los brazos.',
    ],
  },
  {
    nombre: 'Pull over',
    sinonimos: ['pullover'],
    grupo: 'Tracción / Espalda y pecho',
    descripcion: 'Ejercicio que trabaja dorsal ancho y pecho, con mancuerna o barra.',
    puntosClave: [
      'Cadera baja para tensionar el core durante el movimiento.',
      'Brazos con leve flexión constante en el codo.',
      'Recorrido amplio, desde detrás de la cabeza hasta sobre el pecho.',
    ],
  },
  {
    nombre: 'Remo en T',
    sinonimos: ['t-bar row'],
    grupo: 'Tracción / Espalda',
    descripcion: 'Variante de remo con barra en landmine, buena carga para espalda media.',
    puntosClave: [
      'Torso inclinado, espalda recta y fija.',
      'Tirá con los codos, no con las manos.',
      'Contracción de omóplatos en la parte alta del movimiento.',
    ],
  },
  {
    nombre: 'Face pull',
    sinonimos: ['face pulls'],
    grupo: 'Espalda / Hombro posterior',
    descripcion: 'Ejercicio en polea para deltoides posterior y salud del hombro.',
    puntosClave: [
      'Tirá la cuerda hacia la cara, codos altos.',
      'Rotación externa de hombro en la fase final.',
      'Peso liviano, prioridad total a la técnica.',
    ],
  },
  {
    nombre: 'Hiperextensiones',
    sinonimos: ['back extension', 'extensión lumbar'],
    grupo: 'Espalda baja / Core',
    descripcion: 'Ejercicio para fortalecer erectores espinales y glúteos.',
    puntosClave: [
      'No hiperextiendas de más arriba, hasta la línea neutra alcanza.',
      'Apretá glúteos al subir para proteger la zona lumbar.',
      'Movimiento controlado, sin rebotar.',
    ],
  },

  // ---------- Pecho / Empuje ----------
  {
    nombre: 'Press de banca declinado',
    sinonimos: ['decline bench press'],
    grupo: 'Empuje / Pecho inferior',
    descripcion: 'Variante que enfatiza la porción inferior del pectoral.',
    puntosClave: [
      'Piernas bien afirmadas para no deslizarte en el banco.',
      'Bajá la barra a la parte baja del pecho.',
      'Controlá el descenso, más aún por la inclinación.',
    ],
  },
  {
    nombre: 'Press con mancuernas',
    sinonimos: ['dumbbell bench press'],
    grupo: 'Empuje / Pecho',
    descripcion: 'Variante con mancuernas que permite mayor rango de movimiento que la barra.',
    puntosClave: [
      'Bajá hasta sentir buen estiramiento en el pecho.',
      'Trayectoria en arco leve, no estrictamente vertical.',
      'Controlá especialmente el punto más bajo del recorrido.',
    ],
  },
  {
    nombre: 'Aperturas con mancuernas',
    sinonimos: ['dumbbell flyes', 'flyes'],
    grupo: 'Empuje / Pecho',
    descripcion: 'Ejercicio de aislamiento para pecho, con foco en el estiramiento.',
    puntosClave: [
      'Codos con flexión leve y constante durante todo el movimiento.',
      'Bajá hasta sentir un buen estiramiento, sin forzar el hombro.',
      'El movimiento es de "abrazo", no de empuje.',
    ],
  },
  {
    nombre: 'Cruce de poleas',
    sinonimos: ['cable crossover'],
    grupo: 'Empuje / Pecho',
    descripcion: 'Ejercicio de aislamiento en polea, mantiene tensión constante en el pecho.',
    puntosClave: [
      'Leve inclinación de torso adelante.',
      'Juntá las manos al frente, contracción máxima del pecho.',
      'Codos con flexión leve, sin convertirlo en un press.',
    ],
  },
  {
    nombre: 'Press en máquina',
    sinonimos: ['chest press machine'],
    grupo: 'Empuje / Pecho',
    descripcion: 'Variante en máquina, útil para trabajar cerca del fallo con seguridad.',
    puntosClave: [
      'Espalda y cabeza apoyadas firme contra el respaldo.',
      'Extensión completa sin bloquear violento el codo.',
      'Controlá la fase negativa del movimiento.',
    ],
  },
  {
    nombre: 'Flexiones de brazos',
    sinonimos: ['push up', 'pushups', 'lagartijas'],
    grupo: 'Empuje / Pecho',
    descripcion: 'Ejercicio de peso corporal clásico para pecho, hombros y tríceps.',
    puntosClave: [
      'Cuerpo en línea recta de cabeza a talones.',
      'Bajá hasta que el pecho casi toque el piso.',
      'Codos a unos 45° del torso, no totalmente abiertos.',
    ],
  },

  // ---------- Hombros ----------
  {
    nombre: 'Press militar con mancuernas',
    sinonimos: ['dumbbell shoulder press'],
    grupo: 'Empuje / Hombros',
    descripcion: 'Variante con mancuernas del press militar, mayor rango y trabajo de estabilización.',
    puntosClave: [
      'Core activo para no arquear la zona lumbar.',
      'Trayectoria de las mancuernas casi vertical.',
      'Bajá controlado hasta la altura de los hombros.',
    ],
  },
  {
    nombre: 'Elevaciones frontales',
    sinonimos: ['front raises'],
    grupo: 'Hombros / Deltoides anterior',
    descripcion: 'Ejercicio de aislamiento para la cabeza anterior del deltoides.',
    puntosClave: [
      'Subí hasta la altura del hombro, no más arriba.',
      'Evitá el balanceo del torso para tomar impulso.',
      'Controlá la bajada de forma lenta.',
    ],
  },
  {
    nombre: 'Elevaciones posteriores',
    sinonimos: ['rear delt fly', 'pájaros'],
    grupo: 'Hombros / Deltoides posterior',
    descripcion: 'Ejercicio de aislamiento para el deltoides posterior, clave para la postura.',
    puntosClave: [
      'Torso inclinado hacia adelante, espalda recta.',
      'Codos con leve flexión durante todo el recorrido.',
      'Apretá los omóplatos en la parte alta del movimiento.',
    ],
  },
  {
    nombre: 'Press Arnold',
    sinonimos: ['arnold press'],
    grupo: 'Empuje / Hombros',
    descripcion: 'Variante de press con rotación, trabaja las tres cabezas del deltoides.',
    puntosClave: [
      'Empezá con las palmas hacia vos y rotá al subir.',
      'Movimiento fluido, sin trabas en la rotación.',
      'Controlá especialmente la bajada con rotación inversa.',
    ],
  },
  {
    nombre: 'Encogimientos de hombros',
    sinonimos: ['shrugs'],
    grupo: 'Hombros / Trapecio',
    descripcion: 'Ejercicio de aislamiento para el trapecio superior.',
    puntosClave: [
      'Subí los hombros derecho hacia arriba, sin rotarlos.',
      'Pausá un segundo en la contracción máxima.',
      'Evitá usar los brazos para ayudar al movimiento.',
    ],
  },

  // ---------- Brazos ----------
  {
    nombre: 'Curl con mancuernas alterno',
    sinonimos: ['alternating dumbbell curl'],
    grupo: 'Brazos / Bíceps',
    descripcion: 'Variante alterna del curl de bíceps, permite enfocarse en cada brazo.',
    puntosClave: [
      'Codo fijo pegado al torso durante todo el recorrido.',
      'Rotá la muñeca (supinación) mientras subís, si usás mancuernas.',
      'Controlá la bajada, no dejes caer el peso de golpe.',
    ],
  },
  {
    nombre: 'Curl martillo',
    sinonimos: ['hammer curl'],
    grupo: 'Brazos / Bíceps y antebrazo',
    descripcion: 'Variante con agarre neutro que suma trabajo de braquial y antebrazo.',
    puntosClave: [
      'Agarre neutro (palmas encontradas) durante todo el ejercicio.',
      'Codos fijos, sin balanceo de hombros.',
      'Subida y bajada controladas.',
    ],
  },
  {
    nombre: 'Curl en banco Scott',
    sinonimos: ['preacher curl'],
    grupo: 'Brazos / Bíceps',
    descripcion: 'Variante que aísla el bíceps al fijar el brazo sobre un banco inclinado.',
    puntosClave: [
      'Brazo completamente apoyado en el banco durante todo el set.',
      'Evitá extender de más el codo abajo para no forzar la articulación.',
      'Contracción máxima arriba, sin usar impulso.',
    ],
  },
  {
    nombre: 'Press francés',
    sinonimos: ['skull crusher', 'french press'],
    grupo: 'Brazos / Tríceps',
    descripcion: 'Ejercicio de aislamiento para tríceps con barra o mancuernas, acostado.',
    puntosClave: [
      'Codos apuntando al techo, fijos durante todo el movimiento.',
      'Bajá la barra hacia la frente o detrás de la cabeza, según variante.',
      'Controlá especialmente la fase de bajada.',
    ],
  },
  {
    nombre: 'Extensión de tríceps en polea',
    sinonimos: ['tricep pushdown'],
    grupo: 'Brazos / Tríceps',
    descripcion: 'Ejercicio de aislamiento para tríceps en polea alta.',
    puntosClave: [
      'Codos pegados al torso durante todo el recorrido.',
      'Extensión completa abajo, sin bloquear de golpe.',
      'Controlá la vuelta hacia arriba.',
    ],
  },
  {
    nombre: 'Fondos en banco',
    sinonimos: ['bench dips'],
    grupo: 'Brazos / Tríceps',
    descripcion: 'Variante de fondos usando un banco, con o sin peso corporal completo.',
    puntosClave: [
      'Manos cerca de la cadera, dedos apuntando adelante.',
      'Bajá hasta 90° de codo, sin forzar el hombro.',
      'Empujá con los tríceps, no con las piernas.',
    ],
  },
  {
    nombre: 'Curl de muñeca',
    sinonimos: ['wrist curl'],
    grupo: 'Brazos / Antebrazo',
    descripcion: 'Ejercicio de aislamiento para los flexores del antebrazo.',
    puntosClave: [
      'Antebrazo apoyado firme, solo se mueve la muñeca.',
      'Recorrido completo, con buena contracción arriba.',
      'Peso liviano, prioridad a la técnica y el agarre.',
    ],
  },

  // ---------- Core ----------
  {
    nombre: 'Plancha abdominal',
    sinonimos: ['plank'],
    grupo: 'Core / Abdomen',
    descripcion: 'Ejercicio isométrico para toda la zona media.',
    puntosClave: [
      'Cuerpo en línea recta, sin elevar ni hundir la cadera.',
      'Core y glúteos activos durante todo el tiempo.',
      'Respirá normal, no contengas la respiración.',
    ],
  },
  {
    nombre: 'Crunch abdominal',
    sinonimos: ['crunch', 'abdominales'],
    grupo: 'Core / Abdomen',
    descripcion: 'Ejercicio clásico de aislamiento para el recto abdominal.',
    puntosClave: [
      'Movimiento corto, no hace falta sentarse completo.',
      'Evitá tirar del cuello con las manos.',
      'Exhalá al subir, contracción máxima arriba.',
    ],
  },
  {
    nombre: 'Elevación de piernas colgado',
    sinonimos: ['hanging leg raise'],
    grupo: 'Core / Abdomen inferior',
    descripcion: 'Ejercicio avanzado de core, colgado de una barra.',
    puntosClave: [
      'Evitá balancearte, controlá el movimiento con el core.',
      'Subí las piernas lo más alto posible sin usar impulso.',
      'Bajá controlado, sin dejar caer las piernas de golpe.',
    ],
  },
  {
    nombre: 'Rueda abdominal',
    sinonimos: ['ab wheel rollout'],
    grupo: 'Core / Abdomen',
    descripcion: 'Ejercicio exigente para todo el core usando una rueda con manijas.',
    puntosClave: [
      'Core apretado durante todo el recorrido, sin arquear la lumbar.',
      'Andá solo hasta donde puedas volver con control.',
      'Empezá desde rodillas si es tu primera vez.',
    ],
  },
  {
    nombre: 'Giro ruso',
    sinonimos: ['russian twist'],
    grupo: 'Core / Oblicuos',
    descripcion: 'Ejercicio rotacional para los oblicuos.',
    puntosClave: [
      'Talones apenas despegados del piso para más dificultad.',
      'Girá desde el torso, no solo los brazos.',
      'Movimiento controlado, sin usar impulso violento.',
    ],
  },
  {
    nombre: 'Pallof press',
    sinonimos: ['pallof press'],
    grupo: 'Core / Anti-rotación',
    descripcion: 'Ejercicio anti-rotacional en polea, clave para estabilidad de core.',
    puntosClave: [
      'Resistí la rotación del torso durante todo el press.',
      'Extensión completa de brazos al frente.',
      'Controlá la vuelta al pecho sin dejarte arrastrar por la polea.',
    ],
  },

  // ---------- Cardio / Funcional ----------
  {
    nombre: 'Burpees',
    sinonimos: ['burpee'],
    grupo: 'Funcional / Cardio',
    descripcion: 'Ejercicio de cuerpo completo que combina sentadilla, plancha y salto.',
    puntosClave: [
      'Mantené el core firme al pasar a la posición de plancha.',
      'Aterrizá con las rodillas semiflexionadas en el salto.',
      'Ritmo constante, priorizá la técnica sobre la velocidad.',
    ],
  },
  {
    nombre: 'Kettlebell swing',
    sinonimos: ['swing con pesa rusa'],
    grupo: 'Funcional / Cadena posterior',
    descripcion: 'Ejercicio balístico de cadera para potencia y cadena posterior.',
    puntosClave: [
      'El impulso sale de la cadera, no de los brazos.',
      'Espalda neutra durante todo el movimiento.',
      'Los brazos solo acompañan, no "levantan" la pesa.',
    ],
  },
  {
    nombre: 'Saltos al cajón',
    sinonimos: ['box jump'],
    grupo: 'Funcional / Potencia',
    descripcion: 'Ejercicio pliométrico para potencia de tren inferior.',
    puntosClave: [
      'Aterrizá suave, absorbiendo con las rodillas.',
      'Bajá del cajón caminando, no saltando hacia atrás.',
      'Elegí una altura que puedas dominar con buena técnica.',
    ],
  },
  {
    nombre: 'Remo en máquina (cardio)',
    sinonimos: ['rowing machine', 'remo ergómetro'],
    grupo: 'Cardio / Cuerpo completo',
    descripcion: 'Ejercicio cardiovascular de bajo impacto que involucra piernas, espalda y brazos.',
    puntosClave: [
      'La fuerza sale primero de las piernas, después el torso, después los brazos.',
      'Espalda recta durante todo el recorrido.',
      'Recuperación fluida, sin trabas entre repeticiones.',
    ],
  },
  {
    nombre: 'Escalador (mountain climbers)',
    sinonimos: ['mountain climbers'],
    grupo: 'Funcional / Cardio y core',
    descripcion: 'Ejercicio dinámico que combina core y cardio.',
    puntosClave: [
      'Cadera estable, sin subir y bajar de más.',
      'Rodillas hacia el pecho de forma rápida pero controlada.',
      'Mantené la posición de plancha durante todo el ejercicio.',
    ],
  },
]


// Adapta un registro de la tabla ejercicios_personalizados (snake_case, viene del backend)
// al mismo shape que usa el catálogo estático (camelCase) para que se puedan mezclar sin fricción.
export function normalizarPersonalizado(p) {
  return {
    nombre: p.nombre,
    sinonimos: [],
    grupo: p.grupo || 'Personalizado',
    descripcion: p.descripcion || '',
    puntosClave: p.puntos_clave || p.puntosClave || [],
    personalizado: true,
    id: p.id,
  }
}

// `personalizados` es opcional: la lista de ejercicios propios del usuario (crudos del backend).
// Si no se pasa, estas funciones se comportan exactamente igual que antes (solo catálogo estático).
export function searchExercises(query, personalizados = []) {
  const catalogoCompleto = [...EXERCISE_CATALOG, ...personalizados.map(normalizarPersonalizado)]
  const q = query.trim().toLowerCase()
  if (!q) return catalogoCompleto
  return catalogoCompleto.filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    (e.sinonimos || []).some(s => s.toLowerCase().includes(q))
  )
}

// Busca metadata de un ejercicio por nombre exacto (o null si es un ejercicio sin catálogo ni personalizado)
export function getExerciseInfo(nombre, personalizados = []) {
  if (!nombre) return null
  const n = nombre.trim().toLowerCase()
  const enCatalogo = EXERCISE_CATALOG.find(e => e.nombre.toLowerCase() === n)
  if (enCatalogo) return enCatalogo
  const propio = personalizados.find(p => p.nombre.toLowerCase() === n)
  return propio ? normalizarPersonalizado(propio) : null
}

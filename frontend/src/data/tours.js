// ---------------------------------------------------------------------------
// Registro central de tutoriales interactivos (product tours).
//
// Cómo agregar un tutorial nuevo:
//   1. Sumá una entrada acá con id único, label, ruta (para poder "Ver de
//      nuevo" desde Perfil) y la lista de steps.
//   2. Cada step apunta a un elemento por su atributo data-tour="mi-id".
//      Ese atributo tiene que existir en el JSX de la pantalla correspondiente.
//   3. Si el elemento no está en el DOM cuando le toca el turno (por ejemplo,
//      "Repetir carga" que solo aparece después de la primera serie), el
//      overlay lo salta solo — no hace falta manejar eso acá.
//   4. `replayable: false` oculta el tutorial de la lista de "Ver de nuevo"
//      en Perfil (usalo para tutoriales que dependen de un flujo en curso,
//      como estar parado en medio de un entrenamiento).
// ---------------------------------------------------------------------------

export const TOURS = {
  bienvenida: {
    id: 'bienvenida',
    label: 'Bienvenida a FitSync',
    route: '/',
    replayable: true,
    steps: [
      {
        target: 'nav-entrenar',
        title: 'Empezá acá',
        body: 'Con este botón arrancás un entrenamiento en cualquier momento, con o sin rutina guardada.',
      },
      {
        target: 'nav-rutinas',
        title: 'Tus rutinas',
        body: 'Acá armás y organizás todas tus rutinas.',
      },
      {
        target: 'nav-historial',
        title: 'Tu progreso',
        body: 'Todo lo que entrenaste queda acá, siempre disponible.',
      },
      {
        target: 'nav-perfil',
        title: 'Perfil y ajustes',
        body: 'Tus logros, tus datos de cuenta y, si en algún momento querés repasar algo, estos mismos tutoriales.',
      },
    ],
  },

  home: {
    id: 'home',
    label: 'Pantalla de inicio',
    route: '/',
    replayable: true,
    steps: [
      {
        target: 'home-cta-entrenar',
        title: 'Carga rápida',
        body: 'Tocá esta tarjeta para empezar a entrenar ya mismo. No hace falta teclear nada durante la sesión.',
      },
      {
        target: 'home-stats',
        title: 'Tu resumen',
        body: 'Rutinas activas, sesiones de esta semana y tu racha de entrenamiento, de un vistazo.',
      },
      {
        target: 'home-rutinas',
        title: 'Tus rutinas',
        body: 'Acá vas a ver tus rutinas creadas, con acceso directo para entrenar.',
      },
      {
        target: 'home-logros',
        title: 'Logros',
        body: 'Se desbloquean solos a medida que entrenás. Es otra forma de ver tu constancia.',
      },
    ],
  },

  rutinas: {
    id: 'rutinas',
    label: 'Mis rutinas',
    route: '/rutinas',
    replayable: true,
    steps: [
      {
        target: 'rutinas-nueva',
        title: 'Creá tu primera rutina',
        body: 'Tocá acá para armar una rutina con tus ejercicios.',
      },
      {
        target: 'rutinas-entrenar-btn',
        title: 'Arrancá desde acá',
        body: 'Con este botón empezás a entrenar directamente con esa rutina ya cargada, sin tener que armar nada de nuevo.',
      },
    ],
  },

  preserie: {
    id: 'preserie',
    label: 'Antes de la primera serie',
    route: null,
    replayable: false, // depende de estar en medio de un entrenamiento, no tiene sentido "ver de nuevo" desde un botón suelto
    steps: [
      {
        target: 'preserie-historial',
        title: 'Tu referencia de hoy',
        body: 'Acá ves el peso y las reps de la última vez que hiciste este ejercicio, para saber con qué arrancar sin adivinar.',
      },
      {
        target: 'preserie-comenzar',
        title: 'Arrancá la serie',
        body: 'Tocá acá cuando estés listo para empezar a registrar.',
      },
    ],
  },

  activo: {
    id: 'activo',
    label: 'Entrenamiento activo',
    route: null,
    replayable: false,
    steps: [
      {
        target: 'activo-stepper-sumar',
        title: 'Cargá sin escribir',
        body: 'Sumá o restá peso tocando estos botones. Podés cambiar el salto (±1.25 / ±2.5 / ±5 kg) más abajo del todo.',
      },
      {
        target: 'activo-repetir',
        title: 'Repetir carga',
        body: 'Si vas a hacer el mismo peso y las mismas reps que la serie anterior, tocá acá y se completa solo.',
      },
      {
        target: 'activo-descanso',
        title: 'Cronómetro de descanso',
        body: 'Tocá el círculo para arrancar el cronómetro entre series. Te avisa cuando se cumple el tiempo.',
      },
      {
        target: 'activo-guardar',
        title: 'Guardá cada serie',
        body: 'Tocá este botón al terminar cada serie. Cuando completes todas las del ejercicio, te lleva directo al siguiente.',
      },
    ],
  },

  historial: {
    id: 'historial',
    label: 'Historial',
    route: '/historial',
    replayable: true,
    steps: [
      {
        target: 'historial-heatmap',
        title: 'Tu actividad',
        body: 'Cada cuadradito es un día. Cuanto más oscuro, más volumen entrenaste ese día.',
      },
      {
        target: 'historial-lista',
        title: 'Tus sesiones pasadas',
        body: 'El registro completo de todo lo que entrenaste, siempre disponible.',
      },
    ],
  },

  seleccionRutina: {
    id: 'seleccionRutina',
    label: 'Elegir cómo entrenar',
    route: null,
    replayable: false,
    steps: [
      {
        target: 'select-rutina-libre',
        title: 'Sesión libre',
        body: 'Si no tenés una rutina armada, empezá acá y vas cargando cada ejercicio a medida que te lo dan.',
      },
      {
        target: 'select-rutina-lista',
        title: 'Con rutina cargada',
        body: 'O elegí una de tus rutinas guardadas para entrenar con los ejercicios y objetivos ya definidos.',
      },
    ],
  },

  seleccionEjercicio: {
    id: 'seleccionEjercicio',
    label: 'Elegir ejercicio',
    route: null,
    replayable: false,
    steps: [
      {
        target: 'select-ejercicio-buscador',
        title: 'Buscá el ejercicio',
        body: 'Escribí el nombre del ejercicio que te acaban de dar y elegilo de la lista.',
      },
      {
        target: 'select-ejercicio-lista',
        title: 'Ejercicios de la rutina',
        body: 'Tocá cualquiera para empezar a registrar sus series.',
      },
      {
        target: 'select-ejercicio-agregar',
        title: 'Agregar algo extra',
        body: 'Si el profe te suma un ejercicio que no estaba en la rutina, agregalo desde acá.',
      },
      {
        target: 'select-ejercicio-finalizar',
        title: 'Terminar la sesión',
        body: 'Cuando termines todos los ejercicios, tocá acá para cerrar y guardar la sesión.',
      },
    ],
  },

  resumen: {
    id: 'resumen',
    label: 'Resumen de sesión',
    route: null,
    replayable: false,
    steps: [
      {
        target: 'resumen-stats',
        title: 'Tu sesión en números',
        body: 'Volumen total y series completadas, de un vistazo.',
      },
      {
        target: 'resumen-compartir',
        title: 'Compartí tu progreso',
        body: 'Generá una tarjeta con el resumen de la sesión para mandar por WhatsApp o subir a tu historia.',
      },
      {
        target: 'resumen-volver',
        title: 'Volver al inicio',
        body: 'Tocá acá cuando termines de revisar el resumen.',
      },
    ],
  },

  perfil: {
    id: 'perfil',
    label: 'Pantalla de perfil',
    route: '/perfil',
    replayable: true,
    steps: [
      {
        target: 'perfil-logros',
        title: 'Tus logros',
        body: 'Se van desbloqueando solos a medida que entrenás. Tocá el ícono de compartir en cualquiera ya desbloqueado para mandarlo por WhatsApp o subirlo a tu historia.',
      },
      {
        target: 'perfil-tutoriales',
        title: 'Tutoriales',
        body: 'Si querés repasar cualquiera de estos recorridos, tocalo acá y lo volvés a ver.',
      },
      {
        target: 'perfil-ajustes',
        title: 'Ajustes de cuenta',
        body: 'Tu email y la opción para cambiar la contraseña están acá.',
      },
    ],
  },
}

// Tours que tiene sentido ofrecer desde "Ver de nuevo" en Perfil
export const TOURS_REPLAYABLES = Object.values(TOURS).filter((t) => t.replayable)

// Todos los ids, para el botón "Reiniciar todos los tutoriales"
export const TOUR_IDS = Object.keys(TOURS)

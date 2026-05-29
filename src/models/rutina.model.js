import crypto from 'crypto';

const rutinasDB = [
  {
    id: 'rutina-001',
    usuario_id: 'user-123',
    nombre: 'Fuerza Superior',
    descripcion: 'Rutina enfocada en empuje y tracción para parte superior.',
    ejercicios: [
      { ejercicio_id: 'ej-001', nombre: 'Bench Press', sets: 5, reps: 5 },
      { ejercicio_id: 'ej-002', nombre: 'Barbell Row', sets: 4, reps: 6 },
      { ejercicio_id: 'ej-003', nombre: 'Overhead Press', sets: 4, reps: 6 }
    ],
    activa: true,
    creada_en: new Date('2026-05-01')
  },
  {
    id: 'rutina-002',
    usuario_id: 'user-123',
    nombre: 'Hipertrofia Piernas',
    descripcion: 'Rutina para desarrollar volumen en piernas y glúteos.',
    ejercicios: [
      { ejercicio_id: 'ej-004', nombre: 'Squat', sets: 4, reps: 10 },
      { ejercicio_id: 'ej-005', nombre: 'Leg Press', sets: 4, reps: 12 },
      { ejercicio_id: 'ej-006', nombre: 'Leg Curl', sets: 3, reps: 15 }
    ],
    activa: false,
    creada_en: new Date('2026-04-20')
  },
  {
    id: 'rutina-003',
    usuario_id: 'user-123',
    nombre: 'Full Body Balance',
    descripcion: 'Rutina completa para mantener fuerza y resistencia.',
    ejercicios: [
      { ejercicio_id: 'ej-007', nombre: 'Deadlift', sets: 3, reps: 5 },
      { ejercicio_id: 'ej-008', nombre: 'Pull-ups', sets: 4, reps: 8 },
      { ejercicio_id: 'ej-009', nombre: 'Dumbbell Lunges', sets: 3, reps: 10 }
    ],
    activa: true,
    creada_en: new Date('2026-05-10')
  }
];

export const rutinaModel = {
  getAll: async (usuarioId) => {
    return rutinasDB.filter(rutina => rutina.usuario_id === usuarioId);
  },

  getById: async (rutinaId) => {
    return rutinasDB.find(rutina => rutina.id === rutinaId);
  },

  create: async (dataRutina) => {
    const nuevaRutina = {
      id: crypto.randomUUID(),
      usuario_id: dataRutina.usuario_id,
      nombre: dataRutina.nombre,
      descripcion: dataRutina.descripcion || '',
      ejercicios: dataRutina.ejercicios || [],
      activa: dataRutina.activa ?? false,
      creada_en: new Date(dataRutina.creada_en || Date.now())
    };
    rutinasDB.push(nuevaRutina);
    return nuevaRutina;
  },

  update: async (rutinaId, datosActualizacion) => {
    const rutina = rutinasDB.find(r => r.id === rutinaId);
    if (!rutina) return null;

    Object.assign(rutina, datosActualizacion);
    return rutina;
  },

  remove: async (rutinaId) => {
    const index = rutinasDB.findIndex(r => r.id === rutinaId);
    if (index === -1) return null;

    const [rutinaEliminada] = rutinasDB.splice(index, 1);
    return rutinaEliminada;
  }
};

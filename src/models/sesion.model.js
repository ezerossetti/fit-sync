import { v4 as uuidv4 } from 'crypto';

// Datos mockeados - reemplazar con Supabase más adelante
const sesionesDB = [
  {
    id: 'sesion-001',
    usuario_id: 'user-123',
    fecha: new Date('2026-05-25'),
    rutina_id: 'rutina-001',
    rutina_nombre: 'Push Day',
    ejercicios: [
      {
        ejercicio_id: 'ej-001',
        nombre: 'Bench Press',
        series: [
          { set_num: 1, peso_kg: 80, reps: 10 },
          { set_num: 2, peso_kg: 85, reps: 8 },
          { set_num: 3, peso_kg: 90, reps: 6 }
        ]
      },
      {
        ejercicio_id: 'ej-002',
        nombre: 'Incline Dumbbell Press',
        series: [
          { set_num: 1, peso_kg: 30, reps: 12 },
          { set_num: 2, peso_kg: 32, reps: 10 }
        ]
      }
    ],
    volumen_total: 1900,
    duracion_min: 45,
    completada: true
  },
  {
    id: 'sesion-002',
    usuario_id: 'user-123',
    fecha: new Date('2026-05-26'),
    rutina_id: 'rutina-002',
    rutina_nombre: 'Pull Day',
    ejercicios: [
      {
        ejercicio_id: 'ej-003',
        nombre: 'Deadlift',
        series: [
          { set_num: 1, peso_kg: 100, reps: 5 },
          { set_num: 2, peso_kg: 110, reps: 3 },
          { set_num: 3, peso_kg: 120, reps: 1 }
        ]
      },
      {
        ejercicio_id: 'ej-004',
        nombre: 'Pull-ups',
        series: [
          { set_num: 1, peso_kg: 0, reps: 10 },
          { set_num: 2, peso_kg: 0, reps: 8 },
          { set_num: 3, peso_kg: 0, reps: 6 }
        ]
      }
    ],
    volumen_total: 1550,
    duracion_min: 50,
    completada: true
  },
  {
    id: 'sesion-003',
    usuario_id: 'user-123',
    fecha: new Date('2026-05-27'),
    rutina_id: 'rutina-003',
    rutina_nombre: 'Leg Day',
    ejercicios: [
      {
        ejercicio_id: 'ej-005',
        nombre: 'Squat',
        series: [
          { set_num: 1, peso_kg: 100, reps: 8 },
          { set_num: 2, peso_kg: 110, reps: 6 },
          { set_num: 3, peso_kg: 120, reps: 4 }
        ]
      },
      {
        ejercicio_id: 'ej-006',
        nombre: 'Leg Press',
        series: [
          { set_num: 1, peso_kg: 200, reps: 12 },
          { set_num: 2, peso_kg: 220, reps: 10 }
        ]
      },
      {
        ejercicio_id: 'ej-007',
        nombre: 'Leg Curl',
        series: [
          { set_num: 1, peso_kg: 80, reps: 12 },
          { set_num: 2, peso_kg: 85, reps: 10 }
        ]
      }
    ],
    volumen_total: 3380,
    duracion_min: 55,
    completada: false
  }
];

export const sesionModel = {
  // Obtener todas las sesiones de un usuario
  getAll: async (usuarioId) => {
    return sesionesDB.filter(sesion => sesion.usuario_id === usuarioId);
  },

  // Obtener una sesión por ID
  getById: async (sesionId) => {
    return sesionesDB.find(sesion => sesion.id === sesionId);
  },

  // Crear una nueva sesión
  create: async (dataSesion) => {
    const nuevaSesion = {
      id: `sesion-${Date.now()}`,
      usuario_id: dataSesion.usuario_id,
      fecha: new Date(dataSesion.fecha),
      rutina_id: dataSesion.rutina_id,
      rutina_nombre: dataSesion.rutina_nombre,
      ejercicios: dataSesion.ejercicios || [],
      volumen_total: dataSesion.volumen_total || 0,
      duracion_min: dataSesion.duracion_min || 0,
      completada: dataSesion.completada || false
    };
    sesionesDB.push(nuevaSesion);
    return nuevaSesion;
  },

  // Actualizar una sesión
  update: async (sesionId, datosActualizacion) => {
    const sesion = sesionesDB.find(s => s.id === sesionId);
    if (!sesion) return null;

    Object.assign(sesion, datosActualizacion);
    return sesion;
  },

  // Eliminar una sesión
  remove: async (sesionId) => {
    const index = sesionesDB.findIndex(s => s.id === sesionId);
    if (index === -1) return null;

    const [sesionEliminada] = sesionesDB.splice(index, 1);
    return sesionEliminada;
  }
};

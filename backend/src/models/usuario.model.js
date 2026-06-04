import crypto from 'crypto';

const usuariosDB = [
  {
    id: 'usuario-001',
    nombre: 'María López',
    email: 'maria.lopez@example.com',
    rol: 'cliente',
    activo: true,
    creado_en: new Date('2026-01-10')
  },
  {
    id: 'usuario-002',
    nombre: 'Juan Torres',
    email: 'juan.torres@example.com',
    rol: 'admin',
    activo: true,
    creado_en: new Date('2026-02-18')
  },
  {
    id: 'usuario-003',
    nombre: 'Ana García',
    email: 'ana.garcia@example.com',
    rol: 'cliente',
    activo: false,
    creado_en: new Date('2026-03-05')
  }
];

export const usuarioModel = {
  getAll: async () => {
    return usuariosDB;
  },

  getById: async (usuarioId) => {
    return usuariosDB.find(usuario => usuario.id === usuarioId);
  },

  create: async (dataUsuario) => {
    const nuevoUsuario = {
      id: crypto.randomUUID(),
      nombre: dataUsuario.nombre,
      email: dataUsuario.email,
      rol: dataUsuario.rol || 'cliente',
      activo: dataUsuario.activo ?? true,
      creado_en: new Date(dataUsuario.creado_en || Date.now())
    };

    usuariosDB.push(nuevoUsuario);
    return nuevoUsuario;
  },

  update: async (usuarioId, datosActualizacion) => {
    const usuario = usuariosDB.find(u => u.id === usuarioId);
    if (!usuario) return null;

    Object.assign(usuario, datosActualizacion);
    return usuario;
  },

  remove: async (usuarioId) => {
    const index = usuariosDB.findIndex(u => u.id === usuarioId);
    if (index === -1) return null;

    const [usuarioEliminado] = usuariosDB.splice(index, 1);
    return usuarioEliminado;
  }
};

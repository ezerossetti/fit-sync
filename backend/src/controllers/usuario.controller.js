import { usuarioModel } from '../models/usuario.model.js';
import { validMissionSelection } from '../utils/missions.js';

export const usuarioController = {
  missions: async (req,res) => {
    const {month,ids}=req.body||{};
    if(!validMissionSelection(month,ids))return res.status(400).json({message:'Elegí una misión de días y, si querés, la de semanas.'});
    try {
      const profile=await usuarioModel.getById(req.usuarioId);
      if(!profile)return res.status(404).json({message:'Perfil no encontrado'});
      const history={...profile.preferencias?.misiones,[month]:ids};
      const misiones=Object.fromEntries(Object.entries(history).sort(([a],[b])=>b.localeCompare(a)).slice(0,24));
      await usuarioModel.update(req.usuarioId,{preferencias:{...profile.preferencias,misiones}});
      res.json({success:true,data:misiones});
    }catch{res.status(500).json({message:'No pudimos guardar tus misiones. Revisá la conexión.'});}
  },
  // Perfil del usuario logueado (resuelto por el token, no por :id en la URL)
  getMe: async (req, res) => {
    try {
      const usuario = await usuarioModel.getById(req.usuarioId);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
      }

      res.status(200).json({ success: true, data: usuario });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener el perfil', error: error.message });
    }
  },

  // Actualizar datos del propio perfil (nombre y/o preferencias de entrenamiento)
  updateMe: async (req, res) => {
    try {
      const { nombre, preferencias } = req.body;

      if (nombre === undefined && preferencias === undefined) {
        return res.status(400).json({ success: false, message: 'No se envió ningún campo para actualizar (nombre o preferencias)' });
      }

      const cambios = {};
      if (nombre !== undefined) cambios.nombre = nombre;
      if (preferencias !== undefined) cambios.preferencias = preferencias;

      const usuarioActualizado = await usuarioModel.update(req.usuarioId, cambios);

      if (!usuarioActualizado) {
        return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Perfil actualizado exitosamente', data: usuarioActualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar el perfil', error: error.message });
    }
  }
};

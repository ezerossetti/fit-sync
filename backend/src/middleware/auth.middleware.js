import { supabase } from '../supabase.js';

// Verifica el JWT que manda el frontend (obtenido de supabase.auth.getSession())
// y, si es válido, deja el id del usuario logueado en req.usuarioId.
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Falta el token de autenticación' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }

    req.usuarioId = data.user.id;
    req.usuarioEmail = data.user.email;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'No se pudo validar la sesión', error: error.message });
  }
};

import { Router } from 'express';
import { coachController } from '../controllers/coach.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

// POST: chat libre con el coach
router.post('/coach/chat', (req, res) => coachController.chat(req, res));

// GET: historial de chat guardado
router.get('/coach/historial', (req, res) => coachController.historial(req, res));

// POST: comentario automático post-sesión
router.post('/coach/comentario-sesion', (req, res) => coachController.comentarioSesion(req, res));

// POST: resumen semanal/mensual (con cache)
router.post('/coach/resumen', (req, res) => coachController.resumen(req, res));

// POST: sugerencia de ejercicios nuevos
router.post('/coach/sugerir-ejercicios', (req, res) => coachController.sugerirEjercicios(req, res));

export default router;

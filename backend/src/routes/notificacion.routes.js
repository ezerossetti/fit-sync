import { Router } from 'express';
import { notificacionController } from '../controllers/notificacion.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint protegido por CRON_SECRET, no por sesión de usuario: lo llama un
// cron externo (cron-job.org) o el node-cron in-process. Va antes de requireAuth.
router.post('/notificaciones/chequeo-inactividad', (req, res) => notificacionController.chequeoInactividad(req, res));

router.use(requireAuth);

router.get('/notificaciones/vapid-public-key', (req, res) => notificacionController.vapidPublicKey(req, res));
router.post('/notificaciones/suscribir', (req, res) => notificacionController.suscribir(req, res));
router.post('/notificaciones/desuscribir', (req, res) => notificacionController.desuscribir(req, res));

export default router;

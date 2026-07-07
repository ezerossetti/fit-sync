import { Router } from 'express';
import sesionesRouter from './sesiones.routes.js';
import rutinasRouter from './rutinas.routes.js';
import usuarioRouter from './usuario.routes.js';
import ejerciciosRouter from './ejercicios.routes.js';
import coachRouter from './coach.routes.js';
import notificacionRouter from './notificacion.routes.js';

const router = Router();

// Endpoint de health check para verificar el estado de la API
router.get('/health', async (req, res) => {
  try {
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Rutas de sesiones
router.use('/', sesionesRouter);

// Rutas de rutinas
router.use('/', rutinasRouter);

// Rutas de usuarios
router.use('/', usuarioRouter);

// Rutas de ejercicios personalizados
router.use('/', ejerciciosRouter);

// Rutas del coach IA
router.use('/', coachRouter);

// Rutas de notificaciones push
router.use('/', notificacionRouter);

export default router;

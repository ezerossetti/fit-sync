import { Router } from 'express';
import sesionesRouter from './sesiones.routes.js';
import rutinasRouter from './rutinas.routes.js';

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

export default router;

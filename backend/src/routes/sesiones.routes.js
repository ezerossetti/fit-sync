import { Router } from 'express';
import { sesionController } from '../controllers/sesion.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

// GET: Obtener todas las sesiones del usuario logueado
router.get('/sesiones', (req, res) => {
  req.params.usuarioId = req.usuarioId;
  sesionController.getAll(req, res);
});

// GET: Obtener una sesión específica por ID
router.get('/sesiones/:sesionId', (req, res) => sesionController.getById(req, res));

// POST: Crear una nueva sesión
router.post('/sesiones', (req, res) => {
  req.params.usuarioId = req.usuarioId;
  sesionController.create(req, res);
});

// PUT: Actualizar una sesión
router.put('/sesiones/:sesionId', (req, res) => sesionController.update(req, res));

// DELETE: Eliminar una sesión
router.delete('/sesiones/:sesionId', (req, res) => sesionController.remove(req, res));

export default router;

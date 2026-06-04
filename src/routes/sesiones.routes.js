import { Router } from 'express';
import { sesionController } from '../controllers/sesion.controller.js';

const router = Router();

// Rutas para sesiones (con usuarioId hardcodeado por ahora)
const usuarioId = 'user-123';

// GET: Obtener todas las sesiones del usuario
router.get('/sesiones', (req, res) => {
  req.params.usuarioId = 'user-123';
  sesionController.getAll(req, res);
});

// GET: Obtener una sesión específica por ID
router.get('/sesiones/:sesionId', (req, res) => sesionController.getById(req, res));

// POST: Crear una nueva sesión
router.post('/sesiones', (req, res) => {
  req.params.usuarioId = usuarioId;
  sesionController.create(req, res);
});

// PATCH: Actualizar una sesión
router.patch('/sesiones/:sesionId', (req, res) => sesionController.update(req, res));

// DELETE: Eliminar una sesión
router.delete('/sesiones/:sesionId', (req, res) => sesionController.remove(req, res));

export default router;

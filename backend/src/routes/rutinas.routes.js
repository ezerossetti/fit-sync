import { Router } from 'express';
import { rutinaController } from '../controllers/rutina.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/rutinas', (req, res) => {
  req.params.usuarioId = req.usuarioId;
  rutinaController.getAll(req, res);
});

router.get('/rutinas/:rutinaId', (req, res) => rutinaController.getById(req, res));

router.post('/rutinas', (req, res) => {
  req.params.usuarioId = req.usuarioId;
  rutinaController.create(req, res);
});

router.put('/rutinas/:rutinaId', (req, res) => rutinaController.update(req, res));

router.delete('/rutinas/:rutinaId', (req, res) => rutinaController.remove(req, res));

export default router;

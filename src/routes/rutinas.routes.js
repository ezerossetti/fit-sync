import { Router } from 'express';
import { rutinaController } from '../controllers/rutina.controller.js';

const router = Router();
const usuarioId = 'user-123';

router.get('/rutinas', (req, res) => {
  req.params.usuarioId = usuarioId;
  rutinaController.getAll(req, res);
});

router.get('/rutinas/:rutinaId', (req, res) => rutinaController.getById(req, res));

router.post('/rutinas', (req, res) => {
  req.params.usuarioId = usuarioId;
  rutinaController.create(req, res);
});

router.patch('/rutinas/:rutinaId', (req, res) => rutinaController.update(req, res));

router.delete('/rutinas/:rutinaId', (req, res) => rutinaController.remove(req, res));

export default router;

import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

// GET: Perfil propio
router.get('/usuario/me', usuarioController.getMe);

// PUT: Actualizar perfil propio
router.put('/usuario/me', usuarioController.updateMe);

export default router;

import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller.js';

const router = Router();

// GET: Obtener todos los usuarios
router.get('/usuario', usuarioController.getAll);

// GET: Obtener un usuario por ID
router.get('/usuario/:usuarioId', usuarioController.getById);

// POST: Crear nuevo usuario
router.post('/usuario', usuarioController.create);

// PUT: Actualizar usuario
router.put('/usuario/:usuarioId', usuarioController.update);

// DELETE: Eliminar usuario
router.delete('/usuario/:usuarioId', usuarioController.remove);

export default router;

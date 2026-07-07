import { Router } from 'express';
import { ejercicioPersonalizadoController } from '../controllers/ejercicioPersonalizado.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

// GET: Obtener todos los ejercicios personalizados del usuario logueado
router.get('/ejercicios-personalizados', (req, res) => ejercicioPersonalizadoController.getAll(req, res));

// POST: Crear un ejercicio personalizado
router.post('/ejercicios-personalizados', (req, res) => ejercicioPersonalizadoController.create(req, res));

// DELETE: Eliminar un ejercicio personalizado propio
router.delete('/ejercicios-personalizados/:ejercicioId', (req, res) => ejercicioPersonalizadoController.remove(req, res));

export default router;

import { Router } from 'express';

const router = Router();

// Endpoint de health check para verificar el estado de la API
router.get('/health', async (req, res) => {
  try {
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;

import express from 'express';
import cors from 'cors';
import router from './routes/index.routes.js';
import backupRouter from './routes/backup.routes.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use('/api/backup', express.json({ limit: '10mb' }), backupRouter);
app.use(express.json());

// Prefijo global para las rutas de la API
app.use('/api', router);

export default app;

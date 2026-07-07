import 'dotenv/config';
import cron from 'node-cron';
import app from './src/app.js';
import { correrChequeoInactividad } from './src/services/inactividad.job.js';

const PORT = process.env.PORT || 3000;

// Función asíncrona para inicializar el servidor
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });

    // Cron in-process: best-effort. En Render free tier el server se duerme
    // a los 15 min de inactividad, así que esto solo corre si el proceso
    // está despierto a esa hora. Para que ande siempre, además está expuesto
    // el endpoint POST /api/notificaciones/chequeo-inactividad (protegido por
    // CRON_SECRET) para pegarle desde un cron externo como cron-job.org.
    if (process.env.VAPID_PRIVATE_KEY) {
      cron.schedule('0 13 * * *', async () => {
        // 13:00 UTC ≈ 10:00 en Argentina
        try {
          const resultado = await correrChequeoInactividad();
          console.log('🔔 Chequeo de inactividad (cron in-process):', resultado);
        } catch (error) {
          console.error('Error en cron de inactividad:', error.message);
        }
      });
    }
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

startServer();

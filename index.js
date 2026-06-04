import app from './src/app.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

// Función asíncrona para inicializar el servidor
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

startServer();

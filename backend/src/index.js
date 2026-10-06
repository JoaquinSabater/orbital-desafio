import { app } from './app.js';
import { config } from './config/env.js';

app.listen(config.port, (error) => {
  if (error) {
    console.error(`No se pudo iniciar el servidor en el puerto ${config.port}:`, error.message);
    process.exit(1);
  }
  console.log(`API de Orbital escuchando en http://localhost:${config.port}`);
});

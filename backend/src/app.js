import cors from 'cors';
import express from 'express';

import { config } from './config/env.js';
import { errorHandler, rutaNoEncontrada } from './middlewares/errorHandler.js';
import { atencionesRouter } from './routes/atenciones.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/atenciones', atencionesRouter);

app.use(rutaNoEncontrada);
app.use(errorHandler);

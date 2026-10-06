import { Router } from 'express';

import { crearAtencion } from '../controllers/atenciones.controller.js';

export const atencionesRouter = Router();

atencionesRouter.post('/', crearAtencion);

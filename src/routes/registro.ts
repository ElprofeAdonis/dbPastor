import { Router } from 'express';
import { registrarSuperAdminHandler } from '../controllers/RegistroController.js';

const router = Router();

router.post('/admin', registrarSuperAdminHandler);

export default router;
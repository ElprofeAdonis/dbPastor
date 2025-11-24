// src/routes/registro.ts

import { Router } from 'express';
import { registrarSuperAdminHandler } from '../controllers/RegistroController.js';
// NOTA: No necesitamos authenticateToken/authorizeRole para esta ruta

const router = Router();

// ===============================================
// RUTA: POST /api/registro/admin (Registro Inicial)
// ===============================================
// Esta ruta no requiere token para registrar el primer admin
router.post('/admin', registrarSuperAdminHandler);

export default router;
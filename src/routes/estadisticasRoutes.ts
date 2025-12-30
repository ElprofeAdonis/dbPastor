// src/routes/estadisticasRoutes.js
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

import {
    estadisticasGeneralesController,
    bautismosPorAnioController,
    iglesiasPorDistritoController,
    miembrosPorIglesiaController,
    topIglesiasMiembrosController,
    dashboardAsociacionController
} from "../controllers/estadisticasController.js";

const router = Router();

const soloSecretaria = [
    authenticateToken,
    authorizeRole(["SECRETARIAAsociacion", "SuperADMIN"])
];

router.get("/generales", ...soloSecretaria, estadisticasGeneralesController);

router.get("/bautismos-anio", ...soloSecretaria, bautismosPorAnioController);

router.get("/iglesias-distrito", ...soloSecretaria, iglesiasPorDistritoController);

router.get("/miembros-iglesia", ...soloSecretaria, miembrosPorIglesiaController);

router.get("/top-iglesias-miembros", ...soloSecretaria, topIglesiasMiembrosController);

// 🚀 Dashboard completo de la asociación (1 solo endpoint)
router.get("/dashboard-asociacion", ...soloSecretaria, dashboardAsociacionController);

export default router;

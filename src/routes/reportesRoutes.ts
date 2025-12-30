// src/routes/reportesRoutes.js
import { Router } from "express";

import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

import {
    crecimientoMensualController,
    iglesiasSinPastorController,
    actividadPastoralController,
    comparacionDistritosIglesiasController,
    comparacionDistritosMiembrosController,
    topIglesiasGrandesController,
    topDistritosGrandesController
} from "../controllers/reportesController.js";

const router = Router();

const soloSecretaria = [
    authenticateToken,
    authorizeRole(["SECRETARIAAsociacion", "SuperADMIN"])
];

// Crecimiento
router.get("/crecimiento-mensual", ...soloSecretaria, crecimientoMensualController);

// Iglesias sin pastor
router.get("/iglesias-sin-pastor", ...soloSecretaria, iglesiasSinPastorController);

// Actividad pastoral
router.get("/actividad-pastoral", ...soloSecretaria, actividadPastoralController);

// Comparación distritos - iglesias
router.get("/comparacion-distritos-iglesias", ...soloSecretaria, comparacionDistritosIglesiasController);

// Comparación distritos - miembros
router.get("/comparacion-distritos-miembros", ...soloSecretaria, comparacionDistritosMiembrosController);

// Top 10 iglesias grandes
router.get("/top-iglesias", ...soloSecretaria, topIglesiasGrandesController);

// Top 10 distritos grandes
router.get("/top-distritos", ...soloSecretaria, topDistritosGrandesController);

export default router;

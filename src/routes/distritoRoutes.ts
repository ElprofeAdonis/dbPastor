// src/routes/distritoRoutes.js
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

import {
    crearDistritoController,
    editarDistritoController,
    eliminarDistritoController,
    listarDistritosAsociacionController,
    obtenerDistritoController,
    contarDistritosAsociacionController,
    getEstadisticasDistritoController
} from "../controllers/distritoController.js";

const router = Router();

// Solo SuperADMIN puede crear/editar/eliminar
const soloAdmin = [
    authenticateToken,
    authorizeRole(["SuperADMIN"])
];

// Solo SECRETARIAAsociacion y SuperADMIN pueden ver
const soloSecretaria = [
    authenticateToken,
    authorizeRole(["SECRETARIAAsociacion", "SuperADMIN"])
];
router.get("/count", ...soloSecretaria, contarDistritosAsociacionController);

// Estadísticas del distrito
router.get("/:id/estadisticas", ...soloSecretaria, getEstadisticasDistritoController);

// Crear distrito
router.post("/", ...soloAdmin, crearDistritoController);

// Editar distrito
router.put("/:id", ...soloAdmin, editarDistritoController);

// Eliminar distrito
router.delete("/:id", ...soloAdmin, eliminarDistritoController);

// Listar distritos según la asociación de la secretaria
router.get("/", ...soloSecretaria, listarDistritosAsociacionController);

// Obtener detalles de un distrito, iglesia, pastor
router.get("/:id", ...soloSecretaria, obtenerDistritoController);







export default router;

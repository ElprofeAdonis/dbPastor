import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { getAsociacionPerfil, getDistritos, getIglesiasAsociacion, getPastoresAsociacion } from "../services/AsociaciónService.js";

const router = Router();

const soloSecretariaAsociacion = [
    authenticateToken,
    authorizeRole(["SECRETARIAAsociacion", "SuperADMIN"])
];

// 1. Perfil de la asociación
router.get("/perfil", ...soloSecretariaAsociacion, async (req, res) => {
    // @ts-ignore
    const usuarioId = req.user.id;
    try {
        const data = await getAsociacionPerfil(usuarioId);
        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al get de perfil secretaria asociacion.";
        return res.status(409).json({ message: errorMessage });
    }
});

// 2. Distritos
router.get("/distritos", ...soloSecretariaAsociacion, async (req, res) => {
    // @ts-ignore
    const usuarioId = req.user.id;
    try {
        const data = await getDistritos(usuarioId);
        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al get de distritos secretaria asociacion.";
        return res.status(409).json({ message: errorMessage });
    }
});

// 3. Iglesias de una asociación
router.get("/iglesias", ...soloSecretariaAsociacion, async (req, res) => {
    // @ts-ignore
    const usuarioId = req.user.id;
    try {
        const data = await getIglesiasAsociacion(usuarioId);
        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al get de iglesias secretaria asociacion.";
        return res.status(409).json({ message: errorMessage });
    }
});

// 4. Pastores de la asociación
router.get("/pastores", ...soloSecretariaAsociacion, async (req, res) => {
    // @ts-ignore
    const usuarioId = req.user.id;
    try {
        const data = await getPastoresAsociacion(usuarioId);
        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al get de pastores secretaria asociacion.";
        return res.status(409).json({ message: errorMessage });
    }
});

export default router;

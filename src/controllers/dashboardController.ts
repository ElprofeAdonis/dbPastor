import { Request, Response } from "express";
import { obtenerEstructuraGlobal } from "../services/dashboardService.js";

export const dashboardGlobalController = async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        if (user.rol !== "SuperADMIN") {
            return res
                .status(403)
                .json({ message: "Solo el SuperADMIN puede ver la estructura global." });
        }

        const data = await obtenerEstructuraGlobal();

        return res.json(data);
    } catch (error) {
        const msg =
            error instanceof Error
                ? error.message
                : "Error desconocido al obtener estructura global.";
        return res.status(409).json({ message: msg });
    }
};

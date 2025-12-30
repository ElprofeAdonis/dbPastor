// src/controllers/reportesController.js

import {
    crecimientoMensual,
    iglesiasSinPastor,
    actividadPastoral,
    comparacionDistritosIglesias,
    comparacionDistritosMiembros,
    topIglesiasGrandes,
    topDistritosGrandes
} from "../services/reportesService.js";
import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const obtenerAsociacionIdDesdeContexto = async (req: Request): Promise<string> => {
    const user = req.user!; // viene del JWT

    // 1. Si es SECRETARIAAsociacion -> leer desde la BD
    if (user.rol === "SECRETARIAAsociacion") {
        const usuarioDB = await prisma.usuario.findUnique({
            where: { id: user.id },
            select: { asociacionId: true }
        });

        if (!usuarioDB || !usuarioDB.asociacionId) {
            throw new Error("El usuario no está asignado a una asociación.");
        }

        return usuarioDB.asociacionId;
    }

    // 2. Si es SuperADMIN -> requiere ?asociacionId=...
    if (user.rol === "SuperADMIN") {
        const fromQuery = req.query.asociacionId;
        if (typeof fromQuery === "string" && fromQuery.trim() !== "") {
            return fromQuery.trim();
        }
        throw new Error("SuperADMIN debe enviar ?asociacionId=...");
    }

    // 3. Otros roles no están autorizados
    throw new Error("Rol no autorizado para ver reportes de asociación.");
};


export const crecimientoMensualController = async (req: Request, res: Response) => {
    try {
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);

        const datos = await crecimientoMensual(asociacionId);
        res.json(datos);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al crecimineto Mensual";
        return res.status(409).json({ message: errorMessage });
    }
};

export const iglesiasSinPastorController = async (req: Request, res: Response) => {
    try {
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);
        const datos = await iglesiasSinPastor(asociacionId);
        res.json(datos);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido a iglesia sin pastor";
        return res.status(409).json({ message: errorMessage });
    }
};

export const actividadPastoralController = async (req: Request, res: Response) => {
    try {
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);
        const datos = await actividadPastoral(asociacionId);
        res.json(datos);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido actividad del pastor";
        return res.status(409).json({ message: errorMessage });
    }
};

export const comparacionDistritosIglesiasController = async (req: Request, res: Response) => {
    try {
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);
        const datos = await comparacionDistritosIglesias(asociacionId);
        res.json(datos);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido comparacion de distritos iglesias";
        return res.status(409).json({ message: errorMessage });
    }
};

export const comparacionDistritosMiembrosController = async (req: Request, res: Response) => {
    try {
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);
        const datos = await comparacionDistritosMiembros(asociacionId);
        res.json(datos);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido a comparacion distrito miembros";
        return res.status(409).json({ message: errorMessage });
    }
};

export const topIglesiasGrandesController = async (req: Request, res: Response) => {
    try {
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);
        const datos = await topIglesiasGrandes(asociacionId);
        res.json(datos);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido a top iglesia grnades";
        return res.status(409).json({ message: errorMessage });
    }
};

export const topDistritosGrandesController = async (req: Request, res: Response) => {
    try {
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);
        const datos = await topDistritosGrandes(asociacionId);
        res.json(datos);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido top distritos grandes";
        return res.status(409).json({ message: errorMessage });
    }
};

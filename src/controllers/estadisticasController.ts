// src/controllers/estadisticasController.js

import {
    estadisticasAsociacion,
    bautismosPorAnio,
    iglesiasPorDistrito,
    miembrosPorIglesia,
    topIglesiasMiembros,
    dashboardAsociacionData,
    topIglesiasBautismos
} from "../services/estadisticasService.js";
import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const obtenerAsociacionIdDesdeContexto = async (req: Request): Promise<string> => {
    const user = req.user!; // viene del JWT

    // 1. SECRETARIAAsociacion -> se obtiene desde la BD (tabla Usuario)
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

    // 2. SuperADMIN -> debe enviar ?asociacionId=...
    if (user.rol === "SuperADMIN") {
        const fromQuery = req.query.asociacionId;
        if (typeof fromQuery === "string" && fromQuery.trim() !== "") {
            return fromQuery.trim();
        }
        throw new Error("SuperADMIN debe enviar ?asociacionId=...");
    }

    // 3. Otros roles no autorizados
    throw new Error("Rol no autorizado para ver estadísticas de asociación.");
};


export const estadisticasGeneralesController = async (req: Request, res: Response) => {
    try {
        // 🔥 Aquí se resuelve asociacionId según el rol (secretaria o superadmin)
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);

        const data = await estadisticasAsociacion(asociacionId);

        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al estadisticas generales";
        return res.status(409).json({ message: errorMessage });
    }
};

export const bautismosPorAnioController = async (req: Request, res: Response) => {
    try {
        // 🔥 Aquí se resuelve asociacionId según el rol (secretaria o superadmin)
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);
        const data = await bautismosPorAnio(asociacionId);

        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al bautismo por anio";
        return res.status(409).json({ message: errorMessage });
    }
};

export const iglesiasPorDistritoController = async (req: Request, res: Response) => {
    try {
        // 🔥 Aquí se resuelve asociacionId según el rol (secretaria o superadmin)
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);

        const data = await iglesiasPorDistrito(asociacionId);

        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al iglesia por distrito";
        return res.status(409).json({ message: errorMessage });
    }
};

export const miembrosPorIglesiaController = async (req: Request, res: Response) => {
    try {
        // 🔥 Aquí se resuelve asociacionId según el rol (secretaria o superadmin)
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);

        const data = await miembrosPorIglesia(asociacionId);

        res.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al miembro por iglesia";
        return res.status(409).json({ message: errorMessage });
    }
};

export const topIglesiasMiembrosController = async (req: Request, res: Response) => {
    try {
        // 🔥 Aquí se resuelve asociacionId según el rol (secretaria o superadmin)
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);

        const data = await topIglesiasMiembros(asociacionId);
        return res.json(data);
    } catch (error) {
        const msg =
            error instanceof Error ? error.message : "Error desconocido al obtener top de iglesias por miembros.";
        return res.status(400).json({ message: msg });
    }
};


export const dashboardAsociacionController = async (req: Request, res: Response) => {
    try {
        // 🔥 Aquí se resuelve asociacionId según el rol (secretaria o superadmin)
        const asociacionId = await obtenerAsociacionIdDesdeContexto(req);

        const data = await dashboardAsociacionData(asociacionId);

        return res.json(data);
    } catch (error) {
        const msg =
            error instanceof Error ? error.message : "Error desconocido al obtener dashboard de la asociación.";
        return res.status(400).json({ message: msg });
    }
};


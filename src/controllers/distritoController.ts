// src/controllers/distritoController.js
import {
    crearDistrito,
    editarDistrito,
    eliminarDistrito,
    listarDistritosAsociacion,
    contarDistritosAsociacion,
    obtenerDistritoConDetalle,
    getEstadisticasDistrito
} from "../services/distritoService.js";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { obtenerAsociacion } from "../services/asociacionService.js";
const prisma = new PrismaClient();

// Crear distrito
export const crearDistritoController = async (req: Request, res: Response) => {
    try {
        const { nombre, asociacionId } = req.body;

        const nuevo = await crearDistrito(nombre, asociacionId);

        res.status(201).json({
            message: "Distrito creado con éxito",
            data: nuevo
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al editar Asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

// Editar distrito
export const editarDistritoController = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre } = req.body;

    try {
        const actualizado = await editarDistrito(id, nombre);

        res.json({
            message: "Distrito actualizado correctamente",
            data: actualizado
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al editar Asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

// Eliminar distrito
export const eliminarDistritoController = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await eliminarDistrito(id);

        res.json({ message: "Distrito eliminado correctamente" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al editar Asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

export const listarDistritosAsociacionController = async (req: Request, res: Response) => {
    try {
        const usuario = req.user!; // viene del JWT

        // Si es SuperADMIN -> listar todos los distritos
        if (usuario.rol === "SuperADMIN") {
            const distritos = await prisma.distrito.findMany({
                include: {
                    iglesias: true,
                    pastores: {
                        include: {
                            usuario: {
                                select: { nombre: true, apellidos: true }
                            }
                        }
                    }
                },
                orderBy: { nombre: "asc" }
            });

            return res.json(distritos);
        }

        // Si es SECRETARIAAsociacion -> buscar su asociacionId en BD
        const userDb = await prisma.usuario.findUnique({
            where: { id: usuario.id },
            select: { asociacionId: true }
        });

        if (!userDb || !userDb.asociacionId) {
            throw new Error("Usuario no está asignado a ninguna asociación.");
        }

        const distritos = await listarDistritosAsociacion(userDb.asociacionId);
        return res.json(distritos);

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al listar distritos.";
        return res.status(409).json({ message: errorMessage });
    }
};


// Obtener distrito + iglesias + pastores
export const obtenerDistritoController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const distrito = await obtenerDistritoConDetalle(id); // 👈 aquí

        if (!distrito) {
            return res.status(404).json({ message: "Distrito no encontrado" });
        }

        res.json(distrito);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al obtener distrito.";
        return res.status(409).json({ message: errorMessage });
    }
};

// obtener cantidad de distritos
export const contarDistritosAsociacionController = async (req: Request, res: Response) => {
    try {
        const usuario = req.user!;

        // SuperADMIN → puede pedir conteo de todos o especificar asociacionId por query
        if (usuario.rol === "SuperADMIN") {
            const asociacionId = req.query.asociacionId as string;

            if (!asociacionId) {
                return res.status(400).json({ message: "Debe enviar asociacionId en query para SuperADMIN." });
            }

            const total = await contarDistritosAsociacion(asociacionId);
            return res.json({ asociacionId, totalDistritos: total });
        }

        // SECRETARIAAsociacion → tomar su asociacion de BD
        const userDb = await prisma.usuario.findUnique({
            where: { id: usuario.id },
            select: { asociacionId: true }
        });

        if (!userDb || !userDb.asociacionId) {
            throw new Error("Usuario no está asignado a ninguna asociación.");
        }

        const total = await contarDistritosAsociacion(userDb.asociacionId);
        return res.json({
            asociacionId: userDb.asociacionId,
            totalDistritos: total
        });

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al contar distritos.";
        return res.status(409).json({ message: errorMessage });
    }
};

export const getEstadisticasDistritoController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // id del distrito

        // Opcional: verificar que el distrito exista
        const distrito = await prisma.distrito.findUnique({
            where: { id },
            select: { id: true, nombre: true }
        });

        if (!distrito) {
            return res.status(404).json({ message: "Distrito no encontrado" });
        }

        const estadisticas = await getEstadisticasDistrito(id);

        return res.json({
            distritoId: distrito.id,
            distritoNombre: distrito.nombre,
            ...estadisticas
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al obtener estadísticas del distrito.";
        return res.status(409).json({ message: errorMessage });
    }
};





// src/services/AsociacionService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear asociación
export const crearAsociacion = async (nombre: string) => {
    const existente = await prisma.asociacion.findFirst({ where: { nombre } });

    if (existente) throw new Error("Ya existe una asociación con este nombre.");

    return prisma.asociacion.create({
        data: { nombre }
    });
};

// Editar asociación
export const editarAsociacion = async (id: string, nombre: string) => {
    return prisma.asociacion.update({
        where: { id },
        data: { nombre }
    });
};

// Obtener asociación por ID
export const obtenerAsociacion = async (id: string) => {
    return prisma.asociacion.findUnique({
        where: { id },
        include: {
            distritos: true,
            pastores: {
                include: {
                    usuario: { select: { nombre: true, apellidos: true } }
                }
            },
            secretarias: true
        }
    });
};

// Listar todas las asociaciones
export const listarAsociaciones = async () => {
    return prisma.asociacion.findMany({
        orderBy: { nombre: "asc" }
    });
};

// Eliminar asociación
export const eliminarAsociacion = async (id: string) => {
    return prisma.asociacion.delete({
        where: { id }
    });
};
/**
 * 1. Perfil de la asociación para la secretaria asignada
 */
export const getAsociacionPerfil = async (usuarioId: string) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { asociacionId: true }
    });

    if (!usuario || !usuario.asociacionId) {
        throw new Error("Secretaria no asignada a ninguna asociación.");
    }

    return prisma.asociacion.findUnique({
        where: { id: usuario.asociacionId },
        include: {
            distritos: true,
            pastores: {
                include: {
                    usuario: {
                        select: { nombre: true, apellidos: true }
                    }
                }
            }
        }
    });
};

/**
 * 2. Obtener distritos de la asociación
 */
export const getDistritos = async (usuarioId: string) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { asociacionId: true }
    });

    if (!usuario || !usuario.asociacionId) {
        throw new Error("Secretaria no asignada a ninguna asociación.");
    }

    return prisma.distrito.findMany({
        where: { asociacionId: usuario.asociacionId }
    });
};

/**
 * 3. Obtener iglesias de la asociación (a través de distritos)
 */
export const getIglesiasAsociacion = async (usuarioId: string) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { asociacionId: true }
    });

    if (!usuario || !usuario.asociacionId) {
        throw new Error("Secretaria no asignada a ninguna asociación.");
    }

    return prisma.iglesia.findMany({
        where: {
            distrito: {
                asociacionId: usuario.asociacionId
            }
        },
        include: {
            distrito: true,
            pastor: {
                include: {
                    usuario: {
                        select: { nombre: true, apellidos: true }
                    }
                }
            }
        }
    });
};

/**
 * 4. Obtener pastores de la asociación
 */
export const getPastoresAsociacion = async (usuarioId: string) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { asociacionId: true }
    });

    if (!usuario || !usuario.asociacionId) {
        throw new Error("Secretaria no asignada a ninguna asociación.");
    }

    return prisma.pastor.findMany({
        where: { asociacionId: usuario.asociacionId },
        include: {
            usuario: {
                select: { nombre: true, apellidos: true, telefono: true }
            },
            distrito: true
        }
    });
};

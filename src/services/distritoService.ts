// src/services/distritoService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Crear un distrito
 */
export const crearDistrito = async (nombre: string, asociacionId: string) => {
    if (!nombre) throw new Error("El nombre es obligatorio.");
    if (!asociacionId) throw new Error("El asociacionId es obligatorio.");

    const existente = await prisma.distrito.findFirst({
        where: {
            nombre: nombre,
            asociacionId: asociacionId
        }
    });

    if (existente) {
        throw new Error("Ya existe un distrito con este nombre en esta asociación.");
    }
    return prisma.distrito.create({
        data: {
            nombre,
            asociacionId
        }
    });
};

/**
 * Editar un distrito
 */
export const editarDistrito = async (id: string, nombre: string) => {
    if (!nombre) throw new Error("El nombre es obligatorio.");

    return prisma.distrito.update({
        where: { id },
        data: { nombre }
    });
};

/**
 * Eliminar distrito
 */
export const eliminarDistrito = async (id: string) => {
    return prisma.distrito.delete({
        where: { id }
    });
};

/**
 * Listar distritos de una asociación
 */
export const listarDistritosAsociacion = async (asociacionId: string) => {
    return prisma.distrito.findMany({
        where: { asociacionId },
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
};

/**
 * Obtener un distrito por ID
 */
export const obtenerDistrito = async (id: string) => {
    return prisma.distrito.findUnique({
        where: { id },
        include: {
            iglesias: true,
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
 * Obtener un distrito por cantida
 */
export const contarDistritosAsociacion = async (asociacionId: string) => {
    return prisma.distrito.count({
        where: { asociacionId }
    });
};

/**
 * Obtener un distrito, pastor, iglesia
 */
export const obtenerDistritoConDetalle = async (id: string) => {
    return prisma.distrito.findUnique({
        where: { id },
        include: {
            // Iglesias del distrito
            iglesias: {
                include: {
                    // Si cada iglesia tiene pastor
                    pastor: {
                        include: {
                            usuario: {
                                select: { nombre: true, apellidos: true, telefono: true }
                            }
                        }
                    }
                }
            },
            // Pastores del distrito (aunque ya vengan por iglesia, a veces interesa listado directo)
            pastores: {
                include: {
                    usuario: {
                        select: { nombre: true, apellidos: true, telefono: true }
                    }
                }
            }
        }
    });
};
/**
 * Obtener un distrito, pastor, iglesia estadisticas
 */
export const getEstadisticasDistrito = async (distritoId: string) => {
    const [totalIglesias, totalPastores, totalMiembros] = await Promise.all([
        prisma.iglesia.count({
            where: { distritoId }
        }),
        prisma.pastor.count({
            where: { distritoId }
        }),
        prisma.miembro.count({
            where: {
                iglesia: {
                    distritoId: distritoId
                }
            }
        })
    ]);

    return {
        totalIglesias,
        totalPastores,
        totalMiembros
    };
};




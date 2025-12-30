// src/services/estadisticasService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Estadísticas generales de la asociación
 */
export const estadisticasAsociacion = async (asociacionId: string) => {
    // Distritos
    const totalDistritos = await prisma.distrito.count({
        where: { asociacionId }
    });

    // Iglesias (por distritos)
    const totalIglesias = await prisma.iglesia.count({
        where: {
            distrito: { asociacionId }
        }
    });

    // Pastores
    const totalPastores = await prisma.pastor.count({
        where: { asociacionId }
    });

    // Miembros (por iglesias)
    const totalMiembros = await prisma.miembro.count({
        where: {
            iglesia: {
                distrito: { asociacionId }
            }
        }
    });

    // Bautismos (por pastores de la asociación)
    const totalBautismos = await prisma.bautismo.count({
        where: {
            pastor: { asociacionId }
        }
    });

    return {
        totalDistritos,
        totalIglesias,
        totalPastores,
        totalMiembros,
        totalBautismos
    };
};

/**
 * Bautismos por año (últimos 5 años)
 */
export const bautismosPorAnio = async (asociacionId: string) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const resultados = [];

    for (const year of years) {
        const count = await prisma.bautismo.count({
            where: {
                pastor: { asociacionId },
                fecha: {
                    gte: new Date(year, 0, 1),
                    lte: new Date(year, 11, 31)
                }
            }
        });

        resultados.push({
            year,
            cantidad: count
        });
    }

    return resultados.reverse(); // del más viejo al más nuevo
};

/**
 * Iglesias por distrito
 */
export const iglesiasPorDistrito = async (asociacionId: string) => {
    return prisma.distrito.findMany({
        where: { asociacionId },
        select: {
            id: true,
            nombre: true,
            _count: {
                select: { iglesias: true }
            }
        }
    });
};

/**
 * Miembros por iglesia
 */
export const miembrosPorIglesia = async (asociacionId: string) => {
    return prisma.iglesia.findMany({
        where: {
            distrito: { asociacionId }
        },
        select: {
            id: true,
            nombre: true,
            _count: {
                select: { miembros: true }
            }
        }
    });
};

/**
 * Top 5 iglesias con más miembros
 */
export const topIglesiasMiembros = async (asociacionId: string) => {
    return prisma.iglesia.findMany({
        where: {
            distrito: { asociacionId }
        },
        select: {
            id: true,
            nombre: true,
            _count: {
                select: { miembros: true }
            }
        },
        orderBy: {
            miembros: { _count: "desc" }
        },
        take: 5
    });
};

/**
 * Top 5 iglesias con más bautismos
 */
export const topIglesiasBautismos = async (asociacionId: string) => {
    return prisma.iglesia.findMany({
        where: {
            distrito: { asociacionId }
        },
        select: {
            id: true,
            nombre: true,
            miembros: {
                select: {
                    bautismos: true
                }
            }
        }
    });
};


export const dashboardAsociacionData = async (asociacionId: string) => {
    const [
        generales,
        bautismosAnuales,
        iglesiasDistritos,
        miembrosIglesias,
        topMiembros,
        topBautismos
    ] = await Promise.all([
        estadisticasAsociacion(asociacionId),
        bautismosPorAnio(asociacionId),
        iglesiasPorDistrito(asociacionId),
        miembrosPorIglesia(asociacionId),
        topIglesiasMiembros(asociacionId),
        topIglesiasBautismos(asociacionId)
    ]);

    return {
        resumen: generales,              // totales: distritos, iglesias, pastores, miembros, bautismos
        bautismosPorAnio: bautismosAnuales,
        iglesiasPorDistrito: iglesiasDistritos,
        miembrosPorIglesia: miembrosIglesias,
        topIglesiasMiembros: topMiembros,
        topIglesiasBautismos: topBautismos
    };
};


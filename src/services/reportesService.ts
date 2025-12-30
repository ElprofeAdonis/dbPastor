// src/services/reportesService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 1. Crecimiento mensual: miembros nuevos y bautismos
 */
export const crecimientoMensual = async (asociacionId: string) => {
    const meses = [];

    for (let i = 0; i < 12; i++) {
        const inicio = new Date();
        inicio.setMonth(inicio.getMonth() - i);
        inicio.setDate(1);

        const fin = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0);

        const nuevosMiembros = await prisma.miembro.count({
            where: {
                fechaNacimiento: {
                    gte: inicio,
                    lte: fin
                },
                iglesia: {
                    distrito: { asociacionId }
                }
            }
        });

        const bautismos = await prisma.bautismo.count({
            where: {
                fecha: {
                    gte: inicio,
                    lte: fin
                },
                pastor: { asociacionId }
            }
        });

        meses.push({
            mes: inicio.toLocaleString("es", { month: "long" }),
            nuevosMiembros,
            bautismos
        });
    }

    return meses.reverse();
};

/**
 * 2. Iglesias sin pastor asignado
 */
export const iglesiasSinPastor = async (asociacionId: string) => {
    return prisma.iglesia.findMany({
        where: {
            distrito: { asociacionId },
            pastorId: null
        },
        select: {
            id: true,
            nombre: true,
            codigo: true,
            direccion: true
        }
    });
};

/**
 * 3. Actividad pastoral (cantidad de bautismos y eventos)
 */
export const actividadPastoral = async (asociacionId: string) => {
    return prisma.pastor.findMany({
        where: { asociacionId },
        select: {
            id: true,
            usuario: {
                select: { nombre: true, apellidos: true }
            },
            _count: {
                select: {
                    bautismos: true,
                    iglesias: true // iglesias que pastorea
                }
            }
        }
    });
};

/**
 * 4. Comparación de distritos por cantidad de iglesias
 */
export const comparacionDistritosIglesias = async (asociacionId: string) => {
    return prisma.distrito.findMany({
        where: { asociacionId },
        select: {
            id: true,
            nombre: true,
            _count: {
                select: { iglesias: true }
            }
        },
        orderBy: {
            iglesias: { _count: "desc" }
        }
    });
};

/**
 * 5. Comparación de distritos por cantidad de miembros
 */
export const comparacionDistritosMiembros = async (asociacionId: string) => {
    return prisma.distrito.findMany({
        where: { asociacionId },
        select: {
            id: true,
            nombre: true,
            iglesias: {
                select: {
                    _count: { select: { miembros: true } }
                }
            }
        }
    });
};

/**
 * 6. Top 10 iglesias más grandes
 */
export const topIglesiasGrandes = async (asociacionId: string) => {
    const iglesias = await prisma.iglesia.findMany({
        where: { distrito: { asociacionId } },
        include: {
            _count: { select: { miembros: true } }
        },
        orderBy: {
            miembros: { _count: "desc" }
        },
        take: 10
    });

    return iglesias;
};

/**
 * 7. Top 10 distritos más grandes (por miembros)
 */
export const topDistritosGrandes = async (asociacionId: string) => {
    const distritos = await prisma.distrito.findMany({
        where: { asociacionId },
        include: {
            iglesias: {
                include: {
                    _count: {
                        select: { miembros: true }
                    }
                }
            }
        }
    });

    return distritos.map((d) => ({
        id: d.id,
        nombre: d.nombre,
        miembrosTotales: d.iglesias.reduce((acc, i) => acc + i._count.miembros, 0)
    }));
};

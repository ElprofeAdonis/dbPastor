import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const obtenerEstructuraGlobal = async () => {
    const asociaciones = await prisma.asociacion.findMany({
        orderBy: { nombre: "asc" },
        include: {
            distritos: {
                orderBy: { nombre: "asc" },
                include: {
                    iglesias: {
                        orderBy: { nombre: "asc" },
                        include: {
                            miembros: {
                                select: { id: true } // solo para contar
                            },
                            pastor: {
                                include: {
                                    usuario: {
                                        select: {
                                            nombre: true,
                                            apellidos: true,
                                            telefono: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    pastores: {
                        include: {
                            usuario: {
                                select: {
                                    nombre: true,
                                    apellidos: true,
                                    telefono: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            },
            pastores: {
                include: {
                    usuario: {
                        select: {
                            nombre: true,
                            apellidos: true,
                            telefono: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    // Totales globales directos
    const [totalPastores, totalMiembros, totalIglesias] = await Promise.all([
        prisma.pastor.count(),
        prisma.miembro.count(),
        prisma.iglesia.count()
    ]);

    const asociacionesMapeadas = asociaciones.map((aso) => {
        // Pastores sin distrito (asociados solo a la asociación)
        const pastoresSinDistrito = aso.pastores
            .filter((p) => !p.distritoId)
            .map((p) => ({
                id: p.id,
                usuario: p.usuario
            }));

        // Distritos con sus pastores e iglesias
        const distritos = aso.distritos.map((dist) => {
            const iglesias = dist.iglesias.map((igl) => ({
                id: igl.id,
                nombre: igl.nombre,
                codigo: igl.codigo,
                cantidadMiembros: igl.miembros.length,
                pastor: igl.pastor
                    ? {
                        id: igl.pastor.id,
                        usuario: igl.pastor.usuario
                    }
                    : null
            }));

            const cantidadMiembrosDistrito = iglesias.reduce(
                (acc, igl) => acc + igl.cantidadMiembros,
                0
            );

            return {
                id: dist.id,
                nombre: dist.nombre,
                cantidadIglesias: iglesias.length,
                cantidadPastores: dist.pastores.length,
                cantidadMiembros: cantidadMiembrosDistrito,
                pastores: dist.pastores.map((p) => ({
                    id: p.id,
                    usuario: p.usuario
                })),
                iglesias
            };
        });

        const cantidadDistritos = distritos.length;
        const cantidadIglesiasAsociacion = distritos.reduce(
            (acc, d) => acc + d.cantidadIglesias,
            0
        );
        const cantidadMiembrosAsociacion = distritos.reduce(
            (acc, d) => acc + d.cantidadMiembros,
            0
        );
        const cantidadPastoresAsociacion =
            pastoresSinDistrito.length +
            distritos.reduce((acc, d) => acc + d.cantidadPastores, 0);

        return {
            id: aso.id,
            nombre: aso.nombre,
            cantidadDistritos,
            cantidadIglesias: cantidadIglesiasAsociacion,
            cantidadPastores: cantidadPastoresAsociacion,
            cantidadMiembros: cantidadMiembrosAsociacion,
            distritos,
            pastoresSinDistrito
        };
    });

    const totalAsociaciones = asociacionesMapeadas.length;
    const totalDistritos = asociacionesMapeadas.reduce(
        (acc, aso) => acc + aso.cantidadDistritos,
        0
    );

    return {
        totalesGlobales: {
            asociaciones: totalAsociaciones,
            distritos: totalDistritos,
            iglesias: totalIglesias,
            pastores: totalPastores,
            miembros: totalMiembros
        },
        asociaciones: asociacionesMapeadas
    };
};

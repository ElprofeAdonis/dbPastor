import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 1. Obtener el perfil de la iglesia asignada a la secretaria.
 * La secretaria está vinculada a la iglesia a través del campo 'iglesiaId' en el modelo Usuario.
 * Por lo tanto, necesitamos el usuarioId para buscar su perfil de Secretaria.
 */
export const getIglesiaPerfil = async (usuarioId: string) => {
    // 1. Encontrar el registro del usuario (Secretaria) para obtener el iglesiaId
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { iglesiaId: true }
    });

    if (!usuario || !usuario.iglesiaId) {
        throw new Error("Secretaria no asignada a ninguna iglesia.");
    }

    // 2. Buscar la información completa de la iglesia usando el iglesiaId
    return prisma.iglesia.findUnique({
        where: { id: usuario.iglesiaId },
        include: {
            distrito: {
                include: { asociacion: true }
            },
            pastor: {
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
 * 2. Obtener todos los miembros de la iglesia asignada.
 */
export const getMiembrosIglesia = async (usuarioId: string) => {
    // 1. Encontrar la iglesiaId de la secretaria
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { iglesiaId: true }
    });

    if (!usuario || !usuario.iglesiaId) {
        throw new Error("Secretaria no asignada a ninguna iglesia.");
    }

    // 2. Buscar todos los miembros que pertenezcan a esa iglesia
    return prisma.miembro.findMany({
        where: { iglesiaId: usuario.iglesiaId },
        include: {
            usuario: {
                select: { id: true, nombre: true, apellidos: true, email: true, telefono: true }
            }
        }
    });
};

/**
 * 3. Crear un nuevo evento para la iglesia asignada.
 * NOTA: La secretaria es el 'creadoPor'
 */
export const crearEventoIglesia = async (usuarioId: string, data: any) => {
    const { nombre, descripcion, fechaInicio, fechaFin, lugar } = data;

    // 1. Encontrar la iglesiaId de la secretaria
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { iglesiaId: true }
    });

    if (!usuario || !usuario.iglesiaId) {
        throw new Error("Secretaria no asignada a ninguna iglesia.");
    }

    // 2. Crear el evento
    return prisma.evento.create({
        data: {
            nombre,
            descripcion,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            lugar,
            iglesiaId: usuario.iglesiaId, // Asignar a la iglesia de la secretaria
            creadoPorId: usuarioId // Asignar a la secretaria como creadora
        }
    });
};
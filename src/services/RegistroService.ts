// src/services/RegistroService.ts

import { PrismaClient, Rol } from '@prisma/client';
import { hashPassword } from './AuthService.js'; // Necesario para hashear la contraseña

const prisma = new PrismaClient();

interface RegistroData {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    password: string;
    rol: Rol;
    // Datos de perfil
    codigoUnico?: string;
    licenciaPastoral?: string; // Solo para Pastor
    fechaNacimiento?: string; // Solo para Miembro
    iglesiaId?: string; // Para Miembro o Secretaria
    asociacionId?: string;
}

/**
 * Registra un nuevo usuario en la base de datos y crea el perfil asociado (Pastor o Miembro).
 * Esta función está diseñada para ser usada por un administrador (SuperADMIN).
 */
export const registrarUsuario = async (data: RegistroData) => {

    // 1. Validar la unicidad de email y teléfono
    const existingUser = await prisma.usuario.findFirst({
        where: { OR: [{ email: data.email }, { telefono: data.telefono }] }
    });
    if (existingUser) {
        throw new Error("El email o número de teléfono ya está registrado.");
    }

    // 2. Hashear la contraseña
    const hashedPassword = await hashPassword(data.password);

    // 3. Preparar la creación del perfil (Pastor/Miembro) o el enlace (Secretaria)
    let perfilConnect: any = {};

    if (data.rol === Rol.PASTOR) {
        // Crear perfil Pastor y vincularlo
        perfilConnect.pastorInfo = {
            create: {
                licenciaPastoral: data.licenciaPastoral || null,
                fechaOrdenacion: data.licenciaPastoral ? new Date() : null, // Ejemplo de fecha
                // La estructura de distrito/asociación se actualiza post-registro si es necesario
            }
        };
    } else if (data.rol === Rol.MIEMBRO) {
        // Crear perfil Miembro y vincularlo
        if (!data.iglesiaId || !data.fechaNacimiento) {
            throw new Error("Para el rol MIEMBRO, se requieren iglesiaId y fechaNacimiento.");
        }

        perfilConnect.miembroInfo = {
            create: {
                fechaNacimiento: new Date(data.fechaNacimiento),
                iglesia: { connect: { id: data.iglesiaId } },
                codigoMiembro: data.codigoUnico, // Usamos codigoUnico temporalmente
            }
        };
    }

    // 4. Crear el Usuario principal
    const nuevoUsuario = await prisma.usuario.create({
        data: {
            nombre: data.nombre,
            apellidos: data.apellidos,
            email: data.email,
            telefono: data.telefono,
            password: hashedPassword,
            rol: data.rol,
            codigoUnico: data.codigoUnico || 'TEMP-' + Math.random().toString(36).substring(2, 9),

            // Enlace de perfiles 1:1
            ...perfilConnect,

            // Enlace de Secretaria de Iglesia
            iglesiaId: data.rol === Rol.SECRETARIAIglesia ? data.iglesiaId : null,

            asociacionId: data.rol === Rol.SECRETARIAAsociacion ? data.asociacionId : null,
        }
    });

    return nuevoUsuario;
};

/**
 * Registra el SuperADMIN inicial (solo se ejecuta si no existe).
 */
export const registrarSuperAdmin = async (data: RegistroData) => {
    const adminExists = await prisma.usuario.findFirst({
        where: { rol: Rol.SuperADMIN }
    });

    if (adminExists) {
        throw new Error("Ya existe un SuperADMIN en el sistema.");
    }

    data.rol = Rol.SuperADMIN; // Aseguramos el rol
    data.password = data.password || "admin123";

    // Reutilizamos la lógica de registro
    return registrarUsuario(data);
};
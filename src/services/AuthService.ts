import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from "jsonwebtoken";
const prisma = new PrismaClient();
const JWT_KEY_SIGN = process.env.JWT_SECRET || 'mi_super_clave';

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
};
interface LoginResult {
    token: string;
    rol: Rol;
    referenciaId: string;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
    const jwt = await import('jsonwebtoken');
    const usuario = await prisma.usuario.findUnique({
        where: { email },
        select: {
            id: true,
            rol: true,
            password: true,
            pastorInfo: { select: { id: true } },
            miembroInfo: { select: { id: true } },
        },
    });

    if (!usuario) {
        throw new Error("Credenciales inválidas (Usuario no encontrado)");
    }

    const passwordMatch = await comparePassword(password, usuario.password);

    if (!passwordMatch) {
        throw new Error("Credenciales inválidas (Contraseña incorrecta)");
    }

    let referenciaId: string | null = null;

    switch (usuario.rol) {
        case Rol.SuperADMIN:
        case Rol.SECRETARIAAsociacion:
        case Rol.SECRETARIAIglesia:
            referenciaId = usuario.id;
            break;
        case Rol.PASTOR:
            referenciaId = usuario.pastorInfo?.id || null;
            break;
        case Rol.MIEMBRO:
            referenciaId = usuario.miembroInfo?.id || null;
            break;
    }

    if (!referenciaId) {
        throw new Error("Error interno: Perfil de usuario no encontrado o mal enlazado.");
    }

    const payload = {
        id: usuario.id,
        rol: usuario.rol,
        referenciaId: referenciaId,
    };

    const token = jwt.sign(payload, JWT_KEY_SIGN, { expiresIn: '8h' });

    return {
        token,
        rol: usuario.rol,
        referenciaId: referenciaId,
    };
};
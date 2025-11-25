// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// ==========================================================
// 1. DEFINICIÓN DE TIPOS LOCAL (SOLUCIONA el error 'req.user' en rojo)
// ==========================================================
/**
 * Interfaz que define el payload decodificado del JWT.
 */
export interface JwtPayload {
    id: string;
    rol: string;
    referenciaId: string;
}

// 🔑 SOLUCIÓN PARA req.user: Extender el tipo Request de Express globalmente
// Esto permite que TypeScript sepa que req.user existe.
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload; // Propiedad añadida por el middleware
        }
    }
}
// ==========================================================

/**
 * Middleware para verificar la validez del Token JWT y cargar req.user.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Leemos la clave directamente de las variables de entorno para la verificación.
    const JWT_KEY_SIGN = process.env.JWT_SECRET || 'mi_secreto_super_seguro_cambialo';

    // 1. Obtener el encabezado de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    try {
        // 2. Verificar y decodificar el token
        // Usamos JwtPayload que está definida arriba.
        const decoded = jwt.verify(token, JWT_KEY_SIGN) as JwtPayload;

        // 3. Adjuntar la información del usuario a la petición
        // 🚨 req.user ahora es reconocido por la declaración 'declare global'
        req.user = decoded;

        next();

    } catch (error) {
        // 403: Prohibido (token inválido o expirado)
        console.error("Error de verificación de JWT:", error);
        return res.status(403).json({ message: "Token inválido o expirado." });
    }
};
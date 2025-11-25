// src/controllers/RegistroController.ts

import { Request, Response } from 'express';
import { Rol } from '@prisma/client';
import { registrarUsuario, registrarSuperAdmin } from '../services/RegistroService.js';

export const registrarSuperAdminHandler = async (req: Request, res: Response) => {
    const { nombre, apellidos, email, telefono, password } = req.body;

    if (!nombre || !apellidos || !email || !telefono || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios: nombre, apellidos, email, telefono, password." });
    }

    try {
        const admin = await registrarSuperAdmin({
            nombre, apellidos, email, telefono, password,
            // Asignamos explícitamente el rol SuperADMIN
            rol: Rol.SuperADMIN,
            // Los campos de perfil (pastorInfo, miembroInfo) son null para el SuperADMIN
        });

        res.status(201).json({
            message: "SuperADMIN registrado exitosamente. Ya puede iniciar sesión.",
            usuarioId: admin.id,
            email: admin.email
        });

    } catch (error) {
        // Captura errores de unicidad (ya existe un Admin)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al registrar el Admin.";
        return res.status(409).json({ message: errorMessage });
    }
};

// NOTA: El handler registrarUsuarioHandler debe estar aquí también, pero para el
// SuperADMIN solo necesitamos esta función.
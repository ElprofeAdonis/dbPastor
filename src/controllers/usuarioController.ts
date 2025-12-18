// src/controllers/usuarioController.ts
import { Request, Response } from "express";
import { crearUsuario } from "../services/usuarioService.js";
import { Rol } from "@prisma/client";

export const crearUsuarioController = async (req: Request, res: Response) => {
    try {
        const {
            nombre,
            apellidos,
            email,
            telefono,
            password,
            rol,
            codigoUnico,
            asociacionId,
            iglesiaId
        } = req.body;

        // Convertir rol a tipo enum Rol (si viene como string)
        const rolValor: Rol = rol as Rol;

        const usuario = await crearUsuario({
            nombre,
            apellidos,
            email,
            telefono,
            password,
            rol: rolValor,
            codigoUnico,
            asociacionId,
            iglesiaId
        });

        return res.status(201).json({
            message: "Usuario creado correctamente",
            data: usuario
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error desconocido al crear usuario.";
        return res.status(400).json({ message });
    }
};

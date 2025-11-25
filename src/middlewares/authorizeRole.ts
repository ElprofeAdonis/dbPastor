import { Request, Response, NextFunction } from "express";

export const authorizeRole = (rolesPermitidos: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        if (!rolesPermitidos.map(r => r.toLowerCase()).includes(user.rol.toLowerCase())) {
            return res.status(403).json({ message: "No tienes permiso" });
        }


        next();
    };
};

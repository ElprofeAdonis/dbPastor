// src/types/express/index.d.ts

import { Role } from "@prisma/client";

declare global {
    namespace Express {
        interface UserPayload {
            id: number;
            rol: Role;
            referenciaId: number;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}

export { };

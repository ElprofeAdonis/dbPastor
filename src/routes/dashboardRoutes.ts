import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { dashboardGlobalController } from "../controllers/dashboardController.js";

const router = Router();

const soloAdmin = [
    authenticateToken,
    authorizeRole(["SuperADMIN"])
];

router.get("/global", ...soloAdmin, dashboardGlobalController);

export default router;

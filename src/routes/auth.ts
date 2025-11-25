
import { Router } from "express";
import { loginHandler } from "../controllers/AuthController.js";

const router = Router();
router.post("/login", loginHandler);

export default router;
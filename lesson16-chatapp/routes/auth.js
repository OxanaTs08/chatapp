import { Router } from "express";
import { registerController, loginController } from "../controllers/auth.js";
import authenticateJWT from "../middleWare/authMiddleWare.js";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController, authenticateJWT);

export default router;

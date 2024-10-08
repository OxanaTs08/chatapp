import { Router } from "express";
import {
  usersGetController,
  usersOnlineGetController,
  userReceiverByIdGetController,
  logoutController,
} from "../controllers/auth.js";
import authenticateJWT from "../middleWare/authMiddleWare.js";

const router = Router();

router.get("/", usersGetController, authenticateJWT);
router.get("/online", usersOnlineGetController, authenticateJWT);
router.get("/receiver", userReceiverByIdGetController, authenticateJWT);
router.post("/logout", logoutController, authenticateJWT);

export default router;

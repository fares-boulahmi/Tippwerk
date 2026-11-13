import { Router } from "express";
import { googleLogin, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/google", googleLogin);
router.get("/me", requireAuth, me);
export default router;

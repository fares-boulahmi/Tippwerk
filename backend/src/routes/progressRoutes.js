import { Router } from "express";
import {
  completeSession,
  getActivity,
  getSession,
} from "../controllers/progressController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/activity", getActivity);
router.get("/:collectionId/session", getSession);
router.post("/:collectionId/complete", completeSession);

export default router;

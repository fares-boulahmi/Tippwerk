import { Router } from "express";
import {
  createCollection,
  getCollection,
  listCollections,
} from "../controllers/collectionController.js";
import { createSet } from "../controllers/setController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listCollections);
router.post("/", requireAdmin, createCollection);
router.get("/:id", getCollection);
router.post("/:id/sets", requireAdmin, createSet);

export default router;

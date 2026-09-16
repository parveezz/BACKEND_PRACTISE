import { Router } from "express";
import { getProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Protect the /profile route with the auth middleware
router.get("/profile", authMiddleware, getProfile);

export default router;


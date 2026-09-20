import { Router } from "express";
import {
      getProfile,
      uploadAvatar,
      fetchUsers,
      updateUser,
      permanentDeleteUser,
      softDelete,
      suspendUser,
      restore,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../services/Multer.js";

const router = Router();

// Protect the /profile route with the auth middleware
router.get("/profile", authMiddleware, getProfile);
router.post("/profile/avatar", authMiddleware, upload.single("image"), uploadAvatar);
router.get("/", authMiddleware, fetchUsers);
router.patch("/update", authMiddleware, updateUser);
router.patch("/suspend", authMiddleware, suspendUser);
router.patch("/deactivate", authMiddleware, softDelete);
router.patch("/restore", authMiddleware, restore);
router.delete("/permanent", authMiddleware, permanentDeleteUser);

export default router;


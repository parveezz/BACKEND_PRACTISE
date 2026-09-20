import { Router } from "express";
import {
      uploadAvatar,
      uploadPlatformImage,
      getFeedImages,
      getUserPlatformImages,
      deletePlatformImage,
      updatePlatformImage
} from "../controllers/imageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../services/Multer.js";

const router = Router();

// Upload avatar
router.post("/avatar", authMiddleware, upload.single("image"), uploadAvatar);

// Upload multiple platform images
router.post("/platform-images", authMiddleware, upload.array("images", 10), uploadPlatformImage);

// Get all platform images (Feed)
router.get("/platform-images", getFeedImages);

// Get specific user's platform images
router.get("/user/:userId", getUserPlatformImages);

// Delete an image
router.delete("/platform-images/:imageId", authMiddleware, deletePlatformImage);

// Update an image (description/tags)
router.patch("/platform-images/:imageId", authMiddleware, updatePlatformImage);

export default router;


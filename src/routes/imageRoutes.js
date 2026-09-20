import { Router } from "express";
import {
      uploadAvatar,
      uploadPlatformImage,
      getFeedImages,
      getUserPlatformImages,
      deletePlatformImage,
      updatePlatformImage,
      searchGlobalImages,
      recordDownload,
      toggleImageLike
} from "../controllers/imageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../services/Multer.js";

const router = Router();

// Global search (e.g. ?q=nature)
router.get("/search", searchGlobalImages);

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

// Record a download
router.post("/platform-images/:imageId/download", recordDownload);

// Toggle a like
router.post("/platform-images/:imageId/like", authMiddleware, toggleImageLike);

export default router;


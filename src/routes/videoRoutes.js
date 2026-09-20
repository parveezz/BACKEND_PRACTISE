import { Router } from "express";
import {
      uploadVideo,
      getFeedVideos,
      getUserVideosController,
      deletePlatformVideo,
      updatePlatformVideo,
      searchGlobalVideos,
      recordVideoDownload,
      recordVideoView,
      toggleVideoLikeController
} from "../controllers/videoController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadVideoMulter from "../services/videoMulter.js";

const router = Router();

router.get("/search", searchGlobalVideos);

router.post("/platform-videos", authMiddleware, uploadVideoMulter.single("video"), uploadVideo);

router.get("/platform-videos", getFeedVideos);

router.get("/user/:userId", getUserVideosController);

router.delete("/platform-videos/:videoId", authMiddleware, deletePlatformVideo);

router.patch("/platform-videos/:videoId", authMiddleware, updatePlatformVideo);

router.post("/platform-videos/:videoId/view", recordVideoView);

router.post("/platform-videos/:videoId/download", recordVideoDownload);

router.post("/platform-videos/:videoId/like", authMiddleware, toggleVideoLikeController);

export default router;

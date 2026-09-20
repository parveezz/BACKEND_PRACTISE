import { createUserVideo, getAllVideos, getUserVideos, getVideoById, deleteVideo, updateVideoDetails, searchVideos, incrementVideoDownload, toggleVideoLike, incrementVideoView } from "../model/videoModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadVideo = async (req, res) => {
      try {
            if (!req.file) {
                  return res.status(400).json({ success: false, message: "No video provided" });
            }

            const { description, tags } = req.body;
            const userId = req.user.userId;

            // Upload to Cloudinary using stream for videos
            const result = await new Promise((resolve, reject) => {
                  const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "platform_videos", resource_type: "video" },
                        (error, result) => {
                              if (error) reject(error);
                              else resolve(result);
                        }
                  );
                  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });

            const newVideo = await createUserVideo(
                  userId,
                  result.secure_url,
                  result.public_id,
                  description,
                  tags
            );

            return res.status(201).json({
                  success: true,
                  message: "Video uploaded successfully",
                  data: newVideo
            });
      } catch (error) {
            console.error("Upload video error:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to upload video",
            });
      }
};

export const searchGlobalVideos = async (req, res) => {
      try {
            const query = req.query.q || "";
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const offset = (page - 1) * limit;

            if (!query.trim()) {
                  return res.status(400).json({
                        success: false,
                        message: "Search query 'q' is required"
                  });
            }

            const videos = await searchVideos(query.trim(), limit, offset);

            return res.status(200).json({
                  success: true,
                  page,
                  limit,
                  data: videos
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to search videos",
            });
      }
};

export const getFeedVideos = async (req, res) => {
      try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const category = req.query.category || "";
            const sort = req.query.sort || "recent";
            const offset = (page - 1) * limit;

            const videos = await getAllVideos(limit, offset, category, sort);

            return res.status(200).json({
                  success: true,
                  page,
                  limit,
                  category: category || "all",
                  sort,
                  data: videos
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch videos",
            });
      }
};

export const getUserVideosController = async (req, res) => {
      try {
            const { userId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const offset = (page - 1) * limit;

            const videos = await getUserVideos(userId, limit, offset);
            
            return res.status(200).json({
                  success: true,
                  page,
                  limit,
                  data: videos
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch user videos",
            });
      }
};

export const deletePlatformVideo = async (req, res) => {
      try {
            const { videoId } = req.params;
            const userId = req.user.userId;

            const video = await getVideoById(videoId);
            if (!video) {
                  return res.status(404).json({ success: false, message: "Video not found" });
            }

            if (video.user_uuid !== userId) {
                  return res.status(403).json({ success: false, message: "Unauthorized to delete this video" });
            }

            await cloudinary.uploader.destroy(video.cloudinary_public_id, { resource_type: 'video' });
            await deleteVideo(videoId);

            return res.status(200).json({
                  success: true,
                  message: "Video deleted successfully"
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to delete video",
            });
      }
};

export const updatePlatformVideo = async (req, res) => {
      try {
            const { videoId } = req.params;
            const userId = req.user.userId;
            const { description, tags } = req.body;

            const video = await getVideoById(videoId);
            if (!video) {
                  return res.status(404).json({ success: false, message: "Video not found" });
            }

            if (video.user_uuid !== userId) {
                  return res.status(403).json({ success: false, message: "Unauthorized to update this video" });
            }

            const updatedVideo = await updateVideoDetails(videoId, description, tags);

            return res.status(200).json({
                  success: true,
                  message: "Video updated successfully",
                  data: updatedVideo
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to update video",
            });
      }
};

export const recordVideoView = async (req, res) => {
      try {
            const { videoId } = req.params;
            
            const video = await getVideoById(videoId);
            if (!video) {
                  return res.status(404).json({ success: false, message: "Video not found" });
            }

            const updated = await incrementVideoView(videoId);
            
            return res.status(200).json({
                  success: true,
                  message: "View recorded",
                  views: updated.views
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to record view",
            });
      }
};

export const recordVideoDownload = async (req, res) => {
      try {
            const { videoId } = req.params;
            
            const video = await getVideoById(videoId);
            if (!video) {
                  return res.status(404).json({ success: false, message: "Video not found" });
            }

            const updated = await incrementVideoDownload(videoId);
            
            return res.status(200).json({
                  success: true,
                  message: "Download recorded",
                  downloads: updated.downloads
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to record download",
            });
      }
};

export const toggleVideoLikeController = async (req, res) => {
      try {
            const { videoId } = req.params;
            const userId = req.user.userId;

            const video = await getVideoById(videoId);
            if (!video) {
                  return res.status(404).json({ success: false, message: "Video not found" });
            }

            const result = await toggleVideoLike(userId, videoId);

            return res.status(200).json({
                  success: true,
                  message: `Video ${result.action} successfully`,
                  action: result.action
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to toggle like",
            });
      }
};

import { findUserById, updateUserAvatar } from "../model/userModel.js";
import { createUserImage, getAllImages, getUserImages, getImageById, deleteImage, updateImageDetails, searchImages, incrementDownload, toggleLike, incrementView } from "../model/imageModel.js";
import cloudinary from "../config/cloudinary.js";

export const searchGlobalImages = async (req, res) => {
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

            const images = await searchImages(query.trim(), limit, offset);

            return res.status(200).json({
                  success: true,
                  page,
                  limit,
                  data: images
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to search images",
            });
      }
};

export const getFeedImages = async (req, res) => {
      try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const category = req.query.category || "";
            const sort = req.query.sort || "recent";
            const offset = (page - 1) * limit;

            const images = await getAllImages(limit, offset, category, sort);

            return res.status(200).json({
                  success: true,
                  page,
                  limit,
                  category: category || "all",
                  sort,
                  data: images
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch images",
            });
      }
};

export const getUserPlatformImages = async (req, res) => {
      try {
            const { userId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const offset = (page - 1) * limit;

            const images = await getUserImages(userId, limit, offset);

            return res.status(200).json({
                  success: true,
                  page,
                  limit,
                  data: images
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch user images",
            });
      }
};

export const uploadAvatar = async (req, res) => {
      try {
            if (!req.file) {
                  return res.status(400).json({
                        success: false,
                        message: "Image file is required",
                  });
            }

            const uploadResult = await new Promise((resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                        { folder: "user-avatars", resource_type: "image" },
                        (error, result) => error ? reject(error) : resolve(result),
                  );

                  stream.end(req.file.buffer);
            });

            // Update avatar on the user profile
            const updatedUser = await updateUserAvatar(
                  req.user.userId,
                  uploadResult.secure_url,
                  uploadResult.public_id,
            );

            if (!updatedUser) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "Profile avatar updated",
                  data: updatedUser,
            });
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to upload profile avatar",
            });
      }
};

export const uploadPlatformImage = async (req, res) => {
      try {
            if (!req.files || req.files.length === 0) {
                  return res.status(400).json({
                        success: false,
                        message: "At least one image file is required",
                  });
            }

            const { description, tags } = req.body;
            const uploadedImages = [];

            // Upload all images to Cloudinary in parallel
            const uploadPromises = req.files.map((file) => {
                  return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                              { folder: "platform-images", resource_type: "image" },
                              (error, result) => error ? reject(error) : resolve(result)
                        );
                        stream.end(file.buffer);
                  });
            });

            const uploadResults = await Promise.all(uploadPromises);

            // Save all to user_images table
            for (const result of uploadResults) {
                  const image = await createUserImage(
                        req.user.userId,
                        result.secure_url,
                        result.public_id,
                        description || "",
                        tags || ""
                  );
                  uploadedImages.push(image);
            }

            // Get user info to return alongside the image
            const user = await findUserById(req.user.userId);

            return res.status(201).json({
                  success: true,
                  message: `${uploadedImages.length} image(s) uploaded successfully`,
                  data: {
                        images: uploadedImages,
                        user: {
                              id: user.id,
                              firstName: user.first_name,
                              lastName: user.last_name,
                              avatarUrl: user.avatar_url
                        }
                  },
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to upload images",
            });
      }
};

export const deletePlatformImage = async (req, res) => {
      try {
            const { imageId } = req.params;
            const userId = req.user.userId;

            const image = await getImageById(imageId);

            if (!image) {
                  return res.status(404).json({
                        success: false,
                        message: "Image not found",
                  });
            }

            // Ensure the user trying to delete is the owner of the image
            if (image.user_uuid !== userId) {
                  return res.status(403).json({
                        success: false,
                        message: "You can only delete your own images",
                  });
            }

            // Delete from Cloudinary
            if (image.cloudinary_public_id) {
                  await cloudinary.uploader.destroy(image.cloudinary_public_id);
            }

            // Delete from Database
            await deleteImage(imageId);

            return res.status(200).json({
                  success: true,
                  message: "Image deleted successfully",
            });

      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to delete image",
            });
      }
};

export const updatePlatformImage = async (req, res) => {
      try {
            const { imageId } = req.params;
            const userId = req.user.userId;
            const { description, tags } = req.body;

            const image = await getImageById(imageId);

            if (!image) {
                  return res.status(404).json({
                        success: false,
                        message: "Image not found",
                  });
            }

            if (image.user_uuid !== userId) {
                  return res.status(403).json({
                        success: false,
                        message: "You can only update your own images",
                  });
            }

            const updatedImage = await updateImageDetails(imageId, description, tags);

            return res.status(200).json({
                  success: true,
                  message: "Image details updated",
                  data: updatedImage,
            });

      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to update image",
            });
      }
};

export const recordView = async (req, res) => {
      try {
            const { imageId } = req.params;

            const image = await getImageById(imageId);
            if (!image) {
                  return res.status(404).json({ success: false, message: "Image not found" });
            }

            const updated = await incrementView(imageId);

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

export const recordDownload = async (req, res) => {
      try {
            const { imageId } = req.params;

            const image = await getImageById(imageId);
            if (!image) {
                  return res.status(404).json({ success: false, message: "Image not found" });
            }

            const updated = await incrementDownload(imageId);

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

export const toggleImageLike = async (req, res) => {
      try {
            const { imageId } = req.params;
            const userId = req.user.userId;

            const image = await getImageById(imageId);
            if (!image) {
                  return res.status(404).json({ success: false, message: "Image not found" });
            }

            const result = await toggleLike(userId, imageId);

            return res.status(200).json({
                  success: true,
                  message: `Image ${result.action} successfully`,
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


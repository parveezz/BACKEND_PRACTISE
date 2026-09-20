import { findUserById, getUsers, updateSingleUser, permanentlyDeleteUser, softDeleteUser, suspendUser as suspendUserModel, restoreUser, createUserImage } from "../model/userModel.js";
import cloudinary from "../config/cloudinary.js";

export const getProfile = async (req, res) => {
      try {
            // req.user is set by the authMiddleware
            const userId = req.user.userId;

            const user = await findUserById(userId);

            if (!user) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "User profile fetched successfully",
                  data: user
            });
      } catch (error) {
            console.error("Get profile error:", error);
            return res.status(500).json({
                  success: false,
                  message: "Unable to fetch user profile",
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

            const image = await createUserImage(
                  req.user.userId,
                  uploadResult.secure_url,
                  uploadResult.public_id,
            );

            if (!image) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "Profile image uploaded",
                  data: image,
            });
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to upload profile image",
            });
      }
};

export const fetchUsers = async (req, res) => {
      try {
            const users = await getUsers();

            if (users.length === 0) {
                  return res.status(404).json({
                        success: false,
                        message: "No users found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  data: users,
            });
      } catch (err) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch users",
            });
      }
};

export const updateUser = async (req, res) => {
      try {
            const { userId, firstName, lastName, dateOfBirth, gender, email, number } = req.body;

            if (!userId) {
                  return res.status(400).json({
                        success: false,
                        message: "userId is required",
                  });
            }

            if (![firstName, lastName, dateOfBirth, gender, email, number].some(value => value !== undefined)) {
                  return res.status(400).json({
                        success: false,
                        message: "At least one field is required to update",
                  });
            }

            const updatingUserInfo = await updateSingleUser(userId, {
                  firstName,
                  lastName,
                  dateOfBirth,
                  gender,
                  email,
                  number,
            });

            if (!updatingUserInfo) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  data: updatingUserInfo,
            });
      } catch (err) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to update user",
            });
      }
};

export const permanentDeleteUser = async (req, res) => {
      try {
            const { userId } = req.body;

            if (!userId) {
                  return res.status(400).json({
                        success: false,
                        message: "userId is required",
                  });
            }
            const deletedUser = await permanentlyDeleteUser(userId);

            if (!deletedUser) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "User permanently deleted",
                  data: deletedUser,
            });
      } catch (err) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to permanently delete user",
            });
      }
};

export const softDelete = async (req, res) => {
      try {
            const { userId } = req.body;

            if (!userId) {
                  return res.status(400).json({
                        success: false,
                        message: "userId is required",
                  });
            }

            const userSoftDelete = await softDeleteUser(userId);

            if (!userSoftDelete) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "User deactivated",
                  data: userSoftDelete,
            });
      } catch (err) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to deactivate user",
            });
      }
};

export const suspendUser = async (req, res) => {
      try {
            const { userId } = req.body;

            if (!userId) {
                  return res.status(400).json({
                        success: false,
                        message: "userId is required",
                  });
            }

            const suspendedUser = await suspendUserModel(userId);

            if (!suspendedUser) {
                  return res.status(404).json({
                        success: false,
                        message: "Active user not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "User suspended",
                  data: suspendedUser,
            });
      } catch (err) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to suspend user",
            });
      }
};

export const restore = async (req, res) => {
      try {
            const { userId } = req.body;

            if (!userId) {
                  return res.status(400).json({
                        success: false,
                        message: "userId is required",
                  });
            }

            const restoredUser = await restoreUser(userId);

            if (!restoredUser) {
                  return res.status(404).json({
                        success: false,
                        message: "Inactive user not found",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "User restored",
                  data: restoredUser,
            });
      } catch (err) {
            return res.status(500).json({
                  success: false,
                  message: "Failed to restore user",
            });
      }
};
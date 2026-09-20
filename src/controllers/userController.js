import { findUserById } from "../model/userModel.js";

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


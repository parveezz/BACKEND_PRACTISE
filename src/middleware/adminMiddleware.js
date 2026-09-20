import { findUserById } from "../model/userModel.js";

const adminMiddleware = async (req, res, next) => {
      try {
            // authMiddleware should have already set req.user
            if (!req.user || !req.user.userId) {
                  return res.status(401).json({
                        success: false,
                        message: "Unauthorized: Missing user credentials",
                  });
            }

            const user = await findUserById(req.user.userId);

            if (!user) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found",
                  });
            }

            // Assuming the 'role' column was added and is fetched in findUserById
            // If the user's role is not admin, deny access
            if (user.role !== 'admin') {
                  return res.status(403).json({
                        success: false,
                        message: "Forbidden: You do not have admin privileges",
                  });
            }

            next();
      } catch (error) {
            console.error("Admin middleware error:", error);
            return res.status(500).json({
                  success: false,
                  message: "Internal server error during authorization",
            });
      }
};

export default adminMiddleware;


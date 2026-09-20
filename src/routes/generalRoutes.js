import { Router } from "express";
import jwt from "jsonwebtoken";
import { submitContact, joinNewsletter, submitFeedback } from "../controllers/generalController.js";

const router = Router();

// Public routes
router.post("/contact", submitContact);
router.post("/newsletter", joinNewsletter);

// Optional Auth middleware (extracts user if token exists, otherwise proceeds anonymously)
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload;
        } catch (e) {
            // Invalid token, just proceed anonymously
        }
    }
    next();
};

router.post("/feedback", optionalAuth, submitFeedback);

export default router;

import { createContact, subscribeNewsletter, createFeedback } from "../model/generalModel.js";

export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required"
            });
        }

        const contact = await createContact(name, email, subject || "", message);

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: contact
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit contact form"
        });
    }
};

export const joinNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const subscription = await subscribeNewsletter(email);

        if (!subscription) {
            // ON CONFLICT DO NOTHING returned no rows, meaning they are already subscribed
            return res.status(200).json({
                success: true,
                message: "You are already subscribed to the newsletter!"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Successfully subscribed to the newsletter"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to subscribe to newsletter"
        });
    }
};

export const submitFeedback = async (req, res) => {
    try {
        const { rating, comments } = req.body;
        // User ID is optional; they might be logged out
        const userId = req.user?.userId || null;

        if (!rating || !comments) {
            return res.status(400).json({
                success: false,
                message: "Rating and comments are required"
            });
        }

        const feedback = await createFeedback(userId, rating, comments);

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: feedback
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback"
        });
    }
};


import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Nodemailer from "../services/Nodemailer.js";
import { otpResetTemplate, welcomeEmailTemplate } from "../utils/emailTemplates.js";

import {
      createUser,
      findUserByEmail,
      findUserForReset,
      saveResetToken,
      updatePassword,
      uniqueEmail,
      uniqueUsername,
} from "../model/userModel.js";

export const register = async (req, res) => {
      try {
            const {
                  username,
                  name,
                  email,
                  password,
            } = req.body;

            if (!username || !email || !password) {
                  return res.status(400).json({
                        success: false,
                        message: "Username, email, and password are required",
                  });
            }

            if (password.length < 8) {
                  return res.status(400).json({
                        success: false,
                        message: "Password must be at least 8 characters",
                  });
            }

            const normalizedEmail = email.trim().toLowerCase();
            const normalizedUsername = username.trim().toLowerCase();

            const isUniqueEmail = await uniqueEmail(normalizedEmail);
            if (!isUniqueEmail) {
                  return res.status(409).json({
                        success: false,
                        message: "Email is already registered",
                  });
            }

            const isUniqueUsername = await uniqueUsername(normalizedUsername);
            if (!isUniqueUsername) {
                  return res.status(409).json({
                        success: false,
                        message: "Username is already taken",
                  });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const user = await createUser({
                  username: normalizedUsername,
                  name: name ? name.trim() : null,
                  email: normalizedEmail,
                  passwordHash,
            });

            // Send Welcome Email asynchronously
            Nodemailer({
                  to: normalizedEmail,
                  subject: "Welcome to Our Platform!",
                  text: `Welcome, ${user.first_name || user.username}! We are thrilled to have you on board.`,
                  html: welcomeEmailTemplate(user.first_name || user.username),
            }).catch(err => console.error("Failed to send welcome email:", err));

            return res.status(201).json({
                  success: true,
                  message: "User registered successfully",
                  data: user,
            });
      } catch (error) {
            if (error.code === "23505") {
                  return res.status(409).json({
                        success: false,
                        message: "Email is already registered",
                  });
            }

            console.error("Register error:", error);

            return res.status(500).json({
                  success: false,
                  message: "Unable to register user",
            });
      }
};

export const login = async (req, res) => {
      try {
            const { email, password } = req.body;

            if (!email || !password) {
                  return res.status(400).json({
                        success: false,
                        message: "Email and password are required",
                  });
            }

            const user = await findUserByEmail(
                  email.trim().toLowerCase()
            );

            if (!user) {
                  return res.status(401).json({
                        success: false,
                        message: "Invalid email",
                  });
            }

            const passwordMatch = await bcrypt.compare(
                  password,
                  user.password_hash
            );

            if (!passwordMatch) {
                  return res.status(401).json({
                        success: false,
                        message: "Invalid password",
                  });
            }

            const accessToken = jwt.sign(
                  {
                        userId: user.id,
                        email: user.email,
                        purpose: "access",
                  },
                  process.env.JWT_SECRET,
                  {
                        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
                  }
            );

            const userData = {
                  id: user.id,
                  firstName: user.first_name,
                  lastName: user.last_name,
                  email: user.email
            };

            return res.status(200).json({
                  success: true,
                  message: "Login successful",
                  data: {
                        user: userData,
                        accessToken,
                  },
            });
      } catch (error) {
            console.error("Login error:", error);

            return res.status(500).json({
                  success: false,
                  message: "Unable to login",
            });
      }
};

export const forgotPassword = async (req, res) => {
      try {
            const { email } = req.body;

            if (!email) {
                  return res.status(400).json({
                        success: false,
                        message: "Email is required",
                  });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const user = await findUserByEmail(normalizedEmail);

            if (!user) {
                  return res.status(200).json({
                        success: true,
                        message: "If an account with this email exists, a password reset link has been sent.",
                  });
            }

            // Generate a 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const resetTokenHash = await bcrypt.hash(otp, 12);

            const expiresAt = new Date(
                  Date.now() + 15 * 60 * 1000
            );

            await saveResetToken(
                  user.id,
                  resetTokenHash,
                  expiresAt
            );

            const finalHtml = otpResetTemplate(otp);

            const mail = await Nodemailer({
                  to: normalizedEmail,
                  subject: "Your Password Reset OTP",
                  text: `Your OTP for resetting your password is: ${otp}. It expires in 15 minutes.`,
                  html: finalHtml,
            });

            if (!mail.success) {
                  return res.status(500).json({
                        success: false,
                        message: "Unable to send reset email",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "A password reset link has been sent.",
            });
      } catch (error) {
            console.error("Forgot password error:", error);

            return res.status(500).json({
                  success: false,
                  message: "Unable to process password reset",
            });
      }
};

export const verifyOtp = async (req, res) => {
      try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                  return res.status(400).json({
                        success: false,
                        message: "Email and OTP are required",
                  });
            }

            const normalizedEmail = email.trim().toLowerCase();
            const userBase = await findUserByEmail(normalizedEmail);

            if (!userBase) {
                  return res.status(400).json({
                        success: false,
                        message: "Invalid or expired OTP",
                  });
            }

            const user = await findUserForReset(userBase.id);

            if (!user || !user.reset_token_hash) {
                  return res.status(400).json({
                        success: false,
                        message: "Invalid or expired OTP",
                  });
            }

            const isOtpValid = await bcrypt.compare(otp, user.reset_token_hash);

            if (!isOtpValid) {
                  return res.status(400).json({
                        success: false,
                        message: "Invalid or expired OTP",
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: "OTP verified successfully",
            });
      } catch (error) {
            console.error("Verify OTP error:", error);
            return res.status(500).json({
                  success: false,
                  message: "Unable to verify OTP",
            });
      }
};

export const resetPassword = async (req, res) => {
      try {
            const { email, password } = req.body;

            if (!email || !password) {
                  return res.status(400).json({
                        success: false,
                        message: "Email and password are required",
                  });
            }

            if (password.length < 8) {
                  return res.status(400).json({
                        success: false,
                        message: "Password must be at least 8 characters",
                  });
            }

            const normalizedEmail = email.trim().toLowerCase();
            const userBase = await findUserByEmail(normalizedEmail);

            if (!userBase) {
                  return res.status(400).json({
                        success: false,
                        message: "User not found",
                  });
            }

            const resetUser = await findUserForReset(userBase.id);
            if (!resetUser) {
                  return res.status(400).json({
                        success: false,
                        message: "Password reset request has expired or is invalid. Please request a new OTP.",
                  });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            await updatePassword(
                  userBase.id,
                  passwordHash
            );

            return res.status(200).json({
                  success: true,
                  message: "Password updated successfully",
            });
      } catch (error) {
            console.error("Reset password error:", error);

            return res.status(500).json({
                  success: false,
                  message: "Unable to reset password",
            });
      }
};
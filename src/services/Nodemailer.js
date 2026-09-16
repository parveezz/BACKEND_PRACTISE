import nodemailer from "nodemailer";

const Nodemailer = async ({ to, subject, text, html }) => {
      try {
            const transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASS,
                  },
            });

            const mailOptions = {
                  from: `"Support" <${process.env.EMAIL}>`,
                  to,
                  subject: subject,
                  text: text,
                  html: html,
            };

            const info = await transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
      } catch (error) {
            console.error("Nodemailer error:", error);
            return { success: false, error: error.message };
      }
};

export default Nodemailer;
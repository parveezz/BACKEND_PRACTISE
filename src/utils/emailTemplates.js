export const otpResetTemplate = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; }
        .container { max-width: 500px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; }
        h2 { font-size: 22px; color: #222; }
        .otp { font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px; background-color: #f4f4f4; text-align: center; border-radius: 6px; margin: 20px 0; color: #0056b3; }
        .footer { font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
</head>
<body style="background-color: #f9f9f9;">
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Please use the One-Time Password (OTP) below to proceed:</p>
        
        <div class="otp">${otp}</div>
        
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        
        <div class="footer">
            Thank you,<br>
            Your Application Team
        </div>
    </div>
</body>
</html>`;
};

export const welcomeEmailTemplate = (firstName) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our App</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; }
        .container { max-width: 500px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; }
        h2 { font-size: 22px; color: #222; }
        .footer { font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #0056b3; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    </style>
</head>
<body style="background-color: #f9f9f9;">
    <div class="container">
        <h2>Welcome to Our Platform, ${firstName}! 🎉</h2>
        <p>We are thrilled to have you on board. Your registration was successful and your account is now ready to use.</p>
        
        <p>You can now log in and start exploring all the features we have to offer.</p>
        
        <div class="footer">
            Best Regards,<br>
            Your Application Team
        </div>
    </div>
</body>
</html>`;
};

import nodemailer from 'nodemailer';

// Create transporter (configure these in .env)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send welcome email to new client
export const sendWelcomeEmail = async (email, name, tempPassword) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SkyCuts Studio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your project request has been accepted by Yashvanth — SkyCuts Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #c084fc); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to SkyCuts Studio</h1>
          </div>
          <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 10px 10px; color: #e0e0e0;">
            <p style="font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Great news! Yashvanth has accepted your project request and created an account for you on the SkyCuts platform.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              You can now log in to track your project progress, review drafts, and provide feedback.
            </p>
            <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #6366f1; font-weight: bold;">Your Login Credentials:</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> ${tempPassword}</p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #888;">Please change your password after your first login.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
                 style="background: linear-gradient(135deg, #6366f1, #c084fc); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Login to Your Dashboard
              </a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              If you have any questions, feel free to reach out to yashvanth@skycuts.io
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SkyCuts Studio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password — SkyCuts Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #c084fc); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
          </div>
          <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 10px 10px; color: #e0e0e0;">
            <p style="font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for your SkyCuts Studio account.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Click the button below to set a new password. This link will expire in 1 hour.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #6366f1, #c084fc); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; color: #888;">
              If you have any questions, feel free to reach out to yashvanth@skycuts.io
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send general notification email
export const sendNotificationEmail = async (email, name, title, message, link = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SkyCuts Studio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #c084fc); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">SkyCuts Studio</h1>
          </div>
          <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 10px 10px; color: #e0e0e0;">
            <p style="font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              ${message}
            </p>
            ${link ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" 
                 style="background: linear-gradient(135deg, #6366f1, #c084fc); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Details
              </a>
            </div>
            ` : ''}
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              If you have any questions, feel free to reach out to yashvanth@skycuts.io
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

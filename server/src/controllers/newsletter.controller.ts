import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import nodemailer from 'nodemailer';

export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    throw new ApiError(400, 'A valid email is required');
  }

  // Create a reusable transporter using Gmail (if ENV variables are present)
  // Or fallback to Ethereal Email for testing which generates fake credentials
  // so you don't actually get blocked in development.
  let transporter;
  
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real SMTP server for testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Define email content with a nice HTML template
  const mailOptions = {
    from: '"BLOGY Newsletter" <newsletter@blogy.dev>',
    to: email,
    subject: 'Welcome to BLOGY Weekly!',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-w-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
        <h1 style="color: #080808; font-size: 24px; letter-spacing: -0.04em;">BLOGY<span style="color: #666;">.</span></h1>
        <p style="font-size: 16px; line-height: 1.6;">Hello there,</p>
        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for subscribing to the <strong>BLOGY Weekly Newsletter</strong>. We're excited to have you on board!
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Every week, we'll send you a curated list of our top trending stories, insightful articles from industry professionals, and exclusive updates from the BLOGY team.
        </p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #4a90e2;">
          <p style="margin: 0; font-style: italic; color: #555;">
            "A platform for thoughtful writing. From engineers to designers, founders to thinkers — share ideas that matter."
          </p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">
          Stay tuned for our next issue. In the meantime, feel free to <a href="http://localhost:5173" style="color: #4a90e2; text-decoration: none;">read some fresh stories</a> on our platform.
        </p>
        <p style="font-size: 14px; color: #888; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          You received this email because you recently subscribed on the BLOGY website.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // If using ethereal, we can log the URL to preview the email locally
    if (!process.env.SMTP_USER) {
      console.log('📨 Test Email Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return res.status(200).json(new ApiResponse(200, {
      previewUrl: nodemailer.getTestMessageUrl(info) || ''
    }, 'Subscription successful and email sent!'));

  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, 'There was an error sending the confirmation email. Please try again later.');
  }

});

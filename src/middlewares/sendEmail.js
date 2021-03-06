import nodemailer from 'nodemailer';
import 'dotenv/config';
import 'express-async-errors';
import { generateToken } from '../utils/auth';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});

const sendVerificationEmail = async (req, res, next) => {
  const { first_name, username, email } = req.body;
  const accessToken = generateToken({ username });
  const mailOptions = {
    from: `"Barefoot Nomad"<${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: 'Verify your email',
    html: `<p>Welcome to Barefoot Nomad, Click on the link below to verify your email.</p> <br> <a href='${process.env.FRONTEND_URL}/user/verification?token=${accessToken}'>Link</a>`
  };

  try {
    const sendmail = await transporter.sendMail(mailOptions);
    return res.status(201).json({ Message: `User ${first_name} has been created. Check email for verification` });
  } catch (error) {
    next(error);
  }
};

export default sendVerificationEmail;

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

if (
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_USER !== 'your_smtp_user'
) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port: parseInt((process.env.SMTP_PORT || '587').trim(), 10),
    secure: parseInt((process.env.SMTP_PORT || '587').trim(), 10) === 465,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim()
    }
  });
} else {
  // Fallback to jsonTransport which logs the emails to console, or creates a mock transporter
  console.log('Using console-logging mock email transporter (missing SMTP configurations).');
  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
  
  // Intercept sendMail to log the raw message structure to console for verification
  const originalSend = transporter.sendMail.bind(transporter);
  transporter.sendMail = async (mailOptions) => {
    const res = await originalSend(mailOptions);
    console.log('==================================================');
    console.log('MOCK EMAIL SENT:');
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Body (HTML):\n${mailOptions.html}`);
    console.log('==================================================');
    return res;
  };
}

export default transporter;

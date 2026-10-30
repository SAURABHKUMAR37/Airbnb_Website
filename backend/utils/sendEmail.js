import nodemailer from 'nodemailer';

/**
 * Sends mail through Gmail SMTP. If EMAIL_USER / EMAIL_PASSWORD are not set it
 * logs instead of failing, so local development still works.
 */
const sendEmail = async ({ to, subject, html, devFallback }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn(`[sendEmail] EMAIL_USER / EMAIL_PASSWORD not set - not sending "${subject}" to ${to}`);
    if (devFallback) console.warn(`[sendEmail] ${devFallback}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html });
};

export default sendEmail;

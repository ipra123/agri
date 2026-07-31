import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config()

const {EMAIL_USER,EMAIL_PASS}=process.env;

/**
 * Sends an email using Nodemailer and Gmail service.
 * @param {Object} options
 * @param {string} options.to - Recipient iimeel
 * @param {string} options.subject - Iimeel subject
 * @param {string} options.text - Raw text body
 * @param {string} [options.html] - Optional HTML body
 * @returns {Promise<any>}
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
  });

  const mailOptions = {
    from:EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};
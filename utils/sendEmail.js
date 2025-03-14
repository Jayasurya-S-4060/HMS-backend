const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Hostel Management" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(` Email sent successfully: ${info.messageId}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(" Error sending email:", error);
    return { success: false, message: "Failed to send email" };
  }
};

module.exports = sendEmail;

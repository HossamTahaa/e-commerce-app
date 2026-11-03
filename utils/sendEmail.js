const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) the transporter = the "post office" (Gmail) that sends the email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) the email itself
  const mailOptions = {
    from: `E-shop App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) send it
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
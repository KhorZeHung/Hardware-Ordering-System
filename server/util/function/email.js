const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", 
  port: 465, 
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

async function email(to, subject, text) {
  const mailOptions = {
    from: "khorzehung@gmail.com",
    to: to,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions, (error, _) => {
    if (error) return false;
    return true;
  });
}

module.exports = {
  email,
};

require("dotenv").config();
const nodemailer = require("nodemailer");

//create SMMP transporter using Gmail and OAuth2
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Payemnt-Sys-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

//use this service in auth controller to send registration email after successful registration
async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Payment-Sys-Ledger!";
  const text = `Hi ${name},\n\nThank you for registering with Payment-Sys-Ledger! We're excited to have you on board.\n\nBest regards,\nThe Payment-Sys-Ledger Team`;
  const html = `<p>Hi ${name},</p><p>Thank you for registering with Payment-Sys-Ledger! We're excited to have you on board.</p><p>Best regards,<br>The Payment-Sys-Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionSuccessEmail(userEmail, name, amount) {
  const subject = "Transaction Successful!";
  const text = `Hi ${name},\n\nYour transaction of Rs. ${amount} was successful! Thank you for using Payment-Sys-Ledger.\n\nBest regards,\nThe Payment-Sys-Ledger Team`;
  const html = `<p>Hi ${name},</p><p>Your transaction of Rs. ${amount} was successful! Thank you for using Payment-Sys-Ledger.</p><p>Best regards,<br>The Payment-Sys-Ledger Team</p>`;
  //send the email
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionSuccessEmail,
};

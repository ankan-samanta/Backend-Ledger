const nodemailer = require('nodemailer');

//communicate with the smtp server transporter.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

//after registration send this
const sendRegistrationEmail = async (userEmail, name) => {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThank you for registering with Backend Ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering with Backend Ledger! We're excited to have you on board.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
};

//send TransactionSuccessfull email
const sendTransactionEmail = async (userEmail, name, amount, toAccount) => {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nA transaction of ${amount} has been completed successfully.Recipient Account:\n\n${toAccount}\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>A transaction of ${amount} has been completed successfully.Recipient Account:</p><p>${toAccount}</p><p>Best regards,<br>The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
};

const sendTransactionFailureEmail = async (userEmail, name, amount, toAccount) => {
    const subject = 'Transaction Failed!';
    const text = `Hello ${name},\n\nA transaction of ${amount} to account ${toAccount} has failed. Please check your account and try again.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>A transaction of ${amount} to account ${toAccount} has failed. Please check your account and try again.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
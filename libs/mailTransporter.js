const nodemailer = require('nodemailer');
const { configs } = require('@configs');

exports.sendEmail = async (to, subject, body) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: configs.EMAIL_USER,
      pass: configs.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"HelpDesk - API Monitoring" <${configs.EMAIL_USER}>`,
    // send in multiple email address to is array of email address
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

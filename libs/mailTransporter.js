const nodemailer = require('nodemailer');
const { configs } = require('@configs');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const loadTemplate = (template) => {
  switch (template) {
    case 'verify-account':
      return path.join(__dirname, '..', 'template', 'verify-account.html');
    default:
      return '';
  }
};
exports.sendEmail = async (to, subject, templateData, template) => {
  const templateFilePath = loadTemplate(template);

  if (!templateFilePath) {
    console.error(`Template "${template}" not found`);
    return false;
  }

  let htmlContent;
  try {
    const data = await fs.promises.readFile(templateFilePath, 'utf8');
    const compiledTemplate = handlebars.compile(data);
    htmlContent = compiledTemplate(templateData);
  } catch (err) {
    console.error('Error reading or compiling template:', err);
    return false;
  }

  // Create transporter for sending emails
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
    from: `"DownTimeMonitor" <${configs.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html: htmlContent,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

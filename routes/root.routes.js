const router = require('express').Router();
const userRoutes = require('@routes/user.routes');
const eventRoutes = require('@routes/event.routes');
const { detector } = require('@utils/common');
const { sendEmail } = require('@libs/mailTransporter');

router.use('/auth', userRoutes);
router.use('/event', eventRoutes);

router.get('/', async (req, res, next) => {
  const email = 'sunnytalukder19.bd@gmail.com';
  const subject = 'API Down Alert! 🚨';
  const body = '<h1>This is a test email</h1>';

  const emailSent = await sendEmail(email, subject, body);

  if (emailSent) {
    console.log('Email Sent');
  } else {
    console.log('Email Not Sent');
  }
  const device = detector(req.headers['user-agent']);
  res.status(200).send({
    status: true,
    message: '🎉 Congratulations! Your Server Works Perfectly! 🎉',
    device,
  });
});

module.exports = router;

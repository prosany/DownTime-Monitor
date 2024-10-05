const router = require('express').Router();
const userRoutes = require('@routes/user.routes');
const eventRoutes = require('@routes/event.routes');
const logRoutes = require('@routes/log.routes');
const { detector } = require('@utils/common');

router.use('/auth', userRoutes);
router.use('/event', eventRoutes);
router.use('/log', logRoutes);

router.get('/', async (req, res, next) => {
  const device = await detector(req.headers['user-agent']);
  res.status(200).send({
    status: true,
    message: '🎉 Congratulations! Your Server Works Perfectly! 🎉',
    device: {
      type: device?.device?.type || 'N/A',
      brand: device?.device?.brand || 'N/A',
      operatingSystem: device?.os?.name || 'N/A',
      browser: device?.client?.name || 'N/A',
    },
  });
});

module.exports = router;

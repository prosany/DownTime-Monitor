const router = require('express').Router();
const userRoutes = require('@routes/user.routes');
const { detector } = require('@utils/common');

router.use('/auth', userRoutes);

router.get('/', async (req, res, next) => {
  const device = detector(req.headers['user-agent']);
  res.status(200).send({
    status: true,
    message: '🎉 Congratulations! Your Server Works Perfectly! 🎉',
    device,
  });
});

module.exports = router;

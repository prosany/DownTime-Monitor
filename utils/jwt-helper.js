const { configs } = require('@configs');
const JWT = require('jsonwebtoken');
const { message } = require('@utils/common');

exports.generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const options = {
    expiresIn: configs.JWT_EXPIRES_IN,
    issuer: 'DownTime Monitor',
    audience: user.email,
  };

  const token = JWT.sign(payload, configs.JWT_SECRET, options);
  return token;
};

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).send({
        status: false,
        message: message('unauthorized'),
      });
    }

    if (token && token.startsWith('Bearer ') && token.split(' ')[1]) {
      const decoded = JWT.verify(token.split(' ')[1], configs.JWT_SECRET);
      req.user = { ...decoded, token: token.split(' ')[1] };
      return next();
    }

    return res.status(401).send({
      status: false,
      message: message('unauthorized'),
    });
  } catch (error) {
    return res.status(401).send({
      status: false,
      message: message('internalServerError'),
    });
  }
};

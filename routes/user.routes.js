const router = require('express').Router();
const {
  login,
  register,
  updateUser,
  verifyUser,
} = require('@controllers/user.controllers');
const { verifyToken } = require('@utils/jwt-helper');

router.post('/login', login);

router.post('/register', register);

router.patch('/update', verifyToken, updateUser);

router.get('/verify-user', verifyToken, verifyUser);

module.exports = router;

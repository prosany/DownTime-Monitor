const router = require('express').Router();
const {
  login,
  register,
  updateUser,
  verifyUser,
  getUserById,
} = require('@controllers/user.controllers');
const { verifyToken } = require('@utils/jwt-helper');

router.post('/login', login);

router.post('/register', register);

router.patch('/update', verifyToken, updateUser);

router.get('/verify-user', verifyToken, verifyUser);

router.get('/get-user/:id', verifyToken, getUserById);

module.exports = router;

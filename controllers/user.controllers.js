const createError = require('http-errors');
const { message } = require('@utils/common');
const {
  handleLogin,
  handleRegister,
  handleUpdateUser,
  handleVerifyUser,
} = require('@services/user.service');

exports.login = async (req, res, next) => {
  try {
    const { user, token } = await handleLogin(req.body, next);
    // Store Cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    // Send response
    res.status(200).send({
      status: true,
      message: 'Login successful',
      access_token: token,
      email: user.email,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

exports.register = async (req, res, next) => {
  try {
    const savedUser = await handleRegister(req.body, req, next);

    // Send user data
    res.status(201).send({
      status: true,
      message: 'User created successfully',
      email: savedUser.email,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await handleUpdateUser(req.query, req.body, next);

    res.status(200).send({
      status: true,
      message: 'User updated successfully',
      email: updatedUser.email,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const { token } = req.user;

    const user = await handleVerifyUser(token, next);

    res.status(200).send({
      status: true,
      message: 'User verified successfully',
      email: user.email,
    });
  } catch (error) {
    return next(createError(500, message('internalServerError')));
  }
};

const createError = require('http-errors');
const bcrypt = require('bcrypt');
const User = require('@models/user.model');
const { message, detector, ipLookUp } = require('@utils/common');
const { generateToken } = require('@utils/jwt-helper');

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // Check if user exists
      const user = await User.findOne({
        email: { $regex: new RegExp(email, 'i') },
      });

      switch (true) {
        case !user:
          return next(createError(401, message('invalidCredentials')));

        case user?.isBlocked:
          return next(createError(401, message('accountBlocked')));

        case !user?.isEmailVerified:
          return next(createError(401, message('accountNotVerified')));

        default:
          break;
      }

      // Check if password is correct
      const isPass = await bcrypt.compare(password, user.password);
      if (!isPass) return next(createError(401, message('invalidCredentials')));

      // Generate token
      const token = generateToken(user);

      await User.findOneAndUpdate(
        { email: { $regex: new RegExp(email, 'i') } },
        {
          $set: {
            authToken: token,
          },
        },
        { new: true }
      );

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
  },
  register: async (req, res, next) => {
    try {
      const { fullName, email, password } = req.body;
      // Check if user exists
      const user = await User.findOne({
        email: { $regex: new RegExp(email, 'i') },
      });
      if (user) return next(createError(409, message('accountExists')));

      const device = await detector(req.headers['user-agent']);
      const ipLook = await ipLookUp(req?.ip);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create user
      const draftUser = new User({
        fullName,
        email,
        password: hashedPassword,
        device_ip: {
          deviceOS: device?.os?.family,
          deviceType: device?.os?.family,
          deviceBrand: device?.device?.brand,
          deviceModel: device?.device?.model,
          ipAddress: req?.ip,
          country_name: ipLook?.country_name,
          state_prov: ipLook?.region,
          city: ipLook?.city,
          time_zone: ipLook?.timezone,
          ispOrganization: ipLook?.org,
        },
      });

      // Save user
      const savedUser = await draftUser.save();

      // Send user data
      res.status(201).send({
        status: true,
        message: 'User created successfully',
        email: savedUser.email,
      });
    } catch (error) {
      next(createError(500, message('internalServerError')));
    }
  },
  updateUser: async (req, res, next) => {
    try {
      const { id, email } = req.query;
      // Check if user exists
      const user = await User.findOne({
        $or: [{ _id: id }, { email: { $regex: new RegExp(email, 'i') } }],
      });

      if (!user) return next(createError(404, message('invalidCredentials')));

      delete req?.body?.email;

      const updatedUser = await User.findOneAndUpdate(
        {
          $or: [{ _id: id }, { email: { $regex: new RegExp(email, 'i') } }],
        },
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(200).send({
        status: true,
        message: 'User updated successfully',
        email: updatedUser.email,
      });
    } catch (error) {
      next(createError(500, message('internalServerError')));
    }
  },
  verifyUser: async (req, res, next) => {
    try {
      const { token } = req.user;

      // Check if token exists and is valid
      const user = await User.findOne({
        authToken: token,
      });

      if (!user) return next(createError(401, message('invalidCredentials')));

      res.status(200).send({
        status: true,
        message: 'User verified successfully',
        email: user.email,
      });
    } catch (error) {
      return next(createError(500, message('internalServerError')));
    }
  },
};

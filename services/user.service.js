const createError = require('http-errors');
const bcrypt = require('bcrypt');
const User = require('@models/user.model');
const Otp = require('@models/otp.model');
const { message, detector, ipLookUp, createOtp } = require('@utils/common');
const { generateToken } = require('@utils/jwt-helper');
const { sendEmail } = require('@libs/mailTransporter');

exports.handleLogin = async (body, nextFunc) => {
  // Check if user exists
  const user = await User.findOne({
    email: { $regex: new RegExp(body.email, 'i') },
  });

  switch (true) {
    case !user:
      return nextFunc(createError(401, message('invalidCredentials')));

    case user?.isBlocked:
      return nextFunc(createError(401, message('accountBlocked')));

    case !user?.isEmailVerified:
      return nextFunc(createError(401, message('accountNotVerified')));

    default:
      break;
  }

  // Check if password is correct
  const isPass = await bcrypt.compare(body.password, user.password);
  if (!isPass) return nextFunc(createError(401, message('invalidCredentials')));

  // Generate token
  const token = generateToken(user);

  await User.findOneAndUpdate(
    { email: { $regex: new RegExp(body.email, 'i') } },
    {
      $set: {
        authToken: token,
      },
    },
    { new: true }
  );

  return {
    user,
    token,
  };
};

exports.handleRegister = async (body, req, nextFunc) => {
  // Check if user exists
  const user = await User.findOne({
    email: { $regex: new RegExp(body.email, 'i') },
  });
  if (user) return nextFunc(createError(409, message('accountExists')));

  const device = await detector(req.headers['user-agent']);
  const ipLook = await ipLookUp(req?.ip);

  // Hash password
  const hashedPassword = await bcrypt.hash(body.password, 10);

  const hasPremiumAccess = body.email.endsWith('@programming-hero.com');
  // Create user
  const draftUser = new User({
    fullName: body.fullName,
    email: body.email,
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
    plan: hasPremiumAccess ? 'premium' : 'free',
    planExpires: hasPremiumAccess
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 30))
      : new Date(new Date().setDate(new Date().getDate() + 3)),
    eventCreateLimit: hasPremiumAccess ? 100000 : 5,
  });

  const [savedUser, otpCode] = await Promise.all([
    draftUser.save(),
    createOtp(6),
  ]);

  const draftOtp = new Otp({
    userId: savedUser._id,
    otp: otpCode,
  });

  draftOtp.save();

  // Send email verification
  sendEmail(
    savedUser.email,
    'Verify your DownTimeMonitor account',
    { name: savedUser.fullName, otp: otpCode, year: new Date().getFullYear() },
    'verify-account'
  );

  return savedUser;
};

exports.handleUpdateUser = async (query, body, nextFunc) => {
  // Check if user exists
  const user = await User.findOne({
    $or: [
      { _id: query?.id },
      { email: { $regex: new RegExp(query?.email, 'i') } },
    ],
  });

  if (!user) return nextFunc(createError(404, message('invalidCredentials')));

  delete body?.email;

  const updatedUser = await User.findOneAndUpdate(
    {
      $or: [
        { _id: query?.id },
        { email: { $regex: new RegExp(query?.email, 'i') } },
      ],
    },
    {
      $set: body,
    },
    { new: true }
  );

  return updatedUser;
};

exports.handleVerifyUser = async (token, nextFunc) => {
  // Check if token exists and is valid
  const user = await User.findOne({
    authToken: token,
  });

  if (!user) return nextFunc(createError(401, message('invalidCredentials')));

  return user;
};

exports.handleGetUserById = async (id, nextFunc) => {
  // Check if user exists
  const user = await User.findById(id);
  if (!user) return nextFunc(createError(404, message('invalidCredentials')));

  return user;
};

exports.handleVerifyAccount = async (otp, userId, nextFunc) => {
  if (!otp || !userId) {
    return nextFunc(createError(401, message('notEnoughData')));
  }

  // Check if OTP exists
  const [otpData, userData] = await Promise.all([
    Otp.findOne({
      otp,
      userId,
    }),
    User.findById(userId),
  ]);

  if (!otpData || !userData) {
    return nextFunc(createError(401, message('notEnoughData')));
  }

  // Check if OTP is expired
  const currentTime = new Date();
  const otpExpireTime = new Date(otpData.expireAt);
  if (currentTime > otpExpireTime) {
    const [_deleteOtp, otpCode] = await Promise.all([
      Otp.deleteOne({
        otp,
        userId,
      }),
      createOtp(6),
    ]);

    const draftOtp = new Otp({
      userId: userData._id,
      otp: otpCode,
    });

    draftOtp.save();

    // Send email verification
    sendEmail(
      userData.email,
      'Confirm your DownTimeMonitor account',
      { name: userData.fullName, otp: otpCode, year: new Date().getFullYear() },
      'verify-account'
    );
    return nextFunc(createError(401, message('otpExpired')));
  }

  // Verify account
  const [user, _deleteOtp] = await Promise.all([
    User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isEmailVerified: true,
        },
      },
      { new: true }
    ),
    Otp.deleteOne({
      otp,
      userId,
    }),
  ]);

  return {
    fullName: user.fullName,
    email: user.email,
  };
};

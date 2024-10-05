const createError = require('http-errors');
const bcrypt = require('bcrypt');
const User = require('@models/user.model');
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

  // Save user
  const savedUser = await draftUser.save();

  const otpCode = await createOtp(6);

  // Send email verification
  await sendEmail(
    savedUser.email,
    'Verify Your Account!'`Your OTP is: ${otpCode}`
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

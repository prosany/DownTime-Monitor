const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now(),
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'user'],
      default: 'user',
    },
    authToken: {
      type: String,
      default: '',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    device_ip: {
      type: Object,
      default: {
        deviceOS: '',
        deviceType: '',
        deviceBrand: '',
        deviceModel: '',
        ipAddress: '',
        country_name: '',
        state_prov: '',
        city: '',
        time_zone: '',
        ispOrganization: '',
      },
    },
    plan: {
      type: String,
      default: 'free',
      enum: ['free', 'premium'],
    },
    planExpires: {
      type: Date,
      // in 3 days
      default: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    eventCreateLimit: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

const User = model('user', userSchema);

module.exports = User;

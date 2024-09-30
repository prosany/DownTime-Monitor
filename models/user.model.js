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
  },
  { timestamps: true }
);

const User = model('user', userSchema);

module.exports = User;

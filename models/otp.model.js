const { Schema, model } = require('mongoose');

const otpSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      default: Date.now() + 15 * 60 * 1000,
    },
  },
  {
    timestamps: true,
  }
);

const Otp = model('otp', otpSchema);

module.exports = Otp;

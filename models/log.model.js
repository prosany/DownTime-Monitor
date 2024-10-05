const { Schema, model } = require('mongoose');

const logSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'event',
      required: true,
    },
    logType: {
      type: String,
      required: true,
      enum: ['error', 'success'],
    },
    logData: {
      type: Object,
      required: true,
    },
    logTime: {
      type: Date,
      default: Date.now(),
    },
    responseTime: {
      type: String,
      default: '0ms',
    },
  },
  {
    timestamps: true,
  }
);

const Logs = model('log', logSchema);

module.exports = Logs;

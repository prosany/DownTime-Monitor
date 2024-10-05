const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  runInterval: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  lastRun: {
    type: Date,
    default: null,
  },
  lastError: {
    type: Object,
    default: {},
  },
  queryUrl: {
    type: String,
    required: true,
  },
  queryMethod: {
    type: String,
    enum: ['GET', 'POST'],
    default: 'GET',
  },
  queryHeaders: {
    type: Object,
    default: {},
  },
  queryBody: {
    type: Object,
    default: {},
  },
  notifiedBy: {
    type: String,
    required: true,
    enum: ['email', 'webhook', 'both'],
  },
  notificationEmail: {
    type: [String],
    default: [],
  },
  notificationWebhook: {
    type: String,
    default: '',
  },
  notificationBody: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  lastNotified: {
    type: Date,
    default: null,
  },
});

const Events = model('event', eventSchema);

module.exports = Events;

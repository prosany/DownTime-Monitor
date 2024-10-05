const createError = require('http-errors');
const { message } = require('@utils/common');
const Events = require('@models/event.model');
const Users = require('@models/user.model');

exports.handleCreateEvent = async (user, body, nextFunc) => {
  console.log('🌺 | exports.handleCreateEvent= | user:', user);
  const singleUser = await Users.findById({
    _id: user.id,
  });

  if (!singleUser) {
    return nextFunc(createError(404, message('invalidData')));
  }

  if (singleUser.plan === 'free' && singleUser.eventCreateLimit <= 0) {
    return nextFunc(createError(400, message('eventLimitExceeded')));
  }

  const {
    name,
    description,
    runInterval,
    queryUrl,
    queryMethod,
    queryHeaders,
    queryBody,
    notifiedBy,
    notificationEmail,
    notificationWebhook,
    notificationBody,
    tags,
  } = body;

  if (!name || !runInterval || !queryUrl || !notifiedBy) {
    return nextFunc(createError(400, message('invalidData')));
  }

  const newEvent = new Events({
    name,
    description: description || '',
    runInterval,
    queryUrl,
    queryMethod: queryMethod || 'GET',
    queryHeaders: queryHeaders || {},
    queryBody: queryBody || {},
    notifiedBy,
    notificationEmail: notificationEmail || '',
    notificationWebhook: notificationWebhook || '',
    notificationBody: notificationBody || '',
    tags: tags || [],
    createdBy: user.id,
  });

  await Promise.all([
    newEvent.save(),
    Users.findOneAndUpdate(
      { _id: user.id },
      { $inc: { eventCreateLimit: -1 } },
      { new: true }
    ),
  ]);

  return newEvent;
};

exports.handleGetEvents = async () => {
  const events = await Events.find().populate('createdBy', {
    _id: 0,
    email: 1,
    fullName: 1,
  });

  return events;
};

exports.handleGetSingleEvent = async (id) => {
  const event = await Events.findById(id).populate('createdBy', {
    _id: 0,
    email: 1,
    fullName: 1,
  });

  return event;
};

exports.handleUpdateEvent = async (id, body, nextFunc) => {
  const event = await Events.findById(id);

  if (!event) {
    return nextFunc(createError(404, message('invalidData')));
  }

  const {
    name,
    description,
    runInterval,
    queryUrl,
    queryMethod,
    queryHeaders,
    queryBody,
    notifiedBy,
    notificationEmail,
    notificationWebhook,
    notificationBody,
    tags,
  } = body;

  event.name = name || event.name;
  event.description = description || event.description;
  event.runInterval = runInterval || event.runInterval;
  event.queryUrl = queryUrl || event.queryUrl;
  event.queryMethod = queryMethod || event.queryMethod;
  event.queryHeaders = queryHeaders || event.queryHeaders;
  event.queryBody = queryBody || event.queryBody;
  event.notifiedBy = notifiedBy || event.notifiedBy;
  event.notificationEmail = notificationEmail || event.notificationEmail;
  event.notificationWebhook = notificationWebhook || event.notificationWebhook;
  event.notificationBody = notificationBody || event.notificationBody;
  event.tags = tags || event.tags;

  await event.save();

  return event;
};

exports.handleDeleteEvent = async (id, nextFunc) => {
  const event = await Events.findById(id);

  if (!event) {
    return nextFunc(createError(404, message('invalidData')));
  }

  const deletedEvent = await Events.findByIdAndDelete(id);

  return deletedEvent;
};

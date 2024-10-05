const createError = require('http-errors');
const { message } = require('@utils/common');
const Events = require('@models/event.model');

exports.createEvent = async (req, res, next) => {
  try {
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
      createdBy,
    } = req.body;

    if (!name || !runInterval || !queryUrl || !notifiedBy) {
      return res.status(400).json({
        message:
          'Missing required fields: name, runInterval, queryUrl, and notifiedBy are required.',
      });
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
      createdBy,
    });

    // Save the event to the database
    await newEvent.save();

    // Send a response with the created event
    res.status(201).json({
      message: 'Event created successfully.',
      event: newEvent,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Events.find().populate('createdBy', {
      _id: 0,
      email: 1,
      fullName: 1,
    });

    res.status(200).json({
      message: 'Events fetched successfully.',
      events,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Events.findById(id).populate('createdBy', {
      _id: 0,
      email: 1,
      fullName: 1,
    });

    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
      });
    }

    res.status(200).json({
      message: 'Event fetched successfully.',
      event,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Events.findById(id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
      });
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
    } = req.body;

    event.name = name || event.name;
    event.description = description || event.description;
    event.runInterval = runInterval || event.runInterval;
    event.queryUrl = queryUrl || event.queryUrl;
    event.queryMethod = queryMethod || event.queryMethod;
    event.queryHeaders = queryHeaders || event.queryHeaders;
    event.queryBody = queryBody || event.queryBody;
    event.notifiedBy = notifiedBy || event.notifiedBy;
    event.notificationEmail = notificationEmail || event.notificationEmail;
    event.notificationWebhook =
      notificationWebhook || event.notificationWebhook;
    event.notificationBody = notificationBody || event.notificationBody;
    event.tags = tags || event.tags;

    await event.save();

    res.status(200).json({
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Events.findById(id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found.',
      });
    }

    await event.remove();

    res.status(200).json({
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

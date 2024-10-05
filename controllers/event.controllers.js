const createError = require('http-errors');
const { message } = require('@utils/common');
const {
  handleCreateEvent,
  handleGetEvents,
  handleGetSingleEvent,
  handleUpdateEvent,
  handleDeleteEvent,
} = require('@services/event.service');

exports.createEvent = async (req, res, next) => {
  try {
    const user = req.user;
    const newEvent = await handleCreateEvent(user, req.body, next);

    res.status(201).json({
      message: 'Event created successfully.',
      event: newEvent,
    });
  } catch (error) {
    console.log('🌺 | exports.createEvent= | error:', error);
    next(createError(500, message('internalServerError')));
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await handleGetEvents();

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

    const event = await handleGetSingleEvent(id);

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

    const event = await handleUpdateEvent(id, req.body, next);

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

    const event = await handleDeleteEvent(id, next);

    res.status(200).json({
      message: 'Event deleted successfully.',
      event,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

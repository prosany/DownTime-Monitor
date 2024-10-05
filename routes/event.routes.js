const router = require('express').Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require('@controllers/event.controllers');

router.post('/create-event', createEvent);

router.get('/list-event', getEvents);

router.get('/get-event/:id', getEvent);

router.patch('/update-event/:id', updateEvent);

router.patch('/delete-event/:id', deleteEvent);

module.exports = router;

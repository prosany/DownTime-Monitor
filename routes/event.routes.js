const router = require('express').Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require('@controllers/event.controllers');
const { verifyToken } = require('@utils/jwt-helper');

router.post('/create-event', verifyToken, createEvent);

router.get('/list-event', verifyToken, getEvents);

router.get('/get-event/:id', verifyToken, getEvent);

router.patch('/update-event/:id', verifyToken, updateEvent);

router.patch('/delete-event/:id', verifyToken, deleteEvent);

module.exports = router;

const axios = require('axios');
const Events = require('@models/event.model');
const Logs = require('@models/log.model');
const { intervalCorns } = require('@utils/common');
const schedule = require('node-schedule');
const { sendEmail } = require('@libs/mailTransporter');
const createError = require('http-errors');
const { message } = require('@utils/common');
const { sendWebhook } = require('@libs/webhookTransporter');

const scheduledEvents = new Set(); // Track scheduled events

exports.startQuery = async (event) => {
  const startTime = new Date();
  try {
    const { queryUrl, queryMethod, queryHeaders, queryBody } = event;
    const response = await axios({
      method: queryMethod,
      url: queryUrl,
      headers: queryHeaders,
      data: queryBody,
    });

    const endTime = new Date();

    // Save logs
    const newLog = new Logs({
      eventId: event._id,
      logType: 'success',
      logTime: new Date(),
      logData: {
        statusCode: response?.status,
        statusText: response?.statusText,
        method: response?.config?.method,
        url: queryUrl,
        headers: response?.headers,
        data: response?.data,
      },
      responseTime: `Status Code: ${response?.status} in ${
        endTime - startTime
      }ms`,
    });
    await newLog.save();

    // console.log(`✅ Queue processed - ${event.name}: ${response.data}`);

    event.lastRun = new Date();
    event.lastError = '';
    await event.save();
  } catch (error) {
    const endTime = new Date();
    // Save logs
    const newLog = new Logs({
      eventId: event._id,
      logType: 'error',
      logTime: new Date(),
      logData: {
        statusCode: error?.response?.status,
        statusText: error?.response?.statusText,
        method: error?.response?.config?.method,
        url: error?.config?.url,
        headers: error?.response?.headers,
        data: error?.message,
      },
      responseTime: `Status Code: ${error?.response?.status} in ${
        endTime - startTime
      }ms`,
    });

    await newLog.save();

    // console.error(`🚨 ${event.name} Request Error: ${error.message}`);

    const lastNotified = new Date(event.lastNotified);
    const currentTime = new Date();
    const diff = currentTime - lastNotified;
    const diffInMinutes = Math.floor(diff / 60000);

    // Check if notification needs to be sent
    if (!event.lastNotified || diffInMinutes >= 30) {
      // Send notification on error
      const { notificationEmail } = event;
      const subject = `API Down - ${event.name} 🚨`;
      const body = `The API "${event.name}" is down. The error message is: ${error.message}`;

      if (event.notifiedBy === 'webhook') {
        await sendWebhook(event.notificationWebhook, event.name, error.message);
      } else if (event.notifiedBy === 'email') {
        await sendEmail(notificationEmail, subject, body);
      } else if (event.notifiedBy === 'both') {
        await sendEmail(notificationEmail, subject, body);
        await sendWebhook(event.notificationWebhook, event.name, error.message);
      }

      event.lastRun = new Date();
      event.lastError = error.message;
      event.lastNotified = new Date();
      await event.save();
    } else {
      console.log('Notification already sent. Skipping for 30min...');
    }
  }
};

exports.startMonitoring = async () => {
  // Function to schedule a single event
  const scheduleEvent = async (event) => {
    if (!scheduledEvents.has(event._id)) {
      // Check if already scheduled
      const interval = intervalCorns(event.runInterval);
      if (interval) {
        scheduledEvents.add(event._id); // Mark as scheduled
        schedule.scheduleJob(interval, async () => {
          try {
            await exports.startQuery(event);
          } catch (error) {
            console.error(`Error during monitoring for ${event.name}:`, error);
          }
        });
        // console.log(
        //   `🚀 In Queue - ${event.name} runs on every ${event.runInterval}`
        // );
      }
    }
  };

  try {
    const events = await Events.find({ status: 'active' });
    // Schedule existing events
    for (const event of events) {
      await scheduleEvent(event);
    }

    // Poll for new events every minute
    setInterval(async () => {
      const newEvents = await Events.find({
        status: 'active',
        _id: { $nin: Array.from(scheduledEvents) }, // Find new events not already scheduled
      });

      for (const event of newEvents) {
        await scheduleEvent(event); // Schedule the new event
      }
    }, 60000); // Check every minute
  } catch (error) {
    console.error('Error starting monitoring:', error);
    // Use next to propagate the error to your error handling middleware
    next(createError(500, message('internalServerError')));
  }
};

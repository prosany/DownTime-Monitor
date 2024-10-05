const axios = require('axios');

exports.sendWebhook = async (url, eventName, message) => {
  const body = {
    username: `API Monitoring - ${eventName}`,
    avatar_url: 'https://i.imgur.com/4M34hi2.png',
    content: `The API "${eventName}" is down. The error message is: ${message}`,
  };

  try {
    await axios.post(url, body);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

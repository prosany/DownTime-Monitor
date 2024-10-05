const httpError = require('http-errors');
const DeviceDetector = require('node-device-detector');

exports.createError = (status, message) => {
  return httpError(status, message);
};

exports.message = (msg) => {
  const messages = {
    invalidCredentials: 'Invalid Credentials / No Account',
    internalServerError: 'An internal server error occurred',
    accountExists: 'Wrong Account Information / Account Exists',
    accountBlocked: 'Your account has been blocked by the administrator',
    accountNotVerified: 'Your account has not been verified',
    unauthorized: 'You are not authorized to access this resource',
    invalidData: "You've entered invalid event data",
    eventLimitExceeded: 'You have exceeded the 5 event creation limit',
  };

  return messages[msg] || 'An error occurred';
};

exports.detector = (userAgent) => {
  const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
    deviceTrusted: false,
    deviceInfo: false,
    maxUserAgentSize: 500,
  });

  return detector.detect(userAgent);
};

exports.ipLookUp = async (ip) => {
  return new Promise((resolve, reject) => {
    const axios = require('axios');
    const instance = axios.create({
      baseURL: `https://ipapi.co/${ip}/json/`,
      timeout: 5000,
    });

    instance
      .get()
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.intervalCorns = (interval) => {
  const intervals = {
    '1min': '*/1 * * * *',
    '5min': '*/5 * * * *',
    '10min': '*/10 * * * *',
    '15min': '*/15 * * * *',
    '30min': '*/30 * * * *',
    '1hour': '0 * * * *',
    '2hour': '0 */2 * * *',
    '3hour': '0 */3 * * *',
    '6hour': '0 */6 * * *',
    '12hour': '0 */12 * * *',
    '1day': '0 0 * * *',
    '2day': '0 0 */2 * *',
    '3day': '0 0 */3 * *',
    '1week': '0 0 * * 0',
    '2week': '0 0 * * 0',
    '1month': '0 0 1 * *',
  };

  return intervals[interval];
};

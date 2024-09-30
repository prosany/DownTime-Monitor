const httpError = require('http-errors');
const DeviceDetector = require('node-device-detector');

module.exports = {
  createError: (status, message) => {
    return httpError(status, message);
  },
  message: (msg) => {
    const messages = {
      invalidCredentials: 'Invalid Credentials / No Account',
      internalServerError: 'An internal server error occurred',
      accountExists: 'Wrong Account Information / Account Exists',
      accountBlocked: 'Your account has been blocked by the administrator',
      accountNotVerified: 'Your account has not been verified',
      unauthorized: 'Unauthorized Access',
    };

    return messages[msg] || 'An error occurred';
  },
  detector: (userAgent) => {
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
      deviceTrusted: false,
      deviceInfo: false,
      maxUserAgentSize: 500,
    });

    return detector.detect(userAgent);
  },
  ipLookUp: async (ip) => {
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
  },
};

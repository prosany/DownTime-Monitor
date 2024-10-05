const Logs = require('@models/log.model');

exports.handleGetLogs = async () => {
  return Logs.find({});
};

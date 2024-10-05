const createError = require('http-errors');
const { message } = require('@utils/common');
const { handleGetLogs } = require('@services/log.service');

exports.getLogs = async (req, res, next) => {
  try {
    // Get logs
    const logs = await handleGetLogs();

    // Send response
    res.status(200).send({
      status: true,
      message: 'Logs fetched successfully',
      data: logs,
    });
  } catch (error) {
    next(createError(500, message('internalServerError')));
  }
};

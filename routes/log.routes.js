const router = require('express').Router();
const { verifyToken } = require('@utils/jwt-helper');
const { getLogs } = require('@controllers/log.controllers');

router.get('/list-logs', verifyToken, getLogs);

module.exports = router;

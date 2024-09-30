// Register module-alias
require('module-alias/register');

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { configs, corsConfig } = require('@configs');
const { createError } = require('@utils/common');

// database connection
require('@libs/dbConnection');

const app = express();

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use(compression());

// Routes
app.use('/', require('@routes/root.routes'));

// Error handler
app.use(async (_req, _res, next) => {
  return next(createError(404, 'Wrong Request API Endpoint'));
});

app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  res.send({
    status: false,
    message: err.message,
  });
});

// Listen
app.listen(configs.PORT, () => {
  console.log(`Server is running on port ${configs.PORT}`);
});

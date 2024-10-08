const { connect, connection } = require('mongoose');
const { configs } = require('@configs');
const { startMonitoring } = require('@libs/queryHelper');

connect(configs.DB_URL);

connection.on('connected', () => {
  console.log('Connected to Database');
  startMonitoring();
});

connection.on('error', (err) => {
  console.log('Connection error', err.message);
});

connection.on('disconnected', () => {
  console.log('Disconnected from Database');
});

process.on('SIGINT', async () => {
  await connection.close();
  process.exit(0);
});

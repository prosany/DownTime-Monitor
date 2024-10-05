module.exports = {
  apps: [
    {
      name: 'downtime-monitoring-backend',
      script: './app.js',
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};

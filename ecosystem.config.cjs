module.exports = {
  apps: [
    {
      name: 'iskcon-api',
      script: 'dist/server.js',
      cwd: './server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/iskcon-api-error.log',
      out_file: '/var/log/pm2/iskcon-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};


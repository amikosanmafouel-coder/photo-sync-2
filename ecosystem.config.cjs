module.exports = {
  apps: [
    {
      name: 'laravel',
      cwd: '/home/amikosanmafouel/photo-sync',
      script: 'php',
      args: 'artisan serve --port=8000',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'ngrok',
      cwd: '/home/amikosanmafouel',
      script: './ngrok',
      args: 'http 8000',
      autorestart: true,
      watch: false
    },
    {
      name: 'vue',
      cwd: '/home/amikosanmafouel/photo-sync/frontend',
      script: 'npm',
      args: 'run dev -- --host',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};

module.exports = {
  apps: [
    {
      name: "swa-backend",
      script: "./server.js",
      instances: "max", // Uses all available CPU Cores!
      exec_mode: "cluster", // Enables Zero-Downtime Reloads
      watch: false,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }
  ]
};

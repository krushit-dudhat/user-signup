const chalk = require('chalk');
const http = require('http');
const http = require('http');
const app = require('./app');

const server = http.createServer(app);

process.on('uncaughtException', (uncaughtExc) => {
  console.error(chalk.bgRed('UNCAUGHT EXCEPTION! 💥 Shutting down...'));
  console.error('uncaughtException Err::', uncaughtExc);
  console.error('uncaughtException Stack::', JSON.stringify(uncaughtExc.stack));
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(chalk.bgRed('UNHANDLED PROMISE REJECTION! 💥 Shutting down...'));
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.info('💥 Process terminated!');
  });
});

server.listen(envConstants.APP_PORT || 4000, () => {
  console.info(`Server listening on port ${chalk.blue(`${envConstants.APP_HOST}:${envConstants.APP_PORT}`)}`);
});

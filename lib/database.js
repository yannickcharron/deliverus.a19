const chalk = require('chalk');
const config = require('config');
const mongoose = require('mongoose');
let gracefulShutdown;
const dbURI = process.env.MONGO_URL || config.dbConfig.url;


module.exports = mongoose.connect(dbURI, { useCreateIndex: true, useNewUrlParser: true });

// CONNECTION EVENTS
mongoose.connection.on('connected', function () {
  console.log(chalk.green('Mongoose connected to ' + dbURI));
});
mongoose.connection.on('error', function (err) {
  console.log(chalk.red('Mongoose connection error: ' + err));
});
mongoose.connection.on('disconnected', function () {
  console.log(chalk.yellow('Mongoose disconnected'));
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function (msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', function () {
  gracefulShutdown('Restart', function () {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function () {
  gracefulShutdown('App termination', function () {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', function () {
  gracefulShutdown('Hosting app termination', function () {
    process.exit(0);
  });
});
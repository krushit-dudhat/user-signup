const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const dbConnection = require('./connection/db.conn');
const router = require('./routes/index');
const path = require('path');
const { routeErrorHandler, errorHandler } = require('./helpers/error-handler');

const app = express();
dbConnection.connect();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(logger('dev'));

// set ejs view engine.
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './src/views'));

router(app);
app.use(routeErrorHandler);
app.use(errorHandler);

module.exports = app;

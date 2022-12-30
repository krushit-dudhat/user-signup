const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const dbConnection = require('./connection/db.conn');
const router = require('./routes/index');

const app = express();
dbConnection.connect();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(logger('dev'));
router(app);

module.exports = app;

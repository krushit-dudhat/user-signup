const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const dbConnection = require('./connection/db.conn');

const app = express();
dbConnection.connect();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(logger('dev'));

module.exports = app;

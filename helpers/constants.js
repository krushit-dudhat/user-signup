require('dotenv').config();

exports.envConst = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 27017,
  DB_NAME: process.env.DB_NAME || 'test_dummy',
  DB_DIALECT: process.env.DB_DIALECT || 'mongodb',
  DB_DEBUG_MODE: process.env.DB_DEBUG_MODE || false,
  APP_HOST: process.env.APP_HOST || 'http://localhost',
  APP_PORT: process.env.APP_PORT || 3000,
  SECRET: process.env.SECRET || 'secret',
  NODE_ENV: process.env.NODE_ENV || 'dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
};

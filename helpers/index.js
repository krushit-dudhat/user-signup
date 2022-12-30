const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { envConst } = require('./constants');

const successResponse = (req, res, data, message = "operation successfull", code = 200) => {
  res.status(code);
  res.send({
    error: false,
    message,
    data,
  });
};

const errorResponse = (req, res, message = "something went wrong", code = 500, data = null) => {
  res.status(code);
  res.send({
    error: true,
    message,
    data,
  });
};

const generateJWTtoken = (object, secretKey = envConst.SECRET, expiry) => jwt.sign(object, secretKey, { expiresIn: expiry || envConst.JWT_EXPIRES_IN });

const encryptPassword = (password) => crypto.createHash('md5').update(password).digest('hex');

const comparePassword = (password, hash) => encryptPassword(password) === hash;

module.exports = {
  encryptPassword,
  comparePassword,
  successResponse,
  errorResponse,
  generateJWTtoken,
};
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { envConst } = require('../helpers/constants');
const {
  errorResponse,
} = require('../helpers/index');

const authorization = async (req, res, next) => {
  let token;
  if (req.query.forgotToken) {
    token = req.query.forgotToken;
  } else {
    token = req.headers.authorization;
  }
  if (!token) {
    return errorResponse(req, res, 'Authorization token not found', 401);
  }
  try {
    const decoded = jwt.verify(token, req.headers.authorization ? envConst.SECRET : envConst.FORGOT_PASSWORD_SECRET);
    if (!decoded) {
      return errorResponse(req, res, 'Invalid token', 401);
    }
    
    let user;
    try {
      user = await userModel.findOne({
        _id: decoded._id,
        isArchived: false,
      }).exec();
    } catch (error) {
      return next(error);
    }

    if (!user) {
      return errorResponse(req, res, 'User not found', 404);
    }

    if (!user.isEmailVerified) {
      return errorResponse(req, res, 'Email not verified', 401, {
        data: { 
          isEmailVerified: false,
        }
        });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authorization,
};
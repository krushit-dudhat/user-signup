const jwt = require('jsonwebtoken');
const userModel = require('../../models/user.model');
const { envConst } = require('../../helpers/constants');
const {
  successResponse,
  errorResponse,
  encryptPassword,
  comparePassword,
  generateJWTtoken,
} = require('../../helpers/index');
const { sendEmail } = require('../../helpers/email');

const signup = async (req, res, next) => {
  const { email, password, name } = req.body;
  let userExist;
  try {
    userExist = await userModel.findOne({ email });
  } catch (error) {
    return next(error);
  }
  if (userExist) {
    return res.status(400).json({
      error: false,
      message: 'User already exists',
      data: {},
    });
  }

  const userObj = {
    email,
    password: encryptPassword(password),
    name,
  }
  let user;
  try {
    user = await userModel.create(userObj);
  } catch (error) {
    return next(error);
  }

  try {
    const token = jwt.sign({ _id: user._id }, envConst.EMAIL_SECRET, { expiresIn: '10m' });
    sendEmail({
      email: email,
      subject: 'Email verification',
      html: `Please click on the link to verify your email <a href="${envConst.FRONT_URL}/verify-email?token=${token}">Verify Email</a>`,
    });
  } catch (error) {
    return next(error);
  }
  // send email to user for verification

  const trimmedUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
  }
  return res.status(201).json({
    error: false,
    message: 'User created successfully',
    data: {
      user: trimmedUser,
    },
  });
}

const verifyEmail = async (req, res, next) => {
  const { token } = req.query;
  try {
    let decoded;
    try {
    decoded = jwt.verify(token, envConst.EMAIL_SECRET);
    } catch (error) {
      return next(error);
    }
    console.log(decoded);
    if (decoded) {
      console.log(decoded);
      let user;
      try {
        user = await userModel.findOneAndUpdate({
          _id: decoded._id,
          isArchived: false,
        }, {
          $set: {
            isEmailVerified: true,
          }
        }).exec();
      } catch (error) {
        return next(error);
      }

      if (!user) {
        return errorResponse(req, res, 'User not found', 404);
      }

      const trimmedUser = {
        _id: user._id,
        email: user.email,
        name: user.name,
        isArchived: user.isArchived,
      }
      const token = generateJWTtoken(trimmedUser);
      userModel.findOneAndUpdate({
        _id: user._id,
      }, {
        $set: {
          token,
        }
      });
      return successResponse(req, res, { token, user: trimmedUser }, 'User verified successfully', 200);
    } else {
      return errorResponse(req, res, 'Invalid token', 400);
    }
  } catch (error) {
    return next(error);
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await userModel.findOne({
      email,
      isArchived: false,
    });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return errorResponse(req, res, 'User not found', 404);
  }
  if (!comparePassword(password, user.password)) {
    return errorResponse(req, res, 'Invalid credentials', 400);
  }
  if (!user.isEmailVerified) {
    try {
      const token = jwt.sign({ _id: user._id }, envConst.EMAIL_SECRET, { expiresIn: '10m' });
      sendEmail({
        email: email,
        subject: 'Email verification',
        html: `Please click on the link to verify your email <a href="${envConst.FRONT_URL}/verify-email?token=${token}">Verify Email</a>`,
      });
    } catch (error) {
      return next(error);
    }
    return successResponse(req, res, {}, 'Please verify Email first', 200);
  }

  const trimmedUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    isArchived: user.isArchived,
    gender: user.gender,
    isEmailVerified: user.isEmailVerified,
  }

  try {
    const token = generateJWTtoken(trimmedUser);
    trimmedUser.image = user.image;
    trimmedUser.dob = user.dob;

    userModel.findOneAndUpdate({
      _id: user._id,
    }, {
      $set: {
        token,
      }
    });
    return successResponse(req, res, { token, user: trimmedUser }, 'User logged in successfully', 200);
  } catch (error) {
    return next(error);
  }
}

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  let user
  try {
    user = await userModel.findOne({
      email,
      isArchived: false,
    }).exec();
  } catch (error) {
    return next(error);
  }
  if (!user) {
    return errorResponse(req, res, 'User not found', 404);
  }
  if (!user.isEmailVerified) {
    return errorResponse(req, res, 'Email not verified', 400, {
      isEmailVerified: false,
    });
  }

  let trimmedUser = {
    _id: user._id,
    email: user.email,
  };
  try {
    const token = generateJWTtoken(trimmedUser, envConst.FORGOT_PASSWORD_SECRET, '5m');

    // send email
    sendEmail({
      email: user.email,
      subject: 'Password change request',
      html: `Please click on the link to change password <a href="${envConst.FRONT_URL}/${user._id}/reset-password?forgotToken=${token}">change password</a>`,
    });

    return successResponse(req, res, { trimmedUser }, 'Password change email send successfully', 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  verifyEmail,
  login,
  forgotPassword,
};

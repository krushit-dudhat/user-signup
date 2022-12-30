const userModel = require('../../models/user.model');
const { envConst } = require('../../helpers/constants');
const {
  successResponse,
  errorResponse,
  generateJWTtoken,
  encryptPassword
} = require('../../helpers/index');
const { login } = require('../auth/auth.controller');

const fetchUser = async (req, res, next) => {
  const { userId } = req.params;
  let user;
  if (userId) {
    try {
      user = await userModel.findOne({
        _id: userId,
        isArchived: false,
      }).exec();
    } catch (error) {
      return next(error);
    }

    if (!user) {
      return errorResponse(req, res, 'User not found', 404);
    }
  } else {
    user = req.user;
  }

  const trimmedUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    image: user.image,
    dob: user.dob,
    gender: user.gender,
  }
  return successResponse(req, res, trimmedUser, 'User fetched successfully', 200);
}

const updateUser = async (req, res, next) => {
  const {
    name,
    dob,
    gender
  } = req.body;
  const userObj = {
    name: req.user.name || name,
    dob: req.user.dob || dob,
    gender: req.user.gender || gender,
  };
  console.log(req.file);

  if (req.file) {
    userObj.image = req.file.path;
  }

  let user;
  try {
    user = await userModel.findOneAndUpdate({
      _id: req.user._id,
    }, {
      $set: userObj,
    }, {
      new: true,
    }).exec();
  } catch (error) {
    return next(error);
  }
  return successResponse(req, res, user, 'User updated successfully', 200);
}

const changePassword = async (req, res, next) => {
  const { password } = req.body;
  let user;
  try {
    const hashedPassword = encryptPassword(password);
    user =
      await userModel.findOneAndUpdate({
        _id: req.user._id,
      }, {
        $set: {
          password: hashedPassword,
        },
      }, {
        new: true,
      }).exec();

    req.body.email = user.email;
    await login(req, res, next);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  fetchUser,
  updateUser,
  changePassword,
};

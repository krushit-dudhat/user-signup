const userModel = require('../../models/user.model');
const { envConst } = require('../../helpers/constants');
const {
  successResponse,
  errorResponse,
  generateJWTtoken,
  encryptPassword
} = require('../../helpers/index');
const { login } = require('../auth/auth.controller');
const path = require('path');
const AWS = require('aws-sdk');
const fs = require('fs');

const uploadFile = async (
  file,
) => {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS,
      region: process.env.AWS_REGION,
    });

    let bucket = process.env.S3_BUCKET_NAME + "/profile";

    let newFilename = file.filename;
    const params = {
      Bucket: bucket,
      Key: newFilename,
      Body: fs.createReadStream("uploads/" + file.filename),
      ContentType: file.mimetype,
      ACL: "public-read",
    };
    s3.upload(params, function (err, data) {
      if (err) reject(err);
      resolve(data);
    });
  });
};

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
  return successResponse(req, res, { user: trimmedUser }, 'User fetched successfully', 200);
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
    // try {
    //   const file = await uploadFile(req.file);
    //   userObj.image = file.Location;
    //   fs.unlink('./uploads/' + req.file.filename, (err) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //   })
    // } catch (error) {
    //   console.log(error)
    //   return next(error);
    // }
    userObj.image = path.resolve(__dirname, '../..', req.file.filename);
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
  user = user.toObject();
  delete user.password;
  delete user.token;
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

const logout = async (req, res, next) => {
  let user;
  try {
    user = await findOneAndUpdate({
      _id: req.user._id,
    }, {
      $set: {
        token: null,
      },
    }).exec();
    return successResponse(req, res, {}, 'User logged out successfully', 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  fetchUser,
  updateUser,
  changePassword,
  logout,
};

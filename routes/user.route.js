const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const { fetchUser, forgotPassword, updateUser } = require('../controller/users/user.controller');
const { updateUserValidator } = require('../controller/users/user.validator');
const { authorization } = require('../middleware/jwt');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `uploads`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, `uploads`);
  },
  filename(req, file, cb) {
    cb(null, `${req.user._id}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      return cb(new Error("Only images are allowed"));
    }
  },
  limits: function (req, file, cb) {
    cb(null, { fileSize: 2000000 }); // file size limit for 2 mb
  }
});

router.get('/user/:userId', authorization, fetchUser);
router.put('/user/:userId', authorization, upload.single('profile'), updateUserValidator, updateUser);

module.exports = router;

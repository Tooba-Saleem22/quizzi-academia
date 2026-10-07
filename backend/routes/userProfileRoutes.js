const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userProfileController = require('../controller/userProfileController');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/profile', auth, userProfileController.getProfile);
router.put('/profile', auth, upload.single('profileImage'), userProfileController.updateProfile);
router.put('/change-password', auth, userProfileController.changePassword);

module.exports = router;
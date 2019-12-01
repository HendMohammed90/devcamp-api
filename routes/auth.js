const express = require('express');
const User = require('../models/User');
const {protect} = require('../middleware/auth');

const router = express.Router();
const {registerUser ,loginUser ,getMe , forgotPassword, resetPassword ,updateDetails ,updatePassword ,logOut} = require('../controllers/auth');

router.post('/register', registerUser);
router.post('/login' , loginUser);
router.post('/me' ,protect, getMe);
router.post('/forgot-password' , forgotPassword);
router.put('/resetpassword/:resettoken' , resetPassword);
router.put('/updateDetails' ,protect, updateDetails);
router.put('/updatePassword' ,protect, updatePassword);
router.get('/logout' , logOut); //Here  Should I make this Route Protected



module.exports = router;
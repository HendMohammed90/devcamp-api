const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
// @description Register a User
// Rout POST api/v1/auth/register
//Access Public
exports.registerUser = asyncHandler(async (req, res, next) => {

    const { name, email, password, role } = req.body;

    //Creat Our User 
    const user = await User.create({
        name, email, password, role
    });

    //Creat The token 
    // const token = user.getSignedJwtToken();



    // res.status(200).json({
    //     state: true,
    //     msg: `You Have Success To Registered` ,
    //     token :token
    // })


    sendToken(user, res, 200);


});

// @description Login a User
// Rout POST api/v1/auth/login
//Access Public
exports.loginUser = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    //Validate Email and password 
    if (!email || !password) {
        return next(new ErrorResponse(`Pleas Provide an email and password`, 400));
    }

    //Check for user
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        return next(new ErrorResponse(`Error in password or email`, 401));
    }

    //Check for the user password
    const isValid = await user.matchPassword(password);

    if (!isValid) {
        return next(new ErrorResponse(`Error in password or email`, 401));
    }

    // //Creat The token 
    // const token = user.getSignedJwtToken();

    // res.status(200).json({
    //     state: true,
    //     msg: `You Have Success To  Login` ,
    //     token :token
    // })

    sendToken(user, res, 200);


});



// @description Forgot the user Password
// Rout POST api/v1/auth/forgot-password 
//Access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse(`Error this email is not registered `, 404));
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken()

    console.log(resetToken);

    await user.save({ validateBeforeSave: false }); //this to prevent mongoose validation to be run 

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;


    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({ state: true, msg: `You Have Request to Reset Your password by Email sent to you ` });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }

})


// @description Get Reset The Password
// Rout PUT api/v1/auth/resetpassword/:resetToken
//Access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);

})


// @description  Get The Details of the user
// Rout GET api/v1/auth/me
//Access Privet
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        state: true,
        msg: `You Have Got Your Page`,
        data: user
    })
})

// @description  Log user Out
// Rout POST GET/v1/auth/logout
//Access Privet
exports.logOut = asyncHandler(async (req, res, next) => {
    
    res.cookie('token' , 'null' , {
        expires :  new Date(Date.now() + 10 * 1000),
        httpOnly : true
    })

    res.status(200).json({
        state: true,
        msg: `You Have Successfully Logged Out ^_-`,
        data: {}
    })
})

// @description POST update Details of the user
// Rout PUT api/v1/auth/updateDetails
//Access Privet
exports.updateDetails = asyncHandler(async (req, res, next) => {

    //Bring fields which will be updated
    const updatedFields = {
        name: req.body.name,
        email: req.body.email
    }
    //Find the user and update it's details
    const user = await User.findByIdAndUpdate(req.user.id, updatedFields, {
        new: true,
        runValidators: true
    });

    //send the result
    res.status(200).json({
        state: true,
        msg: `You Have Update your data Congratulations`,
        data: user
    })
})


// @description POST update Password of the user
// Rout PUT api/v1/auth/updatePassword
//Access Privet
exports.updatePassword = asyncHandler(async (req, res, next) => {

    //Find the user and update it's details
    const user = await User.findById(req.user.id).select('+password');


    //Check For the Current Password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    //send the result
    sendToken(user, 200, res);
})



//Creat The token & cookie and send them to the user 
const sendToken = function (user, res, statusCode) {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        state: true,
        msg: `You Have Successed`,
        token: token
    })


}


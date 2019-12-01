const User = require('../models/User');
const JWT = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');

exports.protect = async(req ,res ,next)=>{

    let token 

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
        console.log(token)
    } else if (req.cookies.token){
        token = req.cookies.token
    }

    if(!token){
        return next(new ErrorResponse(`Not Authorized to be here in this route ^_- that`, 401));
    }

    //Verifying the token
    try {
        const verifiedToken = JWT.verify(token ,process.env.JWT_SECRET);
        console.log(verifiedToken);
        req.user = await User.findById(verifiedToken.id);
        next()
    } catch (error) {
        return next(new ErrorResponse(`Not Authorized to be here in this route ^_-`, 401));
    }

}

//Guard from access to specific role 
exports.auhtorize = (...roles)=>{
    return (req ,res ,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`The User Role: ${req.user.role} is not  Authorized to be here in this route ^_-`, 401));
        }   
        next()
    }
}
